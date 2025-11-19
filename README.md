# Microservicio de Reseñas

Sistema de gestión de reseñas de productos con moderación, verificación de compras y cálculo de ratings.

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm start
```

## Configuración

Crear archivo `.env` basado en `.env.example`:

```env
PORT=5555
MONGODB_URI=<tu_conexion_mongodb>
RABBIT_URL=amqp://localhost
AUTH_SERVICE_URL=http://localhost:3000
ORDERS_SERVICE_URL=http://localhost:3004
```

## Características

- ✅ CRUD de reseñas con autenticación JWT
- ✅ Moderación de contenido (manual y automática)
- ✅ Verificación de compras vía RabbitMQ
- ✅ Modelo de ratings (ProductRating) para performance optimizada
- ✅ Flujo de estados: pending → moderated → accepted
- ✅ Documentación interactiva con Swagger

## API

**Servidor:** `http://localhost:5555`  
**Swagger:** `http://localhost:5555/api-docs`

Endpoints principales:

- `POST /create` - Crear reseña
- `GET /reviews` - Listar reseñas
- `GET /products/:productId/rating` - Rating de producto
- `PATCH /reviews/:id/moderate` - Moderar (Admin)

## Stack

- **Node.js** + Express 5.1.0
- **MongoDB** + Mongoose 8.18.1
- **RabbitMQ** (amqplib 0.10.9)
- **JWT** con cache (NodeCache)
- **Zod** para validaciones

## Documentación Completa

**Ver [Documentation.md](./Documentation.md)** para casos de uso, modelos, endpoints detallados, RabbitMQ y arquitectura.

---

**Autor:** Valentino Isgró | **Legajo:** 50438 | **UTN - Arquitectura de Microservicios 2025**
