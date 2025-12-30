package dtos

import "time"

type SavedRecipeRequest struct {
	RecipeID string `json:"recipeId"`
}

type SavedRecipeResponse struct {
	RecipeID string    `json:"recipeId"`
	SavedAt  time.Time `json:"createdAt"`
}
