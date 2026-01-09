package main

import (
	"burned/database"
	"burned/handlers"
	"burned/middlewares"
	"burned/repositories"
	"burned/services"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	router             *gin.Engine
	SavedRecipeHandler *handlers.SavedRecipeHandler
	RecipeHandler      *handlers.RecipeHandler
	UserHandler        *handlers.UserHandler
	AuthHandler        *handlers.AuthHandler
	RatingHandler      *handlers.RatingHandler
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error cargando el archivo .env")
	}
	router = gin.Default()

	// CONFIGURACIÓN DE CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	dependencies()
	mappingRoutes()
	log.Println("Servidor iniciado en http://localhost:8080")
	router.Run(":8080")

}

func dependencies() {
	var db database.DB

	var (
		userRepo        repositories.UserRepositoryInterface
		recipeRepo      repositories.RecipeRepositoryInterface
		savedRecipeRepo repositories.SavedRecipeRepositoryInterface
		ratingRepo      repositories.RatingRepositoryInterface
	)

	var (
		userService        services.UserServiceInterface
		recipeService      services.RecipeServiceInterface
		savedRecipeService services.SavedRecipeServiceInterface
		ratingService      services.RatingServiceInterface
	)

	// Conexión a base de datos
	db = database.NewMongoDB()

	// Repositorios
	userRepo = repositories.NewUserRepository(db)
	savedRecipeRepo = repositories.NewSavedRecipeRepository(db)
	recipeRepo = repositories.NewRecipeRepository(db, savedRecipeRepo)
	ratingRepo = repositories.NewRatingRepository(db)

	// Servicios
	userService = services.NewUserService(userRepo)
	recipeService = services.NewRecipeService(recipeRepo)
	savedRecipeService = services.NewSavedRecipeService(savedRecipeRepo)
	ratingService = services.NewRatingService(ratingRepo, recipeRepo)

	// Handlers
	AuthHandler = handlers.NewAuthHandler(userService)
	RecipeHandler = handlers.NewRecipeHandler(recipeService)
	SavedRecipeHandler = handlers.NewSavedRecipeHandler(savedRecipeService)
	UserHandler = handlers.NewUserHandler(userService)
	RatingHandler = handlers.NewRatingHandler(ratingService)
}

func mappingRoutes() {
	//RUTAS PUBLICAS	(Invitados)
	router.POST("/login", AuthHandler.LogIn)
	router.POST("/register", AuthHandler.Register)

	router.GET("/recipes", RecipeHandler.GetRecipes)
	router.GET("/recipes/:id", RecipeHandler.GetRecipeById)
	router.GET("/recipes/top", SavedRecipeHandler.GetTop10MostSaved)
	router.GET("/recipes/count/:id", SavedRecipeHandler.GetSavedCountByRecipe)

	router.POST("/get-rate/:id", RatingHandler.GetRatingByRecipe)

	router.GET("/auth/google/login", AuthHandler.GoogleLogin)
	router.GET("/auth/google/callback", AuthHandler.GoogleCallback)

	// RUTAS PRIVADAS (Requieren autenticación)
	priv := router.Group("/")
	priv.Use(middlewares.AuthMiddleware())
	{
		priv.PUT("/user", UserHandler.UpdateUser)
		priv.PUT("/user/password", UserHandler.UpdatePassword)
		priv.DELETE("/user", UserHandler.DeleteUser)
		priv.GET("/user/me", UserHandler.GetUserById)
		priv.GET("/user/name/:name", UserHandler.GetUserByName)
		priv.GET("/user/email/:email", UserHandler.GetUserByEmail)

		priv.POST("/recipes", RecipeHandler.CreateRecipe)
		priv.PUT("/recipes", RecipeHandler.UpdateRecipe)
		priv.DELETE("/recipes/:id", RecipeHandler.DeleteRecipe)
		priv.GET("/user/recipes", RecipeHandler.GetRecipesByUser)

		priv.POST("/saved-recipes", SavedRecipeHandler.SavedRecipe)
		priv.DELETE("/saved-recipes/:id", SavedRecipeHandler.UnsavedRecipe)
		priv.GET("/saved-recipes", SavedRecipeHandler.GetRecipesSavedByUser)

		priv.POST("/rate-recipe/:id", RatingHandler.RateRecipe)
	}
}
