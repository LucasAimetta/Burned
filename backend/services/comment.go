package services

import (
	"burned/backend/dtos"
	"burned/backend/models"
	"burned/backend/repositories"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CommentServiceInterface interface {
	CreateComment(comment dtos.CommentRequest, idUser string) (dtos.CommentResponse, error)
	DeleteComment(commentId string, requesterId string, requesterRole string) error
	GetCommentsByRecipe(recipeId string) ([]dtos.CommentResponse, error)
	GetCommentsById(Id string) (dtos.CommentResponse, error)
}

type CommentService struct {
	commentRepo repositories.CommentRepositoryInterface
	userRepo    repositories.UserRepositoryInterface
}

func NewCommentService(repo repositories.CommentRepositoryInterface, userRepo repositories.UserRepositoryInterface) *CommentService {
	return &CommentService{commentRepo: repo, userRepo: userRepo}
}

func (service *CommentService) CreateComment(comment dtos.CommentRequest, idUser string) (dtos.CommentResponse, error) {
	userOid, err := primitive.ObjectIDFromHex(idUser)
	if err != nil {
		return dtos.CommentResponse{}, errors.New("invalid id")
	}
	user, err := service.userRepo.GetUserById(userOid)
	if err != nil {
		return dtos.CommentResponse{}, errors.New("user not found")
	}
	recipeOid, err := primitive.ObjectIDFromHex(comment.RecipeID)
	if err != nil {
		return dtos.CommentResponse{}, errors.New("invalid id")
	}

	var model models.Comment
	model.CreatedAt = time.Now()
	model.RecipeID = recipeOid
	model.UserID = userOid
	model.UserName = user.Name
	model.Text = comment.Text

	result, err := service.commentRepo.CreateComment(model)
	if err != nil {
		return dtos.CommentResponse{}, errors.New("internal server error")
	}

	response := dtos.CommentModelToResponse(model)
	insertedOid, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return dtos.CommentResponse{}, errors.New("invalid id")
	}
	response.ID = insertedOid.String()
	return response, nil
}
func (service *CommentService) DeleteComment(commentId string, requesterId string, requesterRole string) error {
	commentOid, err := primitive.ObjectIDFromHex(commentId)
	if err != nil {
		return errors.New("invalid id")
	}
	userOid, err := primitive.ObjectIDFromHex(commentId)
	if err != nil {
		return errors.New("invalid id")
	}

	comment, err := service.commentRepo.GetCommentsById(commentOid)
	if err != nil {
		return errors.New("comment not found")
	}

	isOwner := comment.UserID == userOid
	isAdmin := requesterRole == "admin"

	if !isAdmin && !isOwner {
		return errors.New("unauthorized to delete this comment")
	}
	result, err := service.commentRepo.DeleteComment(commentOid)
	if result.DeletedCount == 0 {
		return errors.New("comment not found")
	}
	return nil
}
func (service *CommentService) GetCommentsByRecipe(recipeId string) ([]dtos.CommentResponse, error) {
	commentOid, err := primitive.ObjectIDFromHex(recipeId)
	if err != nil {
		return []dtos.CommentResponse{}, errors.New("invalid id")
	}
	result, err := service.commentRepo.GetCommentsByRecipe(commentOid)
	if err != nil {
		return []dtos.CommentResponse{}, errors.New("internal server error")
	}

	var comments []dtos.CommentResponse
	for _, comment := range result {
		comments = append(comments, dtos.CommentModelToResponse(comment))
	}
	return comments, nil

}

func (service *CommentService) GetCommentsById(Id string) (dtos.CommentResponse, error) {
	commentId, err := primitive.ObjectIDFromHex(Id)
	if err != nil {
		return dtos.CommentResponse{}, errors.New("invalid id")
	}
	result, err := service.commentRepo.GetCommentsById(commentId)
	if err != nil {
		return dtos.CommentResponse{}, errors.New("internal server error")
	}
	return dtos.CommentModelToResponse(result), nil
}
