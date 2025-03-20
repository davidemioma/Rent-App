FROM oven/bun:latest

WORKDIR /app

COPY client/package.json client/bun.lockb* ./

WORKDIR /app/client

RUN bun install --frozen-lockfile

COPY client/. .

EXPOSE 3000

CMD ["bun", "run", "dev"]