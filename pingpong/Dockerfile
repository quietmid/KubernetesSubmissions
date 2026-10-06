FROM alpine:latest

RUN apk add --no-cache util-linux bash nodejs

WORKDIR /app

COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]