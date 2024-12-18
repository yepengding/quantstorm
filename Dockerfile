FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN mkdir /db
RUN mkdir /logs

EXPOSE 8888

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
