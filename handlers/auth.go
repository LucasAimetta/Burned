package handlers

import (
	"burned/auth"
	"burned/dtos"
	"burned/services"
	"context"
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthHandler struct {
	service services.UserServiceInterface
}

func NewAuthHandler(s services.UserServiceInterface) *AuthHandler {
	return &AuthHandler{service: s}
}

var googleOauthConfig = &oauth2.Config{
	RedirectURL:  "http://localhost:8080/auth/google/callback",
	ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
	Scopes: []string{
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	},
	Endpoint: google.Endpoint,
}

func (handler *AuthHandler) LogIn(c *gin.Context) {
	var req dtos.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}

	user, err := handler.service.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "user not found"})
		return
	}

	if !auth.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "invalid credentials"})
		return
	}
	oid, error := primitive.ObjectIDFromHex(user.ID)
	if error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "internal server error"})

	}
	// Generar token
	token, err := auth.GenerateToken(oid, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "error generating the token"})
		return
	}

	c.JSON(http.StatusOK, dtos.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (handler *AuthHandler) Register(c *gin.Context) {
	var request dtos.RegisterRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}
	user, err := handler.service.CreateUser(request)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": err.Error()})
		return
	}

	oid, error := primitive.ObjectIDFromHex(user.ID)
	if error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "internal server error"})

	}

	// Generar token
	token, err := auth.GenerateToken(oid, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "Error al generar el token"})
		return
	}

	c.JSON(http.StatusOK, dtos.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fallo en el intercambio"})
		return
	}

	// Obtener datos del perfil de Google
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer resp.Body.Close()

	var googleUser dtos.GoogleUserDTO
	json.NewDecoder(resp.Body).Decode(&googleUser)

	// Lógica de BD: Login o Registro
	userResponse, err := h.service.LoginOrRegisterGoogle(googleUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar usuario"})
		return
	}

	// Generar TU JWT (Persistencia)
	objID, _ := primitive.ObjectIDFromHex(userResponse.ID)
	jwtToken, err := auth.GenerateToken(objID, userResponse.Email, userResponse.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar token"})
		return
	}

	// Devolver el token al frontend
	// El frontend debería guardar esto en LocalStorage o una Cookie
	c.JSON(http.StatusOK, gin.H{
		"token": jwtToken,
		"user":  userResponse,
	})
}

func (handler *AuthHandler) GoogleLogin(c *gin.Context) {
	//  Definimos un "state". En producción, esto debería ser un string aleatorio
	// guardado en una cookie para evitar ataques CSRF.
	// Por ahora, usaremos uno fijo para probar.
	state := "random-state-string"

	//  Generamos la URL de Google con nuestros parámetros (ID, Scopes, RedirectURL)
	url := googleOauthConfig.AuthCodeURL(state)

	//  Redirigimos al usuario a esa URL
	c.Redirect(http.StatusTemporaryRedirect, url)
}
