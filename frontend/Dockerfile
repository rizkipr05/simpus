FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL=http://localhost:4000/api
ARG VITE_REMOTE_DB_URL=
ARG VITE_COUCHDB_URL=http://localhost:5984
ARG VITE_COUCHDB_DB_NAME=simpus_records

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_REMOTE_DB_URL=$VITE_REMOTE_DB_URL
ENV VITE_COUCHDB_URL=$VITE_COUCHDB_URL
ENV VITE_COUCHDB_DB_NAME=$VITE_COUCHDB_DB_NAME

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl
RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

HEALTHCHECK --interval=15s --timeout=10s --start-period=45s --retries=10 \
  CMD curl -fsS http://127.0.0.1:5173 >/dev/null || exit 1

CMD ["serve", "-s", "dist", "-l", "5173"]
