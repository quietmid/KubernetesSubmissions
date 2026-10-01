
FROM alpine:latest

RUN apk add --no-cache util-linux bash nodejs

WORKDIR /app

COPY app.sh .
COPY server.js .
RUN chmod +x app.sh

EXPOSE 3000

CMD ["./app.sh"]
