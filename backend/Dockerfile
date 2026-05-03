FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=10s --start-period=45s --retries=10 \
  CMD curl -fsS http://127.0.0.1:4000/api/health >/dev/null || exit 1

CMD ["node", "src/server.js"]
