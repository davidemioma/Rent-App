package auth

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lpernett/godotenv"
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

// fetchPublicKey fetches the public key from AWS Cognito's JWKS endpoint
func fetchPublicKey(kid string) (*rsa.PublicKey, error) {
	godotenv.Load(".env")

	region := os.Getenv("AWS_REGION")

	userPoolId := os.Getenv("USER_POOL_ID")
	
    // JWKS endpoint URL
    jwksURL := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", region, userPoolId)

    // Fetch the JWKS
    resp, err := http.Get(jwksURL)

    if err != nil {
        return nil, fmt.Errorf("failed to fetch JWKS: %v", err)
    }

    defer resp.Body.Close()

    // Decode the JWKS
    var jwks struct {
        Keys []struct {
            Kid string `json:"kid"`
            N   string `json:"n"`
            E   string `json:"e"`
        } `json:"keys"`
    }

    if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
        return nil, fmt.Errorf("failed to decode JWKS: %v", err)
    }

    // Find the key with the matching kid
    for _, key := range jwks.Keys {
        if key.Kid == kid {
            // Decode the RSA public key
            nBytes, err := base64.RawURLEncoding.DecodeString(key.N)

            if err != nil {
                return nil, fmt.Errorf("failed to decode modulus: %v", err)
            }

            eBytes, err := base64.RawURLEncoding.DecodeString(key.E)

            if err != nil {
                return nil, fmt.Errorf("failed to decode exponent: %v", err)
            }

            e := int(new(big.Int).SetBytes(eBytes).Uint64())

            return &rsa.PublicKey{
                N: new(big.Int).SetBytes(nBytes),
                E: e,
            }, nil
        }
    }

    return nil, errors.New("public key not found")
}

func DecryptToken(bearer string) (*CustomClaims, error) {
	  // Parse the token without verifying the signature to extract the header
    token, _, err := new(jwt.Parser).ParseUnverified(bearer, &CustomClaims{})

    if err != nil {
        return nil, fmt.Errorf("failed to parse token: %v", err)
    }

    // Extract the kid (key ID) from the token header
    kid, ok := token.Header["kid"].(string)

    if !ok {
        return nil, errors.New("kid header not found in token")
    }

    // Fetch the public key from AWS Cognito's JWKS endpoint
    publicKey, err := fetchPublicKey(kid)

    if err != nil {
        return nil, fmt.Errorf("failed to fetch public key: %v", err)
    }

    // Parse and verify the token using the public key
    parsedToken, err := jwt.ParseWithClaims(bearer, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
        // Verify the token algorithm
        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }

        return publicKey, nil
    })

    if err != nil {
        return nil, fmt.Errorf("failed to verify token: %v", err)
    }

    // Extract the claims
    claims, ok := parsedToken.Claims.(*CustomClaims)

    if !ok {
        return nil, errors.New("invalid token claims")
    }

    return claims, nil
}