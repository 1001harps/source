FROM golang:1.23-alpine

WORKDIR /app
COPY go.mod go.sum ./    
RUN go mod download     
COPY ./pkg ./pkg/
COPY ./cmd ./cmd/
RUN stat ./cmd/upload-api.go
RUN go build ./cmd/upload-api.go 

CMD ["./upload-api"]

