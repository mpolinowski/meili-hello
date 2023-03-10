# Building the binary of the App
FROM golang:alpine AS build

# Project labels
LABEL maintainer="m.polinowski@gmail.com"

# `build` can be replaced with your project name
WORKDIR /go/src/build

# Copy all the Code and stuff to compile everything
COPY ./container/* ./

# Downloads all the dependencies in advance (could be left out, but it's more clear this way)
RUN go mod download

# Builds the application as a staticly linked one, to allow it to run on alpine
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o app .

# Moving the binary to the 'final Image' to make it smaller
FROM alpine:latest

WORKDIR /app

# Create the `public` dir and copy all the assets into it
RUN mkdir ./data
COPY ./container/data ./data

# `build` can be replaced here as well
COPY --from=build /go/src/build/app .

# Exposes port 8888 because our program listens on that port
EXPOSE 8888

# CMD ["./app"]
RUN chmod +x ./data/run.sh
CMD ["ash", "./data/run.sh"]