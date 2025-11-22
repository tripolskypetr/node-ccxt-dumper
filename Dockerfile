# Use Bun as the base image (alternative: node:22-alpine)
FROM oven/bun:1.2.19-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY build ./build
COPY config ./config
COPY package.json .
COPY index.cjs .
COPY indexes.txt .

RUN bun install --ignore-scripts --verbose

CMD ["bun", "./index.cjs"]

EXPOSE 30050
