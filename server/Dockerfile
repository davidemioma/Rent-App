FROM golang:1.23-alpine

RUN apk add --no-cache git curl

WORKDIR /app

# Copy go mod and sum files
# COPY server/go.mod server/go.sum ./
COPY server/go.mod ./

# Download dependencies
WORKDIR /app

RUN go mod download

# Copy the entire project
COPY server/. .

# Enable live reloading for development
RUN go install github.com/air-verse/air@latest

# Expose port for the service
EXPOSE 8080

# Use air for live reloading
CMD ["air", "-c", ".air.toml"]