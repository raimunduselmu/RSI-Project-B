FROM node:24-alpine AS build
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY database/ /database/
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev && npm install -g pm2
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY database/ /database/
RUN mkdir -p /var/kmk/uploads
EXPOSE 4000
CMD ["pm2-runtime", "dist/server.js", "--name", "kmk-api"]
