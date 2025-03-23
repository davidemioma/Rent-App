package auth

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
    jwt.RegisteredClaims
    CustomRole string `json:"custom:role"`
}

func GetBearerToken (headers http.Header) (string, error){
	val := headers.Get("Authorization")

	if val == "" {
		return "", errors.New("no header 'Authorization' found")
	}

	vals := strings.Split(val, " ")

	if len(vals) != 2 {
		return "", errors.New("invalid auth headers")
	}

	if vals[0] != "Bearer" {
		return "", errors.New("bearer token not found in auth headers")
	}

	return vals[1], nil
}

func DecryptToken(bearer string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(bearer, &CustomClaims{}, nil) 

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims)

	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}