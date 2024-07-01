FROM node:18 as builder
WORKDIR /usr/src/app
COPY package.json package.json
COPY . .
RUN yarn install
RUN npm install vite
RUN yarn run build 
#################
# for dev only 
# ENTRYPOINT ["tail", "-f", "/dev/null"]
#################
FROM nginx:1.23.1-alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf