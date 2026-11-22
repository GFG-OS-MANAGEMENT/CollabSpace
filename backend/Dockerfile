FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# The root postinstall script runs `prisma generate`, so the schema must exist first.
COPY prisma ./prisma
RUN npm ci

COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/server.js"]
