# Microservicio de Reseñas

**Autor:** Valentino Isgró  
**Legajo:** 50368  
**Universidad:** Universidad Tecnológica Nacional (UTN)  
**Materia:** Arquitectura de Microservicios  
**Año:** 2025

## Casos de uso

### CU: CRUD de Reviews

- Precondición: El Usuario debe estar autenticado (excepto para consultas públicas)

- Camino normal:

  **Alta de Review:**

  - El usuario autenticado proporciona un `productId`, `rating` (1-5) y `comment` (mínimo 5 caracteres)
  - El sistema valida que el usuario esté autenticado mediante JWT
  - El sistema valida que no exista una reseña previa del mismo usuario para ese producto
  - El sistema valida que el rating esté entre 1 y 5
  - El sistema valida que el comment tenga entre 5 y 500 caracteres
  - Si no cumplen las validaciones, devuelve error con los detalles
  - Se crea la nueva reseña en estado `pending` en la base de datos
  - Se devuelve la reseña creada

  **Baja de Review:**

  - El usuario autenticado solicita eliminar una reseña específica por su ID
  - El sistema valida que la reseña exista y no esté ya eliminada
  - El sistema valida que el usuario sea el propietario de la reseña
  - Se hace una baja lógica estableciendo `fecha_baja` con la fecha actual
  - Se devuelve la reseña eliminada

  **Modificación de Review:**

  - El usuario autenticado proporciona el ID de la reseña y los campos a actualizar (`rating`, `comment`)
  - El sistema valida que la reseña exista y no esté eliminada
  - El sistema valida que el usuario sea el propietario de la reseña
  - El sistema valida que los nuevos datos cumplan con las reglas de negocio
  - Se actualiza la reseña en la base de datos
  - Se devuelve la reseña actualizada

  **Consulta de Review:**

  - El sistema permite consultar reseñas sin autenticación
  - Se pueden filtrar por `product_id`, `user_id`, `status`
  - Se pueden ordenar por diferentes campos (`createdAt`, `rating`)
  - Se devuelve la lista de reseñas

- Caminos alternativos:

  - Si el usuario no está autenticado, devuelve error 401
  - Si el usuario intenta modificar/eliminar una reseña que no es suya, devuelve error 403
  - Si la reseña no existe, devuelve error 404
  - Si ya existe una reseña del usuario para ese producto, devuelve error 400

### CU: Moderación de Reviews (Admin)

- Precondición: El Usuario debe ser Administrador

- Camino normal:

  **Moderar Review:**

  - El admin proporciona el ID de la reseña y una decisión (`Aprobada` o `Rechazada`)
  - Opcionalmente puede incluir un `statusReason` explicando la decisión
  - El sistema valida que la reseña exista y esté en estado `pending`
  - El sistema valida que el usuario tenga rol de administrador
  - Si la decisión es `Aprobada`:
    - Se cambia el estado a `moderated`
    - Se establece `statusReason` si fue proporcionado
  - Si la decisión es `Rechazada`:
    - Se cambia el estado a `rejected`
    - Se establece `statusReason` explicando por qué fue rechazada
  - Se actualiza la reseña en la base de datos
  - Se devuelve la reseña moderada

  **Consultar Reviews por Estado:**

  - El admin solicita ver todas las reseñas en un estado específico (`pending`, `moderated`, `accepted`, `rejected`)
  - El sistema valida que el usuario tenga rol de administrador
  - Se buscan todas las reseñas con ese estado que no estén dadas de baja
  - Se devuelve la lista de reseñas

- Caminos alternativos:

  - Si el usuario no es admin, devuelve error 403
  - Si la reseña no está en estado `pending`, devuelve error 400
  - Si el estado solicitado no es válido, devuelve error 400

### CU: Verificación de Compra (Automática y Manual)

- Precondición: La reseña debe estar en estado `moderated`

