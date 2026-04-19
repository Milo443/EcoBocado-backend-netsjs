# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para node-gyp (si bcrypt las requiere)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

EXPOSE 3000

CMD ["node", "dist/main"]
