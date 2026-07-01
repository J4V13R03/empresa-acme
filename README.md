# Acme Store - Proyecto Final Angular

Aplicacion web fullstack para la gestion de una tienda de productos (anime/manga). Frontend en Angular 21, backend en Express 5, base de datos MySQL 8. Todo desplegado con Docker.

## Stack tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | Angular 21, TypeScript, Bootstrap 5, ngx-pagination, ngx-charts |
| Backend | Node.js, Express 5, JWT, bcrypt, Nodemailer |
| Base de datos | MySQL 8 |
| Infraestructura | Docker, Nginx |

## Funcionalidades

- Autenticacion con JWT (login local y Google OAuth)
- CRUD completo de productos con validacion asincrona de codigo
- Paginacion de productos con datos generados (faker-js)
- Dashboard de ventas y ranking con graficos (ngx-charts)
- Integracion con Google Maps y geocodificacion inversa (Nominatim)
- Recuperacion de contrasena con flujo interactivo (swipe card)
- Proteccion de rutas con guardias
- Pagina 404 para rutas inexistentes

## Requisitos

- Docker instalado y ejecutandose

## Como levantar el proyecto

El proyecto consta de 3 contenedores Docker que se comunican a traves de una red compartida.

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/J4V13R03/empresa-acme.git
cd empresa-acme
```

### Paso 2: Crear la red compartida (solo la primera vez)

```bash
docker network create mi-red
```

### Paso 3: Levantar MySQL

```bash
cd backend
docker build -t backend-server .

docker run -d --name MyMySQLServer --network mi-red \
  -e MYSQL_ROOT_PASSWORD=1234 \
  -e MYSQL_DATABASE=acme \
  -p 3306:3306 \
  mysql:8
```

Esperar aproximadamente 30 segundos a que MySQL termine de inicializar. Puedes verificar con:

```bash
docker logs MyMySQLServer
```

### Paso 4: Levantar el Backend

```bash
docker run -d --name BackendServer --network mi-red \
  -e MYSQL_HOST=MyMySQLServer \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=1234 \
  -e MYSQL_DATABASE=acme \
  -p 3000:3000 \
  backend-server
```

### Paso 5: Levantar el Frontend

```bash
cd ../frontend
docker build -t frontend-angular .

docker run -d --name AngularClient --network mi-red \
  -p 4200:80 \
  frontend-angular
```

### Paso 6: Verificar

Abrir en el navegador: http://localhost:4200

## Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 4200 | http://localhost:4200 |
| Backend | 3000 | http://localhost:3000 |
| MySQL | 3306 | localhost:3306 |

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| MySQL root password | 1234 |
| Base de datos | acme |
| Seed JWT | esta-es-una-semilla-para-generar-el-token |

## Estructura del proyecto

```
empresa-acme/
  frontend/            # Frontend (Angular 21)
    src/app/
      features/        # Modulos funcionales
        auth/          # Login, recuperacion de contrasena
        product/       # CRUD de productos
        users/         # Gestion de usuarios
        maps/          # Google Maps + Nominatim
        dashboards/    # Graficos de ventas y ranking
        not-found/     # Pagina 404
      shared/          # Interceptors, servicios compartidos
    Dockerfile
  backend/             # API REST (Express + MySQL)
    app.js             # Archivo principal del backend
    .env.dev           # Variables de entorno
    Dockerfile
  docs/                # Material de apoyo (slides PPT)
```

## Comandos utiles

```bash
# Ver estado de los contenedores
docker ps

# Ver logs del backend
docker logs -f BackendServer

# Ver logs del frontend
docker logs -f AngularClient

# Detener todo
docker stop AngularClient BackendServer MyMySQLServer

# Eliminar contenedores
docker rm AngularClient BackendServer MyMySQLServer

# Eliminar todo (incluyendo datos de MySQL)
docker rm -f AngularClient BackendServer MyMySQLServer
```

## Notas importantes

- El frontend depende del backend. Si el backend no esta corriendo, las llamadas a la API fallaran.
- MySQL necesita aproximadamente 30 segundos para inicializar completamente. Esperar antes de levantar el backend.
- Los datos de MySQL persisten mientras el contenedor exista. Para eliminarlos, remover el contenedor con `docker rm`.
- En produccion, cambiar el seed JWT y usar variables de entorno seguras.
