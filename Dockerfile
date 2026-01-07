FROM nginx:1.29-alpine
COPY ./build /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/
ENV SERVER_URL=http://web:8008
WORKDIR /usr/share/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
