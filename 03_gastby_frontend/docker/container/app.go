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
