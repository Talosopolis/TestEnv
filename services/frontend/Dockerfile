# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

# Copy deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets from builder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx template for envsubst
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default Env Vars
ENV PORT=8080
ENV BACKEND_URL=http://localhost:8000

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
