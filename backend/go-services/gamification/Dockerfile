# ==================== Builder Stage ====================
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Build source
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o gamification-service -ldflags="-s -w" .

# ==================== Runtime Stage ====================
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/gamification-service .

EXPOSE 3002

CMD ["./gamification-service"]
