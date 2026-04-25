FROM node:22-alpine

WORKDIR /app

COPY data-service/package*.json ./
RUN npm install

COPY data-service/dataServer.js ./
COPY data-service/data ./data

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001

CMD ["npm", "start"]