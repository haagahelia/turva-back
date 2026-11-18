# Use the same Node.js runtime for local development and deployment.
FROM node:24.7.0-alpine3.21 AS base

WORKDIR /usr/src/app

COPY package*.json ./

EXPOSE 3000

FROM base AS predeploy

RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:24.7.0-alpine3.21 AS deploy

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=predeploy /usr/src/app/node_modules ./node_modules
COPY --from=predeploy /usr/src/app/dist ./dist
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]

FROM base AS dev

RUN npm ci
COPY . .

CMD ["npm", "run", "dev"]
