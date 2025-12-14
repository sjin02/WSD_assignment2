# ---------- build stage ----------
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

# ---------- runtime stage ----------
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8080
CMD ["npm", "run", "start"]
