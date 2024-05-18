FROM oven/bun:1

COPY package.json bun.lockb .
RUN bun install --frozen-lockfile --production

RUN echo "{}" > storage.json
COPY . .

ENV NODE_ENV=production

EXPOSE 5555/tcp
ENTRYPOINT [ "bun", "start" ]
