#Newest node version as base image
FROM node:24.7.0-alpine3.21 AS dev

#Set the working directory inside the container 
WORKDIR /usr/src/app

#Copy dependencies
COPY package*.json ./

#Install dependencies
RUN npm install

#Copy the rest of the code
COPY . .

#Expose backend port
EXPOSE 3000

#Start the backend in development mode
CMD ["npm", "run", "dev"]