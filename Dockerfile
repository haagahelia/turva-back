#Newest node version as base image
FROM node:24.7.0-alpine3.21 AS base

#Set the working directory inside the container 
WORKDIR /usr/src/app

#Copy dependencies
COPY package*.json ./

#Expose backend port
EXPOSE 3000

FROM base AS dev

#Install dependencies
RUN npm install

#Copy the rest of the code
COPY . .

#Start the backend in development mode
CMD ["npm", "run", "dev"]

FROM base AS predeploy
RUN npm install
COPY . .
RUN npm run build

FROM base AS deploy
RUN npm ci --production
COPY --from=predeploy /usr/src/app/dist .
CMD ["node", "main"]