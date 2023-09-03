FROM nginx:1.25-alpine
COPY self-signed.key /etc/ssl/private/self-signed.key
COPY self-signed.crt /etc/ssl/certs/self-signed.crt
COPY default.conf.template /etc/nginx/templates/
ENV SERVER_URL=http://host.docker.internal:3000
WORKDIR /usr/share/nginx
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