- Camino normal:

  **Verificación Automática vía RabbitMQ:**

  - El sistema recibe un mensaje de tipo `place_order` desde el exchange `place_order`
  - El mensaje contiene `order_id`, `user_id` y un array de `articles` con sus respectivos `articleId`
  - Para cada artículo en la orden:
    - Se buscan todas las reseñas del usuario en estado `moderated` para ese producto
    - Si se encuentran reseñas:
      - Se cambia el estado a `accepted`
      - Se establece `statusReason` como "Compra verificada automáticamente"
      - Se actualiza el rating promedio del producto
  - Se registra en logs el resultado de la verificación

  **Verificación Manual (Admin):**

  - El admin solicita verificar manualmente una reseña específica por su ID
  - El sistema valida que la reseña esté en estado `moderated`
  - El sistema consulta al servicio de Orders para verificar si el usuario compró el producto
  - Si el usuario SÍ compró el producto:
    - Se cambia el estado a `accepted`
    - Se establece `statusReason` como "Compra verificada manualmente"
    - Se actualiza el rating promedio del producto
  - Si el usuario NO compró el producto:
    - Se cambia el estado a `rejected`
    - Se establece `statusReason` como "Compra no verificada"
  - Se devuelve el resultado de la verificación

- Caminos alternativos:

  - Si el servicio de Orders no está disponible, se asume compra válida por defecto
  - Si la reseña no está en estado `moderated`, devuelve error 400
  - Si hay error en la comunicación con RabbitMQ, se registra en logs

### CU: Consultar Rating de Producto

- Precondición: Ninguna (endpoint público)

- Camino normal:

  - El sistema recibe una solicitud para obtener el rating de un producto específico
  - Se buscan todas las reseñas en estado `accepted` del producto que no estén dadas de baja
  - Se calcula el rating promedio usando agregación de MongoDB
  - Se cuenta el total de reseñas aceptadas
  - Se devuelve el rating promedio redondeado a 1 decimal y el total de reseñas
  - El sistema cachea el resultado para mejorar performance

- Caminos alternativos:

  - Si no hay reseñas aceptadas, devuelve rating 0 y total 0

## Modelo de datos

**Review**

- \_id: ObjectId

- userId: String

- productId: String

- rating: Number

- comment: String

- status: String (enum)

- statusReason: String

- fecha_baja: Date

- createdAt: Date

- updatedAt: Date

**Índices:**

- Índice único compuesto: `{ userId: 1, productId: 1 }` (previene reseñas duplicadas del mismo usuario al mismo producto)

---

**ProductRating**

- \_id: ObjectId

- productId: String

- totalRating: Number

- reviewCount: Number

- averageRating: Number

- createdAt: Date

- updatedAt: Date

**Índices:**

- Índice único: `{ productId: 1 }` (un solo documento de rating por producto)

**Casos de uso:**

- Se actualiza automáticamente cuando una reseña es aceptada
- Se actualiza cuando una reseña aceptada es eliminada
- Se actualiza tras la verificación automática de compra (RabbitMQ)
- Se consulta para obtener rating rápidamente sin calcular desde todas las reseñas

## Interfaz REST

### Gestión de Reviews

#### Crear Review

`POST /create`

**Headers**

```
Authorization: Bearer {token}
```

**Content-Type**

- `application/json`

**Body**

```json
{
  "productId": "64a1b2c3d4e5f6789abcdef0",
  "rating": 5,
  "comment": "Excelente producto, superó mis expectativas"
}
```

**Response**

`201 CREATED`

```json
{
  "status": "success",
  "message": "Reseña creada exitosamente",
  "data": {
    "_id": "6507f1f130c72319ebf28a8c",
    "userId": "64a1b2c3d4e5f6789abcdef1",
    "productId": "64a1b2c3d4e5f6789abcdef0",
    "rating": 5,
    "comment": "Excelente producto, superó mis expectativas",
    "status": "pending",
    "statusReason": null,
    "fecha_baja": null,
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:30:00.000Z"
  }
}
```

`400 BAD REQUEST`

```json
{
  "error": "Ya existe una reseña de este usuario para este producto"
}
```

`400 BAD REQUEST`

```json
{
  "error": "El rating debe estar entre 1 y 5"
}
```

`400 BAD REQUEST`

```json
{
  "error": "El comentario debe tener entre 5 y 500 caracteres"
}
```

`401 UNAUTHORIZED`

```json
{
  "error": "Token no proporcionado"
}
```

#### Obtener todas las Reviews

`GET /reviews`

**Response**

