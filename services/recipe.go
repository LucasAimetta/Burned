package services

import (
	"burned/dtos"
	"burned/repositories"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RecipeServiceInterface interface {
	CreateRecipe(recipe dtos.RecipeRequest, idUser string) (dtos.RecipeResponse, error)
	UpdateRecipe(recipe dtos.RecipeRequest, idUser string) (dtos.RecipeResponse, error)
	DeleteRecipe(id string) error
	GetRecipes(filters dtos.RecipeSearchRequest) ([]dtos.RecipeResponse, error)
	GetRecipeById(id string) (dtos.RecipeResponse, error)
	GetRecipesByUser(id string) ([]dtos.RecipeResponse, error)
}

type RecipeService struct {
	repo repositories.RecipeRepositoryInterface
}

func NewRecipeService(repo repositories.RecipeRepositoryInterface) *RecipeService {
	return &RecipeService{repo: repo}
}

func (service *RecipeService) CreateRecipe(recipe dtos.RecipeRequest, idUser string) (dtos.RecipeResponse, error) {
	//Verifica validez de parametros
	if recipe.Description == "" || recipe.DificultyLevel == "" || recipe.Ingredients == nil || recipe.Step == nil || recipe.Title == "" || recipe.TotalTime <= 0 || recipe.Visibility == "" {
		return dtos.RecipeResponse{}, errors.New("data entered incorrectly")
	}
	oid, err := primitive.ObjectIDFromHex(idUser)
	if err != nil {
		return dtos.RecipeResponse{}, errors.New("invalid id")
	}
	recipeModel := dtos.RecipeRequestToModel(recipe)
	recipeModel.CreatedAt = time.Now()
	recipeModel.UserID = oid
	//añade el id en la bdd al objeto para devolverlo al usuario
	insertedRecipe, err := service.repo.CreateRecipe(recipeModel)
	oid, ok := insertedRecipe.InsertedID.(primitive.ObjectID)
	if !ok {
		return dtos.RecipeResponse{}, errors.New("invalid id")
	}
	recipeModel.ID = oid
	recipeResponse := dtos.RecipeModelToResponse(recipeModel)
	return recipeResponse, nil
}

func (service *RecipeService) UpdateRecipe(recipe dtos.RecipeRequest, id string) (dtos.RecipeResponse, error) {
	//Verifica validez de parametros
	if recipe.Description == "" || recipe.DificultyLevel == "" || recipe.Ingredients == nil || recipe.Step == nil || recipe.Title == "" || recipe.TotalTime <= 0 || recipe.Visibility == "" {
		return dtos.RecipeResponse{}, errors.New("data entered incorrectly")
	}
	oid, ok := primitive.ObjectIDFromHex(id)
	if ok != nil {
		return dtos.RecipeResponse{}, errors.New("invalid id")
	}
	recipeModel := dtos.RecipeRequestToModel(recipe)
	recipeModel.UpdatedAt = time.Now()
	recipeModel.ID = oid

	_, err := service.repo.UpdateRecipe(recipeModel)
	if err != nil {
		return dtos.RecipeResponse{}, err
	}
	recipeResponse := dtos.RecipeModelToResponse(recipeModel)
	return recipeResponse, nil
}

func (service *RecipeService) DeleteRecipe(id string) error {
	oid, ok := primitive.ObjectIDFromHex(id)
	if ok != nil {
		return errors.New("invalid id")
	}
	//verificamos la cantidad de documentos eliminados, si es 0 ha habido error
	result, err := service.repo.DeleteRecipe(oid)
	if result.DeletedCount == 0 {
		return errors.New("recipe not found")
	}
	return err
}

func (service *RecipeService) GetRecipes(filters dtos.RecipeSearchRequest) ([]dtos.RecipeResponse, error) {
	result, err := service.repo.GetRecipes(filters)
	if err != nil {
		return []dtos.RecipeResponse{}, errors.New("recipes not found")
	}
	var recipes []dtos.RecipeResponse
	for _, recipe := range result {
		recipes = append(recipes, dtos.RecipeModelToResponse(recipe))
	}
	return recipes, nil
}

func (service *RecipeService) GetRecipeById(id string) (dtos.RecipeResponse, error) {
	oid, ok := primitive.ObjectIDFromHex(id)
	if ok != nil {
		return dtos.RecipeResponse{}, errors.New("invalid id")
	}
	result, err := service.repo.GetRecipeById(oid)
	if err != nil {
		return dtos.RecipeResponse{}, err
	}
	response := dtos.RecipeModelToResponse(result)
	return response, nil

}
func (service *RecipeService) GetRecipesByUser(id string) ([]dtos.RecipeResponse, error) {
	oid, ok := primitive.ObjectIDFromHex(id)
	if ok != nil {
		return []dtos.RecipeResponse{}, errors.New("invalid id")
	}
	result, err := service.repo.GetRecipesByUser(oid)
	if err != nil {
		return []dtos.RecipeResponse{}, errors.New("recipes not found")
	}
	var recipes []dtos.RecipeResponse
	for _, recipe := range result {
		recipes = append(recipes, dtos.RecipeModelToResponse(recipe))
	}
	return recipes, nil
}
