# 🎵 API REST de Música

Esta es una API RESTful desarrollada en Node.js y Express que permite gestionar canciones, artistas, playlists, usuarios y favoritos. Además, incluye autenticación mediante JWT, protección de rutas.

---

## 🚀 Características Principales

- Autenticación y autorización con JWT.
- Gestión de usuarios (registro, login, recuperación de contraseña).
- CRUD de canciones, artistas y playlists.
- Favoritos por usuario.
- Middleware `authenticate` y `isAdmin` para proteger rutas.
- Soporte de archivos MP3 servidos estáticamente.
- Documentación automática con Swagger.
- Arquitectura modular por rutas y controladores.
- Compatible con Angular (CORS configurado).

---

## 📁 Estructura del Proyecto

```
📦 raiz/
├── config/
│   └── db.js                # Conexión a la base de datos
├── controllers/            # Lógica de negocio
├── middlewares/            # Middleware para autenticación
├── routes/                 # Rutas del API
├── public/                 # Archivos estáticos (canciones .mp3)
├── swagger/                # Documentación OpenAPI
├── server.js               # Archivo principal del servidor
├── .env                    # Variables de entorno
└── README.md               # Este archivo
```

---

## 🔐 Autenticación

Usamos JWT para proteger rutas y roles:

```js
const { authenticate, isAdmin } = require('../middlewares/authenticate');
```

- `authenticate`: protege rutas para usuarios autenticados.
- `isAdmin`: restringe rutas a administradores.

---

## 🧭 Rutas Principales

### 🎤 Artistas

| Método | Ruta                          | Descripción                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/artists/`               | Obtener todos los artistas           |
| GET    | `/api/artists/search/:name`   | Buscar artistas por nombre           |
| GET    | `/api/artists/:id/songs`      | Obtener canciones por artista ID     |
| GET    | `/api/artists/:id`            | Obtener artista por ID               |

---

### 🎶 Canciones

| Método | Ruta                           | Descripción                          |
|--------|--------------------------------|--------------------------------------|
| GET    | `/api/songs/`                  | Obtener todas las canciones          |
| GET    | `/api/songs/search`            | Buscar canciones                     |
| GET    | `/api/songs/:id`               | Obtener canción por ID               |
| POST   | `/api/songs/add`               | Agregar una nueva canción            |
| GET    | `/api/songs/check/:filename`   | Verificar existencia de un archivo   |

---

### 🧾 Playlists

| Método | Ruta                                      | Descripción                           |
|--------|-------------------------------------------|---------------------------------------|
| POST   | `/api/playlists/createPlaylist`           | Crear una playlist (autenticado)      |
| GET    | `/api/playlists/user/:userId`             | Obtener playlists del usuario         |
| GET    | `/api/playlists/:id`                      | Obtener playlist por ID               |
| PUT    | `/api/playlists/:id/update`               | Actualizar playlist                   |
| DELETE | `/api/playlists/:id/delete`               | Eliminar playlist                     |
| POST   | `/api/playlists/add-song`                 | Agregar canción a playlist            |
| DELETE | `/api/playlists/remove-song/:songId`      | Eliminar canción de playlist          |
| GET    | `/api/playlists/others/:userId`           | Ver playlists de otros usuarios       |

---

### ❤️ Favoritos

| Método | Ruta                                            | Descripción                           |
|--------|-------------------------------------------------|---------------------------------------|
| POST   | `/api/favorites/add`                            | Agregar canción a favoritos           |
| DELETE | `/api/favorites/:userId/:songId/remove`         | Eliminar canción de favoritos         |
| GET    | `/api/favorites/user/:userId`                   | Obtener favoritos del usuario         |
| GET    | `/api/favorites/check/:userId/:songId`          | Verificar si una canción es favorita  |

---

### 👤 Autenticación

| Método | Ruta                          | Descripción                           |
|--------|-------------------------------|---------------------------------------|
| POST   | `/api/auth/registrarse`       | Registro de usuario                   |
| POST   | `/api/auth/login`             | Login con JWT                         |
| POST   | `/api/auth/forgot-password`   | Solicitar cambio de contraseña        |
| POST   | `/api/auth/reset-password`    | Restablecer contraseña                |
| POST   | `/api/auth/check-email`       | Verifica si el email está registrado  |
| GET    | `/api/auth/perfil`            | Ruta protegida para obtener perfil    |

---

## ⚙️ Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/tu-repo.git
   cd tu-repo
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example`:
   ```env
   PORT=3008
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_clave
   DB_NAME=nombre_db
   JWT_SECRET_KEY=clave_super_segura
   ```

4. Ejecuta el servidor:
   ```bash
   npm run dev
   ```

---

## 📌 Notas Adicionales

- Los archivos `.mp3` se sirven desde `/public/songs`.
- Todas las rutas que manipulan datos sensibles requieren el header:
  ```
  Authorization: Bearer <token>
  ```
- Compatible con frontend en Angular (`localhost:4200`).

---

## 🧑‍💻 Autor

Desarrollado por [Yanina-Unrein](https://github.com/Yanina-Unrein)

---

## 📝 Licencia

MIT License