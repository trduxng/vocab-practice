# Stage 1: Build binary
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /gateway ./cmd/gateway

# Stage 2: Dev with hot-reload (air)
FROM golang:1.22-alpine AS dev
RUN go install github.com/air-verse/air@latest
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["air"]

# Stage 3: Production (small image)
FROM alpine:3.19 AS prod
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /gateway .
EXPOSE 8080
CMD ["./gateway"]
