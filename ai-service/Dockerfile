FROM node:22-alpine

WORKDIR /app

COPY ai-service/package*.json ./
RUN npm install

COPY ai-service/server.js ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8001

CMD ["npm", "start"]