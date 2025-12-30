package dtos

import (
	"burned/models"
	"time"
)

type RecipeRequest struct {
	Title          string              `json:"title" binding:"required,min=3,max=120"`
	Description    string              `json:"description" binding:"required,min=3,max=350"`
	Visibility     string              `json:"visibility" binding:"required,oneof=public private"`
	TotalTime      int                 `json:"totalTime" binding:"required,gte=0,lte=100000"`
	Step           []models.Step       `json:"step" binding:"required,min=1,dive"`
	DificultyLevel string              `json:"dificultyLevel" binding:"required,oneof=easy medium hard"`
	Tags           []string            `json:"tags" binding:"omitempty,max=20,dive,min=1,max=30"`
	Ingredients    []models.Ingredient `json:"ingredients" binding:"required,min=1,dive"`
	Image          string              `json:"image" binding:"omitempty,max=2000"` // URL (por ahora)
}

type RecipeResponse struct {
	Title          string              `json:"title" binding:"required,min=3,max=120"`
	Description    string              `json:"description" binding:"required,min=3,max=350"`
	Visibility     string              `json:"visibility" binding:"required,oneof=public private"`
	TotalTime      int                 `json:"totalTime" binding:"required,gte=0,lte=100000"`
	Step           []models.Step       `json:"step" binding:"required,min=1,dive"`
	DificultyLevel string              `json:"dificultyLevel" binding:"required,oneof=easy medium hard"`
	Tags           []string            `json:"tags" binding:"omitempty,max=20,dive,min=1,max=30"`
	Ingredients    []models.Ingredient `json:"ingredients" binding:"required,min=1,dive"`
	Image          string              `json:"image" binding:"omitempty,max=2000"` // URL (por ahora)
	CreatedAt      time.Time           `json:"createdAt"`
	ID             string              `json:"id"`
}

type RecipeSearchRequest struct {
	Title          string              `json:"title" binding:"required,min=3,max=120"`
	Description    string              `json:"description" binding:"required,min=3,max=350"`
	Visibility     string              `json:"visibility" binding:"required,oneof=public private"`
	TotalTime      int                 `json:"totalTime" binding:"required,gte=0,lte=100000"`
	DificultyLevel string              `json:"dificultyLevel" binding:"required,oneof=easy medium hard"`
	Ingredients    []models.Ingredient `json:"ingredients" binding:"required,min=1,dive"`
}

func RecipeRequestToModel(dto RecipeRequest) models.Recipe {
	var model models.Recipe
	model.CreatedAt = time.Now()
	model.DificultyLevel = dto.DificultyLevel
	model.Image = dto.Image
	model.Tags = dto.Tags
	model.Visibility = dto.Visibility
	model.Ingredients = dto.Ingredients
	model.Step = dto.Step
	model.TotalTime = dto.TotalTime
	model.Title = dto.Title
	model.Description = dto.Description
	return model
}

func RecipeModelToResponse(model models.Recipe) RecipeResponse {
	var response RecipeResponse
	response.CreatedAt = model.CreatedAt
	response.ID = model.ID.Hex()
	response.DificultyLevel = model.DificultyLevel
	response.Image = model.Image
	response.Tags = model.Tags
	response.Visibility = model.Visibility
	response.Ingredients = model.Ingredients
	response.Step = model.Step
	response.TotalTime = model.TotalTime
	response.Title = model.Title
	response.Description = model.Description
	return response
}
