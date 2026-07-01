# Backend - Acme Store (Express + MySQL)

API REST construida con Express 5 y MySQL 8. Autenticacion con JWT, encriptacion de contrasenas con bcrypt, envio de correos con Nodemailer (OAuth2/Gmail).

## Requisitos

- Docker instalado y ejecutandose

## Endpoints

### Publicos (no requieren autenticacion)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /login | Iniciar sesion (email + password) |
| POST | /google-login | Iniciar sesion con Google OAuth |
| POST | /usuarios | Crear nuevo usuario |
| POST | /forgot-password | Solicitar recuperacion de contrasena (envia email) |
| GET | /verify-recovery-token/:token | Verificar validez de token de recuperacion |
| POST | /get-recovery-code | Obtener codigo de 6 digitos despues de completar tareas |
| POST | /reset-password | Cambiar contrasena con token + codigo |
| GET | /productos/validate-code/:code | Verificar si un codigo de producto ya existe |

### Protegidos (requieren header Authorization: Bearer <token>)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /productos | Listar todos los productos |
| GET | /productos/:id | Obtener un producto por ID |
| POST | /productos | Crear nuevo producto |
| PUT | /productos/:id | Actualizar producto |
| DELETE | /productos/:id | Eliminar producto |
| GET | /productos/top-ranking | Top 5 productos por calificacion |

## Levantar con Docker

```bash
# 1. Crear red compartida (solo la primera vez)
docker network create mi-red

# 2. Construir imagen del backend
docker build -t backend-server .

# 3. Ejecutar MySQL
docker run -d --name MyMySQLServer --network mi-red \
  -e MYSQL_ROOT_PASSWORD=1234 \
  -e MYSQL_DATABASE=acme \
  -p 3306:3306 \
  mysql:8

# 4. Ejecutar Backend
docker run -d --name BackendServer --network mi-red \
  -e MYSQL_HOST=MyMySQLServer \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=1234 \
  -e MYSQL_DATABASE=acme \
  -p 3000:3000 \
  backend-server
```

La API queda disponible en http://localhost:3000

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| MySQL root password | 1234 |
| Base de datos | acme |
| Seed JWT | esta-es-una-semilla-para-generar-el-token |
| Expiracion token | 4 horas (login) / 15 minutos (recuperacion) |

## Verificar que funciona

```bash
# Health check (debe retornar "Token no proporcionado")
curl http://localhost:3000/

# Login (reemplazar credenciales)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"tu-password"}'
```

## Notas

- El backend depende de MySQL. Si MySQL no esta corriendo, la conexion fallara al iniciar.
- Los archivos subidos se guardan en la carpeta uploads/.
- En produccion, cambiar el seed JWT y usar variables de entorno seguras.
