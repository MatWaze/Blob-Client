
FROM alpine:latest

COPY . /opt/nginx

WORKDIR /opt/nginx

RUN apk add nodejs npm nginx openssl ca-certificates

RUN npm i && rm package-lock.json

RUN npm run build

RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=blobula"

RUN cp /etc/nginx/ssl/server.crt /usr/local/share/ca-certificates/server.crt
RUN update-ca-certificates

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "nginx" ]