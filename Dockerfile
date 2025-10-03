FROM node:21.1.0-alpine

RUN apk add curl

WORKDIR /api-busstele

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3056

CMD ["npm", "run", "start"]