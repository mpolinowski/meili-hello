# Gatsby Blog with a MeiLi Search Backend

Serve your Gatsby.js Blog in a goFiber container and connect a Search Engine.

<!-- TOC -->

- [Gatsby Blog with a MeiLi Search Backend](#gatsby-blog-with-a-meili-search-backend)
  - [Prepare the goFiber Webserver](#prepare-the-gofiber-webserver)
    - [Building the Go App](#building-the-go-app)
  - [CI Pipeline](#ci-pipeline)
  - [Docker Compose](#docker-compose)

<!-- /TOC -->


I already looked into how to:


* [Deploy a MeiLi Search Engine with Docker](https://mpolinowski.github.io/docs/DevOps/Elasticsearch/2023-02-10--meili-rusty-elastic-docker/2023-02-10)
* [Build a Search Interface with React.js](https://mpolinowski.github.io/docs/Development/Javascript/2023-02-12-react-meili-search-starter/2023-02-12)
* [Use Gatsby.js to pre-render the React.js Interface](https://mpolinowski.github.io/docs/Development/Javascript/2023-02-13-gatsby-meili-search-starter/2023-02-13)


The next step is to wrap the pre-rendered build inside a Docker container that uses [goFiber](https://github.com/gofiber/fiber) to serve the generated static HTML/CSS/JS/JSON code.



## Prepare the goFiber Webserver

The [code for the webserver](https://github.com/mpolinowski/meili-hello/blob/master/03_gastby_frontend/docker/container/app.go) is fairly simple - very similar to Express.js:


```go
package main

import (
	"flag"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

var (
	port = flag.String("port", ":8888", "Port to listen on")
	prod = flag.Bool("prod", false, "Enable prefork in Production")
)

func main() {

	// Create fiber app

	// Development
	// app := fiber.New(fiber.Config{
	// 	Prefork: *prod, // go run app.go -prod
	// })

	// Production
	app := fiber.New(fiber.Config{
		Prefork: true,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())

	// Setup static files
	app.Static("/", "./data/public")

	// Listen on port 8888
	log.Fatal(app.Listen(*port)) // go run app.go -port=:8888
}
```

The webserver expects our static code - generated from our React.js MeiLi search interface and pre-rendered by Gatsby.js - in the `public` folder. It will then serve it on `/` with port `8888`.


### Building the Go App

We can now use Docker to build the webserver inside a [Golang Container](https://hub.docker.com/_/golang) and then transfer our website code and the build binary into a tiny [Alpine Container](https://hub.docker.com/_/alpine):  


```yml
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
```


## CI Pipeline

Now I would use a Gitlab CI pipeline to do my Gatsby.js build as well as the build described above. But this also works locally with a __npm script__ that we can add to the [package.json](https://github.com/mpolinowski/meili-hello/blob/master/03_gastby_frontend/package.json) file of our Gatsby.js app:


```js
"scripts": {
    "build": "node --max-old-space-size=8192 node_modules/gatsby/dist/bin/gatsby build",
    "develop": "node --max-old-space-size=8192 node_modules/gatsby/dist/bin/gatsby develop",
    "start": "npm run develop",
    "serve": "gatsby serve",
    "clean": "gatsby clean",
    "docker": "mv public/* docker/container/data/public && docker build -t my_blog docker/. && mv docker/container/data/public/* public"
  }
```


So now we can enter the root dir of our Gatsby.js app and execute:


```bash
npm run build
npm run docker
```


Now we have both container images ready to be served:


```bash
REPOSITORY             TAG      SIZE
my_blog                latest   23.4MB
getmeili/meilisearch   latest   258MB
```


## Docker Compose

Now we can write a `docker-compose.yml` that brings it all together for us - __Note__ that I ran into an issue here. I am building the Gatsby.js page while starting the MeiLi Search container manually (without Compose). I am connecting to the service on `localhost`. If I now use a virtual network for those container I will have to change the connection URL from `localhost:7700` to `meilisearch:7700`. But to keep this simple I just run the container on the `host` network stack here - so nothing needs to be changed:



```yml
version: '3'

services:
  meilisearch:
    container_name: meilisearch
    image: getmeili/meilisearch:latest
    environment:
      - MEILI_MASTER_KEY=RhTX1pLPSKSn7KW9yf9u_MNKC0v1YKkmx2Sc6qSwbLQ
      - MEILI_NO_ANALYTICS=true
      # - MEILI_ENV=development
      - MEILI_ENV=production
    network_mode: "host"
    # ports:
    #   - ${MEILI_PORT:-7700}:7700
    # networks:
    #   - meilisearch
    volumes:
      - /opt/meili_data:/meili_data
    restart: unless-stopped

  gatsby_frontend:
    container_name: my_blog
    image: my_blog:latest
    network_mode: "host"    
    # ports:
    #   - 8888:8888
    # networks:
    #   - meilisearch
    restart: unless-stopped

# networks:
#   meilisearch:
#     driver: bridge
```

You can now bring the application up with:


```bash
docker-compose up
```

and visit `http://localhost:8888` and should see the Gatsby.js frontend being served by your goFiber webserver connecting to your MeiLi Search backend: