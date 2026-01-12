package handlers

import (
	"burned/backend/dtos"
	"burned/backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RecipeHandler struct {
	service services.RecipeServiceInterface
}

func NewRecipeHandler(s services.RecipeServiceInterface) *RecipeHandler {
	return &RecipeHandler{service: s}
}

func (handler *RecipeHandler) CreateRecipe(c *gin.Context) {
	var req dtos.RecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User unauthorized"})
		return
	}
	userIdStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "Invalid user id type"})
		return
	}
	result, err := handler.service.CreateRecipe(req, userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, result)
}

func (handler *RecipeHandler) UpdateRecipe(c *gin.Context) {
	var req dtos.RecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User unauthorized"})
		return
	}
	userIdStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "Invalid user id type"})
		return
	}
	result, err := handler.service.UpdateRecipe(req, userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, result)
}

func (handler *RecipeHandler) DeleteRecipe(c *gin.Context) {
	id := c.Param("id")

	err := handler.service.DeleteRecipe(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, gin.H{"Result": "It was successfully deleted"})

}

func (handler *RecipeHandler) GetRecipes(c *gin.Context) {
	var req dtos.RecipeSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	result, err := handler.service.GetRecipes(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, result)
}

func (handler *RecipeHandler) GetRecipesByUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User unauthorized"})
		return
	}
	userIdStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user id type"})
		return
	}

	result, err := handler.service.GetRecipesByUser(userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, result)
}

func (handler *RecipeHandler) GetRecipeById(c *gin.Context) {
	id := c.Param("id")

	result, err := handler.service.GetRecipeById(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, result)
}
