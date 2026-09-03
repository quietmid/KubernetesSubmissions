
FROM alpine:latest

RUN apk add --no-cache util-linux bash

WORKDIR /app

COPY app.sh .
RUN chmod +x app.sh

CMD ["./app.sh"]
