<<<<<<< HEAD
FROM nginx:1.19-alpine
COPY ./build /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/
ENV SERVER_URL=http://web:8008
WORKDIR /usr/share/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
=======
FROM node:13.1-alpine as react-build
WORKDIR /usr/src/app
COPY . ./
RUN npm i && npm build

FROM nginx:alpine
COPY --from=react-build usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> Adds React, ReactRouter, MaterialUI, Recoil and Docker