`200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "_id": "6507f1f130c72319ebf28a8c",
      "userId": "64a1b2c3d4e5f6789abcdef1",
      "productId": "64a1b2c3d4e5f6789abcdef0",
      "rating": 5,
      "comment": "Excelente producto",
      "status": "accepted",
      "statusReason": "Compra verificada automáticamente",
      "fecha_baja": null,
      "createdAt": "2023-09-18T10:30:00.000Z",
      "updatedAt": "2023-09-18T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### Obtener Review por ID

`GET /reviews/{id}`

**Params path**

- `id`: ID de la reseña

**Response**

`200 OK`

```json
{
  "status": "success",
  "data": {
    "_id": "6507f1f130c72319ebf28a8c",
    "userId": "64a1b2c3d4e5f6789abcdef1",
    "productId": "64a1b2c3d4e5f6789abcdef0",
    "rating": 5,
    "comment": "Excelente producto",
    "status": "accepted",
    "statusReason": null,
    "fecha_baja": null,
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:30:00.000Z"
  }
}
```

`404 NOT FOUND`

```json
{
  "error": "Reseña no encontrada"
}
```

#### Actualizar Review

`PATCH /reviews/update/{id}`

**Headers**

```
Authorization: Bearer {token}
```

**Params path**

- `id`: ID de la reseña

**Body**

```json
{
  "rating": 4,
  "comment": "Muy buen producto, lo recomiendo"
}
```

**Response**

`200 OK`

```json
{
  "status": "success",
  "message": "Reseña actualizada exitosamente",
  "data": {
    "_id": "6507f1f130c72319ebf28a8c",
    "userId": "64a1b2c3d4e5f6789abcdef1",
    "productId": "64a1b2c3d4e5f6789abcdef0",
    "rating": 4,
    "comment": "Muy buen producto, lo recomiendo",
    "status": "pending",
    "statusReason": null,
    "fecha_baja": null,
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:35:00.000Z"
  }
}
```

`401 UNAUTHORIZED`

```json
{
  "error": "Token no proporcionado"
}
```

`403 FORBIDDEN`

```json
{
  "error": "No tienes permiso para actualizar esta reseña"
}
```

`404 NOT FOUND`

```json
{
  "error": "Reseña no encontrada"
}
```

#### Eliminar Review

`DELETE /reviews/delete/{id}`

**Headers**

```
Authorization: Bearer {token}
```

**Params path**

- `id`: ID de la reseña

**Response**

`200 OK`

```json
{
  "status": "success",
  "message": "Reseña eliminada exitosamente",
  "data": {
    "_id": "6507f1f130c72319ebf28a8c",
    "userId": "64a1b2c3d4e5f6789abcdef1",
    "productId": "64a1b2c3d4e5f6789abcdef0",
    "rating": 5,
    "comment": "Excelente producto",
    "status": "accepted",
    "statusReason": null,
    "fecha_baja": "2023-09-18T10:40:00.000Z",
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:40:00.000Z"
  }
}
```

`401 UNAUTHORIZED`

```json
{
  "error": "Token no proporcionado"
}
```

`403 FORBIDDEN`

```json
{
  "error": "No tienes permiso para eliminar esta reseña"
}
```

`404 NOT FOUND`

```json
{
  "error": "Reseña no encontrada"
}
```

### Consultas de Productos

#### Obtener todas las Reviews de un Producto

`GET /reviews/product/{productId}`

**Params path**

- `productId`: ID del producto

**Response**

`200 OK`

```json
{
  "status": "success",
  "message": "Reseñas del producto 64a1b2c3d4e5f6789abcdef0 obtenidas exitosamente",
  "data": [
    {
      "_id": "6507f1f130c72319ebf28a8c",
      "userId": "64a1b2c3d4e5f6789abcdef1",
      "productId": "64a1b2c3d4e5f6789abcdef0",
      "rating": 5,
      "comment": "Excelente producto",
      "status": "accepted",
      "statusReason": "Compra verificada automáticamente",
      "fecha_baja": null,
      "createdAt": "2023-09-18T10:30:00.000Z",
      "updatedAt": "2023-09-18T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### Obtener Rating Promedio de un Producto

`GET /reviews/average/{productId}`

**Params path**

- `productId`: ID del producto

**Response**

`200 OK`

```json
{
  "status": "success",
  "message": "Reseñas del producto 64a1b2c3d4e5f6789abcdef0 obtenidas exitosamente",
  "data": [
    {
      "_id": "6507f1f130c72319ebf28a8c",
      "userId": "64a1b2c3d4e5f6789abcdef1",
      "productId": "64a1b2c3d4e5f6789abcdef0",
      "rating": 5,
      "comment": "Excelente producto",
      "status": "accepted",
      "statusReason": null,
      "fecha_baja": null,
      "createdAt": "2023-09-18T10:30:00.000Z",
      "updatedAt": "2023-09-18T10:30:00.000Z"
    }
  ],
  "total": 1,
  "averageRating": 5.0
}
```

#### Obtener Información de Rating de un Producto

`GET /products/{productId}/rating`

**Params path**

- `productId`: ID del producto

**Response**

`200 OK`

```json
{
  "status": "success",
  "message": "Información de rating del producto 64a1b2c3d4e5f6789abcdef0 obtenida exitosamente",
  "data": {
    "productId": "64a1b2c3d4e5f6789abcdef0",
    "totalRating": 45,
    "reviewCount": 10,
    "averageRating": 4.5
  }
}
```

### Gestión de Admin

#### Moderar Review

`PATCH /reviews/{id}/moderate`

**Headers**

```
Authorization: Bearer {token}
```

**Params path**

- `id`: ID de la reseña

**Body**

```json
{
  "decision": "Aprobada",
  "statusReason": "Cumple con las políticas de contenido"
}
```

O para rechazar:

```json
{
  "decision": "Rechazada",
  "statusReason": "Contenido inapropiado"
}
```

**Response**

`200 OK`

```json
{
  "status": "success",
  "message": "Reseña aprobada correctamente",
  "data": {
    "_id": "6507f1f130c72319ebf28a8c",
    "userId": "64a1b2c3d4e5f6789abcdef1",
    "productId": "64a1b2c3d4e5f6789abcdef0",
    "rating": 5,
    "comment": "Excelente producto",
    "status": "moderated",
    "statusReason": "Cumple con las políticas de contenido",
    "fecha_baja": null,
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:45:00.000Z"
  }
}
```

`400 BAD REQUEST`

```json
{
  "error": "Solo se pueden moderar reseñas en estado 'pending'"
}
```

`401 UNAUTHORIZED`

```json
{
  "error": "Token no proporcionado"
}
```

`403 FORBIDDEN`

```json
{
  "error": "Acceso denegado. Se requiere rol de administrador"
}
```

`404 NOT FOUND`

```json
{
  "error": "Reseña no encontrada"
}
```

#### Obtener Reviews por Estado

`GET /admin/reviews/{status}`

**Headers**

```
Authorization: Bearer {token}
```

**Params path**

- `status`: Estado de las reseñas (pending, moderated, accepted, rejected)

**Response**

`200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "_id": "6507f1f130c72319ebf28a8c",
      "userId": "64a1b2c3d4e5f6789abcdef1",
      "productId": "64a1b2c3d4e5f6789abcdef0",
      "rating": 5,
      "comment": "Excelente producto",
      "status": "pending",
      "statusReason": null,
      "fecha_baja": null,
      "createdAt": "2023-09-18T10:30:00.000Z",
      "updatedAt": "2023-09-18T10:30:00.000Z"
    }
  ],
  "total": 1,
  "filterStatus": "pending"
}
```

`401 UNAUTHORIZED`

```json
{
  "error": "Token no proporcionado"
}
```

`403 FORBIDDEN`

```json
{
  "error": "Acceso denegado. Se requiere rol de administrador"
}
```

#### Verificar Compra Manualmente

`POST /reviews/{id}/verify-order`

**Headers**

```
Authorization: Bearer {token}
```

**Params path**

- `id`: ID de la reseña

**Response**

`200 OK`

```json
{
  "status": "success",
  "message": "Reseña aceptada - verificación manual completada",
  "data": {
    "_id": "6507f1f130c72319ebf28a8c",
    "userId": "64a1b2c3d4e5f6789abcdef1",
    "productId": "64a1b2c3d4e5f6789abcdef0",
    "rating": 5,
    "comment": "Excelente producto",
    "status": "accepted",
    "statusReason": "Compra verificada manualmente",
    "fecha_baja": null,
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:50:00.000Z"
  }
}
```

`400 BAD REQUEST`

```json
{
  "error": "Solo se pueden verificar reseñas en estado 'moderated'"
}
```

`401 UNAUTHORIZED`

```json
{
  "error": "Token no proporcionado"
}
```

`403 FORBIDDEN`

```json
{
  "error": "Acceso denegado. Se requiere rol de administrador"
}
```

`404 NOT FOUND`

```json
{
  "error": "Reseña no encontrada"
}
```

## Interfaz asíncrona (RabbitMQ)

### Verificación Automática de Compra

**Exchange:** `place_order` (tipo: direct)  
**Queue:** `reviews_orders`  
**Routing Key:** `order.placed`

Escucha mensajes de órdenes colocadas para verificar automáticamente las reseñas moderadas.

**Tipo de mensaje**

`place_order`

**Body ejemplo (de microservicio Go)**

```json
{
  "order_id": "123456",
  "user_id": "64a1b2c3d4e5f6789abcdef1",
  "articles": [
    {
      "articleId": "64a1b2c3d4e5f6789abcdef0",
      "quantity": 1
    },
    {
      "id": "64a1b2c3d4e5f6789abcdef2",
      "quantity": 2
    }
  ]
}
```

**Proceso:**

1. El sistema recibe el mensaje de orden colocada
2. Por cada artículo en la orden:
   - Busca reseñas del usuario en estado `moderated` para ese producto
   - Si encuentra reseñas:
     - Cambia el estado a `accepted`
     - Establece `statusReason`: "Compra verificada automáticamente"
     - Actualiza el rating promedio del producto
3. Registra el resultado en logs

**Manejo de errores:**

- Si el mensaje no tiene el formato esperado, se registra el error y se descarta el mensaje
- Si falla la actualización de una reseña, se registra el error pero se continúa con las demás

### Invalidación de Token (Logout)

**Exchange:** `auth` (tipo: fanout)  
**Queue:** `reviews_logout`

Escucha mensajes de logout para invalidar tokens en el cache local.

**Tipo de mensaje**

`logout`

**Body ejemplo**

```json
{
  "type": "logout",
  "message": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Proceso:**

1. El sistema recibe el mensaje de logout
2. Invalida el token en el cache de NodeCache
3. Las siguientes peticiones con ese token serán rechazadas

## Flujo de Estados de una Review

```
[pending]
   |
   v
[moderated] (Admin aprueba)
   |
   v
[accepted] (Se verifica compra automáticamente o manualmente)

O

[pending]
   |
   v
[rejected] (Admin rechaza o compra no verificada)
```

**Estados:**

- **pending**: Reseña recién creada, esperando moderación del admin
- **moderated**: Admin aprobó el contenido, esperando verificación de compra
- **accepted**: Compra verificada, reseña visible públicamente y cuenta para rating
- **rejected**: Admin rechazó el contenido o compra no verificada

## Comunicación entre Microservicios

### Reviews → Auth Service

**Endpoint:** `GET {AUTH_SERVICE_URL}/users/validate`

**Propósito:** Validar tokens JWT

**Headers:**

```
Authorization: Bearer {token}
```

**Response esperado:**

```json
{
  "_id": "64a1b2c3d4e5f6789abcdef1",
  "username": "usuario123",
  "email": "usuario@example.com",
  "role": "user"
}
```

**Cache:** 1 hora (3600 segundos) en NodeCache

### Reviews → Orders Service

**Endpoint:** `GET {ORDERS_SERVICE_URL}/orders/user/{userId}`

**Propósito:** Verificar si un usuario compró un producto específico

**Headers:**

```
Authorization: Bearer {token}
```

**Response esperado:**

```json
[
  {
    "id": "123456",
    "user_id": "64a1b2c3d4e5f6789abcdef1",
    "status": "validated",
    "articles": [
      {
        "articleId": "64a1b2c3d4e5f6789abcdef0",
        "quantity": 1
      }
    ]
  }
]
```

**Manejo de errores:**

- Si el servicio no está disponible (ECONNREFUSED), se asume compra válida por defecto
- Si retorna error 401/403, se rechaza la verificación
- Timeout: 5000ms

## Características de Seguridad

### Autenticación JWT

- Validación de tokens con el servicio de Auth
- Cache de validaciones exitosas (1 hora)
- Invalidación de tokens al hacer logout (vía RabbitMQ)

### Autorización

- Usuarios solo pueden crear/editar/eliminar sus propias reseñas
- Admins pueden moderar cualquier reseña
- Admins pueden verificar compras manualmente
- Admins pueden consultar reseñas por estado

### Validaciones

- Rating entre 1 y 5
- Comentario entre 5 y 500 caracteres
- Un usuario solo puede crear una reseña por producto
- Solo se pueden moderar reseñas en estado `pending`
- Solo se pueden verificar reseñas en estado `moderated`
