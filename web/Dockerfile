FROM node:alpine3.13 as build
ARG REACT_APP_BRAND
ENV REACT_APP_BRAND $REACT_APP_BRAND
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@4.0.1 -g --silent
COPY . ./
RUN npm run build

FROM nginx:alpine
ARG DOMAIN
ENV DOMAIN $DOMAIN
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template
# COPY ./nginx/$DOMAIN.cert /etc/nginx/certs/$DOMAIN.crt
# COPY ./nginx/$DOMAIN.key /etc/nginx/certs/$DOMAIN.key 

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]