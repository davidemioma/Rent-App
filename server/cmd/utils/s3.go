package utils

import (
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/lpernett/godotenv"
)

func UploadToS3(bucket string, key string, body io.ReadSeeker) (error) {
	envErr := godotenv.Load(".env")

	if envErr != nil {
	    log.Fatal("Error loading .env file")
	}

	sess, err := session.NewSession(&aws.Config{
        Region: aws.String("eu-west-2"),
    })

	if err != nil {
		fmt.Printf("Could not create AWS session: %v\n", err)

        return err
    }

	svc := s3.New(sess)

	// Upload the object to S3
	_, reqErr := svc.PutObject(&s3.PutObjectInput{
        Bucket: aws.String(bucket),
        Key:    aws.String(key),
        Body:   body,
    })

	if reqErr != nil {
		fmt.Printf("UploadToS3(PutObjectRequest) Error: %v\n", reqErr)

        return fmt.Errorf("failed to create PutObjectRequest: %v", reqErr)
    }

	return nil
}

func DeleteObjectFromS3(bucket string, key string) error {
    envErr := godotenv.Load(".env")

	if envErr != nil {
	    log.Fatal("Error loading .env file")
	}

    sess, sessErr := session.NewSession(&aws.Config{
        Region: aws.String("eu-west-2"),
    })

	if sessErr != nil {
		fmt.Printf("Could not create AWS session (DeleteObjectFromS3): %v\n", sessErr)

        return sessErr
    }

    svc := s3.New(sess)

    // Delete the object
    _, err := svc.DeleteObject(&s3.DeleteObjectInput{
        Bucket: aws.String(bucket),
        Key:    aws.String(key),
    })

    if err != nil {
        fmt.Printf("DeleteObjectFromS3(DeleteObject) Error: %v\n", err)

        return err
    }

    // Wait until the object is deleted
    wait_err := svc.WaitUntilObjectNotExists(&s3.HeadObjectInput{
        Bucket: aws.String(bucket),
        Key:    aws.String(key),
    })

    if wait_err != nil {
        fmt.Printf("WaitUntilObjectNotExists Error: %v\n", err)

        return wait_err
    }

    return nil
}
   