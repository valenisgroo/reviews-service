# Microservicio de Reseñas

**Autor:** Valentino Isgró  
**Legajo:** 50438  
**Universidad:** Universidad Tecnológica Nacional (UTN)  
**Materia:** Arquitectura de Microservicios  
**Año:** 2025

## Descripción

Este microservicio forma parte de una arquitectura de microservicios diseñada para gestionar las reseñas y calificaciones de productos en un sistema de e-commerce.

## Características Principales

- **CRUD de reseñas**: Crear, leer, actualizar y eliminar reseñas
- **Autenticación JWT**: Validación de tokens con cache y invalidación automática
- **Control de estado**: Workflow de aprobación de reseña (pendiente, moderada, aceptada o rechazada)

### Tecnologías Utilizadas

- **Node.js** con **Express.js**: Framework principal
- **MongoDB** con **Mongoose**: Base de datos NoSQL
- **RabbitMQ** con **amqplib**: Mensajería asíncrona
- **JWT**: Autenticación y autorización
- **NodeCache**: Cache en memoria
- **Dotenv**: Gestión de variables de entorno

## Configuración

### Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```env
# Puerto del servidor
PORT=3003

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/reviews_db

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
LOGOUT_QUEUE=logout_notifications
REVIEW_EVENTS_QUEUE=review_events

# Servicio de autenticación
AUTH_SERVICE_URL=http://localhost:3001

# JWT
JWT_SECRET=your_jwt_secret_key

# Cache
CACHE_TTL=300

# Configuración de paginación
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

## Instalación y Ejecución

### Prerrequisitos

- Node.js v16 o superior
- MongoDB v4.4 o superior
- RabbitMQ v3.8 o superior

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd microservicio-reviews

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar la aplicación
npm run dev
```

## Autor

Desarrollado como parte del sistema de microservicios para e-commerce.

## Licencia

Este proyecto está bajo la Licencia MIT.
