FROM debian:stable

RUN apt-get update && apt-get update
RUN apt-get install -y npm
EXPOSE 3000

WORKDIR /app
ADD package.json package-lock.json ./
RUN npm i
ADD . /app
ENTRYPOINT [ "npm","start" ]