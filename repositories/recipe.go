package repositories

import (
	"burned/database"
	"burned/dtos"
	"burned/models"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type RecipeRepositoryInterface interface {
	CreateRecipe(recipe models.Recipe) (*mongo.InsertOneResult, error)
	UpdateRecipe(recipe models.Recipe) (*mongo.UpdateResult, error)
	DeleteRecipe(id primitive.ObjectID) (*mongo.DeleteResult, error)
	GetRecipes(filters dtos.RecipeSearchRequest) ([]models.Recipe, error)
	GetRecipeById(id primitive.ObjectID) (models.Recipe, error)
	GetRecipesByUser(id primitive.ObjectID) ([]models.Recipe, error)
}

type RecipeRepository struct {
	db              database.DB
	savedRecipeRepo SavedRecipeRepositoryInterface
}

func NewRecipeRepository(db database.DB, savedRecipeRepo SavedRecipeRepositoryInterface) *RecipeRepository {
	return &RecipeRepository{
		db:              db,
		savedRecipeRepo: savedRecipeRepo,
	}
}

func (repository *RecipeRepository) CreateRecipe(recipe models.Recipe) (*mongo.InsertOneResult, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Recipe")
	return collection.InsertOne(context.TODO(), recipe)
}

func (repository *RecipeRepository) UpdateRecipe(recipe models.Recipe) (*mongo.UpdateResult, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Recipe")
	filter := bson.M{"_id": recipe.ID}
	update := bson.M{"$set": bson.M{
		"title":          recipe.Title,
		"description":    recipe.Description,
		"visibility":     recipe.Visibility,
		"totalTime":      recipe.TotalTime,
		"step":           recipe.Step,
		"dificultyLevel": recipe.DificultyLevel,
		"tags":           recipe.Tags,
		"ingredients":    recipe.Ingredients,
		"image":          recipe.Image,
		"updatedAt":      recipe.UpdatedAt,
	}}
	return collection.UpdateOne(context.TODO(), filter, update)
}

func (repository *RecipeRepository) DeleteRecipe(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Recipe")
	filter := bson.M{"_id": id}
	return collection.DeleteOne(context.TODO(), filter)
}

func (repository *RecipeRepository) GetRecipes(filters dtos.RecipeSearchRequest) ([]models.Recipe, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Recipe")
	//verificamos si envio los parametros para filtrar y agregamos el filtro al map de filtros
	filtersMap := bson.M{}
	if filters.Description != "" {
		filtersMap["description"] = bson.M{"$regex": filters.Description, "$options": "i"}
	}
	if filters.DificultyLevel != "" {
		filtersMap["dificultyLevel"] = bson.M{"$regex": filters.DificultyLevel, "$options": "i"}
	}
	if filters.Title != "" {
		filtersMap["title"] = bson.M{"$regex": filters.Title, "$options": "i"}
	}
	if filters.TotalTime != 0 {
		filtersMap["totalTime"] = bson.M{"$gte": filters.TotalTime}
	}
	if filters.Visibility != "" {
		filtersMap["visibility"] = bson.M{"$regex": filters.Visibility, "$options": "i"}
	}
	//Busqueda de las recetas que contengan los ingredientes que envio
	//Si tienen algun elemento
	if len(filters.Ingredients) > 0 {
		var allConditions []bson.M
		//Se crea un array de filtros, estos filtros son por parcialidad en el nombre
		for _, ing := range filters.Ingredients {
			allConditions = append(allConditions, bson.M{
				"$elemMatch": bson.M{
					"name": bson.M{
						"$regex":   ing,
						"$options": "i",
					},
				},
			})
		}
		//Agrega al map original, el filtro por ingredientes y solo obtiene aquellas recetas que contengan TODOS los
		filtersMap["ingredients"] = bson.M{
			"$all": allConditions,
		}
	}

	cursor, err := collection.Find(context.TODO(), filtersMap)
	if err != nil {
		return nil, err
	}

	defer cursor.Close(context.Background())
	var recipes []models.Recipe
	for cursor.Next(context.Background()) {
		var recipe models.Recipe
		err := cursor.Decode(&recipe)
		if err != nil {
			continue
		}
		recipes = append(recipes, recipe)
	}
	return recipes, nil
}

func (repository *RecipeRepository) GetRecipeById(id primitive.ObjectID) (models.Recipe, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Recipe")
	filter := bson.M{"_id": id}
	var recipe models.Recipe
	err := collection.FindOne(context.TODO(), filter).Decode(&recipe)
	if err != nil {
		return models.Recipe{}, err
	}
	return recipe, nil
}

func (repository *RecipeRepository) GetRecipesByUser(id primitive.ObjectID) ([]models.Recipe, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Recipe")
	filter := bson.M{"userId": id}

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return nil, err
	}

	defer cursor.Close(context.Background())
	var recipes []models.Recipe
	for cursor.Next(context.Background()) {
		var recipe models.Recipe
		err := cursor.Decode(&recipe)
		if err != nil {
			continue
		}
		recipes = append(recipes, recipe)
	}
	return recipes, nil
}

func (repository *RecipeRepository) GetRecipesSavedByUser(id primitive.ObjectID) ([]models.Recipe, error) {
	saved, err := repository.savedRecipeRepo.GetRecipesSavedByUser(id)
	if err != nil {
		return nil, err
	}
	var recipes []models.Recipe
	for i := 0; i < len(saved); i++ {
		recipe, err := repository.GetRecipeById(saved[i].ID)
		if err != nil {
			return nil, err
		}
		recipes = append(recipes, recipe)
	}

	return recipes, nil
}
