FROM debian:stable

RUN apt-get update && apt-get update
RUN apt-get install -y npm
ENV HTTP_PORT=3081
EXPOSE 3081

WORKDIR /app
ADD package.json package-lock.json ./
RUN npm i
ADD . /app
ENTRYPOINT [ "npm","start" ]