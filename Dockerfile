FROM node:20-alpine AS builder

WORKDIR /app


COPY . .
RUN npm install -g pnpm

RUN pnpm i
RUN pnpm test
RUN pnpm build


FROM node:20-alpine AS production

WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-lock.yaml package.json ./
COPY  prisma  ./prisma
RUN pnpm i
COPY --from=builder /app/dist .


CMD ["node", "./src/index.js"]
