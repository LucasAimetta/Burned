package services

import (
	"burned/auth"
	"burned/dtos"
	"burned/repositories"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserServiceInterface interface {
	CreateUser(user dtos.RegisterRequest) (dtos.UserResponse, error)
	UpdateUser(user dtos.RegisterRequest, id string) (dtos.UserResponse, error)
	UpdatePassword(id string, password dtos.UpdatePasswordRequest) (dtos.UserResponse, error)
	DeleteUser(id string) error
	GetUserById(id string) (dtos.UserResponse, error)
	GetUserByEmail(email string) (dtos.UserResponse, error)
	GetUserByName(name string) (dtos.UserResponse, error)
}

type UserService struct {
	repo repositories.UserRepositoryInterface
}

func NewUserService(r repositories.UserRepositoryInterface) *UserService {
	return &UserService{repo: r}
}

func (service *UserService) CreateUser(user dtos.RegisterRequest) (dtos.UserResponse, error) {
	//verificamos la validez de la contraseña (largo, y caracteres)
	if !auth.ValidatePassword(user.Password) {
		return dtos.UserResponse{}, errors.New("password does not meet the security requirements")
	}
	//verificamos que no exista otro usuario con dicho email
	if _, verifyEmail := service.repo.GetUserByEmail(user.Email); verifyEmail == nil {
		return dtos.UserResponse{}, errors.New("email is already in use")
	}
	//verificamos que no haya otro usuario con dicho nombre
	if _, verifyName := service.repo.GetUserByName(user.Name); verifyName == nil {
		return dtos.UserResponse{}, errors.New("name is already in use")
	}
	//hasheamos la contraseña para guardarla en la bdd
	password, err := auth.HashPassword(user.Password)
	if err != nil {
		return dtos.UserResponse{}, errors.New("internal server error")
	}

	model := dtos.UserRequestToModel(user)
	model.HashedPassword = password
	model.CreatedAt = time.Now()
	//asignamos el rol de usuario, (de administrador lo asignamos en la bdd)
	model.Role = "user"
	result, err := service.repo.CreateUser(model)
	if err != nil {
		return dtos.UserResponse{}, err
	}
	response := dtos.UserModelToResponse(model)
	//obtenemos el id del usuario en la bdd para devolverlo al usuario
	insertedOid, ok := result.InsertedID.(primitive.ObjectID)
	if ok {
		response.ID = insertedOid.Hex()
	}
	return response, nil
}

func (service *UserService) UpdateUser(user dtos.RegisterRequest, id string) (dtos.UserResponse, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return dtos.UserResponse{}, err
	}
	//verificamos que no haya otro usuario con dicho nombre
	if _, verifyName := service.repo.GetUserByName(user.Name); verifyName == nil {
		return dtos.UserResponse{}, errors.New("name is already in use")
	}
	model := dtos.UserRequestToModel(user)
	model.ID = oid
	model.UpdatedAt = time.Now()
	_, err = service.repo.UpdateUser(model)
	if err != nil {
		return dtos.UserResponse{}, err
	}
	responseDto := dtos.UserModelToResponse(model)
	responseDto.Password, err = auth.HashPassword(user.Password)
	if err != nil {
		return dtos.UserResponse{}, err
	}

	return responseDto, nil
}

func (service *UserService) UpdatePassword(id string, password dtos.UpdatePasswordRequest) (dtos.UserResponse, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return dtos.UserResponse{}, errors.New("internal server error")
	}
	//verificamos que exista el usuario
	model, err := service.repo.GetUserById(oid)
	if err != nil {
		return dtos.UserResponse{}, errors.New("user not found")
	}
	//verificamos que la nueva contraseña sea valida
	if !auth.ValidatePassword(password.Password) {
		return dtos.UserResponse{}, errors.New("password does not meet the security requirements")
	}
	if auth.CheckPasswordHash(password.Password, model.HashedPassword) {
		return dtos.UserResponse{}, errors.New("the new password cannot be the same as the current one") //Si es true, esta tratando de cambiar la contraseña por la misma que estaba guardada
	}
	//hasheamos la contraseña y la guadamos en la bdd
	password.Password, err = auth.HashPassword(password.Password)
	if err != nil {
		return dtos.UserResponse{}, errors.New("internal server error")
	}
	_, err = service.repo.UpdatePassword(model, password.Password)
	if err != nil {
		return dtos.UserResponse{}, errors.New("internal server error")
	}
	return dtos.UserModelToResponse(model), nil
}

func (service *UserService) GetUserById(id string) (dtos.UserResponse, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return dtos.UserResponse{}, err
	}
	result, err := service.repo.GetUserById(oid)
	if err != nil {
		return dtos.UserResponse{}, err
	}
	return dtos.UserModelToResponse(result), nil
}

func (service *UserService) GetUserByEmail(email string) (dtos.UserResponse, error) {
	result, err := service.repo.GetUserByEmail(email)
	if err != nil {
		return dtos.UserResponse{}, err
	}
	return dtos.UserModelToResponse(result), nil
}

func (service *UserService) GetUserByName(name string) (dtos.UserResponse, error) {
	result, err := service.repo.GetUserByName(name)
	if err != nil {
		return dtos.UserResponse{}, err
	}
	return dtos.UserModelToResponse(result), nil
}

func (service *UserService) DeleteUser(id string) error {
	oid, ok := primitive.ObjectIDFromHex(id)
	if ok != nil {
		return errors.New("invalid id")
	}
	//verificamos la cantidad de documentos eliminados, si es 0 ha habido error
	result, err := service.repo.DeleteUser(oid)
	if result.DeletedCount == 0 {
		return errors.New("user not found")
	}
	return err
}
