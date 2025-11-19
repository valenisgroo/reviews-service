import swaggerJSDoc from 'swagger-jsdoc'

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservicio de Reseñas',
      version: '1.0.0',
      description: 'Documentación de la API de Reseñas usando Swagger',
    },
    servers: [
      {
        url: 'http://localhost:5555',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Reviews',
      },
      {
        name: 'Products',
      },
      {
        name: 'Admin',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

export default swaggerSpec
