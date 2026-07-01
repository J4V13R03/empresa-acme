# Frontend - Acme Store (Angular)

Aplicacion web SPA construida con Angular 21. Consumo de API REST para gestion de productos, autenticacion, dashboards y mapas.

## Requisitos

- Docker instalado y ejecutandose

## Estructura

```
src/app/
  features/
    auth/           # Login, recuperacion de contrasena, guardias
    product/        # CRUD de productos, paginacion, modal con validacion
    users/          # Gestion de usuarios
    maps/           # Integracion con Google Maps y Nominatim
    dashboards/     # Graficos de ventas y ranking (ngx-charts)
    not-found/      # Pagina 404
  shared/
    interceptors/   # Interceptor funcional para JWT
```

## Levantar con Docker

```bash
# 1. Crear red compartida (solo la primera vez)
docker network create mi-red

# 2. Construir imagen
docker build -t frontend-angular .

# 3. Ejecutar contenedor
docker run -d --name AngularClient --network mi-red -p 4200:80 frontend-angular
```

La aplicacion queda disponible en http://localhost:4200

## Notas

- El frontend depende del backend corriendo en el puerto 3000. Si el backend no esta levantado, las llamadas a la API fallaran.
- Las rutas protegidas redirigen al login si no hay sesion activa.
- La ruta wildcard muestra una pagina 404 para rutas inexistentes.
