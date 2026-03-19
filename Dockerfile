
FROM alpine:latest

WORKDIR /opt/nginx

COPY ./package.json /opt/nginx

RUN apk add nodejs npm nginx certbot certbot-nginx

RUN npm i && rm package-lock.json && rm package.json

COPY ./ /opt/nginx

RUN npm run build

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

COPY ./conf/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]