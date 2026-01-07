package repositories

import (
	"burned/database"
	"burned/models"
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type RatingRepositoryInterface interface {
	RateRecipe(model models.Rating) (*mongo.InsertOneResult, error)
	UpdateRating(model models.Rating) (*mongo.UpdateResult, error)
	GetRatingByUserAndRecipe(model models.Rating) (models.Rating, error)
	GetRatingByRecipe(recipeId primitive.ObjectID) (float64, error)
}

type RatingRepository struct {
	db database.DB
}

func NewRatingRepository(db database.DB) *RatingRepository {
	return &RatingRepository{db: db}
}

func (repository *RatingRepository) RateRecipe(model models.Rating) (*mongo.InsertOneResult, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Rating")
	return collection.InsertOne(context.TODO(), model)
}

func (repository *RatingRepository) UpdateRating(model models.Rating) (*mongo.UpdateResult, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Rating")
	update := bson.M{"$set": bson.M{
		"stars":     model.Stars,
		"updatedAt": model.UpdatedAt,
	}}
	return collection.UpdateByID(context.TODO(), model.ID, update)
}

func (repository *RatingRepository) GetRatingByUserAndRecipe(model models.Rating) (models.Rating, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Rating")

	if model.UserID.IsZero() || model.RecipeID.IsZero() {
		return models.Rating{}, errors.New("userID and recipeID are required")
	}

	filter := bson.M{
		"userId":   model.UserID,
		"recipeId": model.RecipeID,
	}

	var rating models.Rating
	err := collection.FindOne(context.TODO(), filter).Decode(&rating)
	if err != nil {
		return models.Rating{}, err
	}

	return rating, nil
}

func (repository *RatingRepository) GetRatingByRecipe(recipeId primitive.ObjectID) (float64, error) {
	collection := repository.db.GetClient().Database("Burned").Collection("Rating")

	pipeline := mongo.Pipeline{
		{
			{"$match", bson.M{
				"recipeId": recipeId,
			}},
		},
		{
			{"$group", bson.M{
				"_id":   "$recipeId",
				"avg":   bson.M{"$avg": "$stars"},
				"count": bson.M{"$sum": 1},
			}},
		},
	}

	cursor, err := collection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(context.TODO())

	type result struct {
		Avg float64 `bson:"avg"`
	}

	if cursor.Next(context.TODO()) {
		var res result
		if err := cursor.Decode(&res); err != nil {
			return 0, err
		}
		return res.Avg, nil
	}

	// No hay ratings
	return 0, nil
}
