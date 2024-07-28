FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN mkdir /logs
RUN mkdir /db

EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
