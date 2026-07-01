# ===== Stage 1: Build =====
FROM node:20-alpine AS build

WORKDIR /app

# Copiar dependencias primero (mejor caché de capas)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# ===== Stage 2: Serve =====
FROM nginx:alpine

# Copiar el build producido al directorio de nginx
COPY --from=build /app/dist/mi-app-mod/browser /usr/share/nginx/html

# Configuración de nginx para SPA (Single Page Application)
# Redirige todas las rutas a index.html para que Angular maneje el routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
