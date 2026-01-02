package repositories

import (
	"burned/database"
	"burned/models"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type SavedRecipeRepositoryInterface interface {
	SavedRecipe(saved models.SavedRecipe) (*mongo.InsertOneResult, error)
	UnsavedRecipe(id primitive.ObjectID) (*mongo.DeleteResult, error)
	GetRecipesSavedByUser(idUser primitive.ObjectID) ([]models.SavedRecipe, error)
	GetSavedCountByRecipe(idRecipe primitive.ObjectID) (int64, error)
	GetTop10MostSaved() ([]models.TopSavedRecipe, error)
}

type SavedRecipeRepository struct {
	db database.DB
}

func NewSavedRecipeRepository(db database.DB) *SavedRecipeRepository {
	return &SavedRecipeRepository{db: db}
}

func (repository *SavedRecipeRepository) SavedRecipe(saved models.SavedRecipe) (*mongo.InsertOneResult, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("SavedRecipes")
	return collection.InsertOne(context.TODO(), saved)
}

func (repository *SavedRecipeRepository) UnsavedRecipe(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("SavedRecipes")
	filter := bson.M{"_id": id}
	return collection.DeleteOne(context.TODO(), filter)
}

func (repository *SavedRecipeRepository) GetRecipesSavedByUser(idUser primitive.ObjectID) ([]models.SavedRecipe, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("SavedRecipes")
	filter := bson.M{
		"userId": idUser,
	}
	//Busca los elementos que contengas como userId el oid enviado por parametro
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return nil, err
	}
	//convertimos a model y devolvemos
	defer cursor.Close(context.Background())
	var recipes []models.SavedRecipe
	for cursor.Next(context.Background()) {
		var recipe models.SavedRecipe
		err := cursor.Decode(&recipe)
		if err != nil {
			continue
		}
		recipes = append(recipes, recipe)
	}
	return recipes, nil
}
func (repository *SavedRecipeRepository) GetSavedCountByRecipe(idRecipe primitive.ObjectID) (int64, error) {
	collection := repository.db.GetClient().
		Database("Burned").
		Collection("SavedRecipes")

	filter := bson.M{
		"recipeId": idRecipe,
	}
	//Devuelve la cantidad de Saved Recipes que contienen ese id de la receta, asi conocemos cuantas veces fue guardada
	count, err := collection.CountDocuments(context.TODO(), filter)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (repository *SavedRecipeRepository) GetTop10MostSaved() ([]models.TopSavedRecipe, error) {

	collection := repository.db.GetClient().Database("Burned").Collection("SavedRecipes")

	pipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.M{
			"_id":   "$recipeId",
			"count": bson.M{"$sum": 1},
		}}},
		{{Key: "$sort", Value: bson.M{
			"count": -1,
		}}},
		{{Key: "$limit", Value: 10}},
	}

	cursor, err := collection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var result []models.TopSavedRecipe
	if err := cursor.All(context.TODO(), &result); err != nil {
		return nil, err
	}

	return result, nil
}
