FROM node:latest AS development

WORKDIR /app
RUN mkdir -p ./modules
COPY package*.json ./modules/

RUN npm install --prefix ./modules

COPY /modules/node_modules ./node_modules

RUN npm run ci:prep:core-api
RUN npm run ci:build:api


FROM node:latest

WORKDIR /app
EXPOSE 3000

COPY --from=development /app/apps/core-api/node_modules ./node_modules
COPY --from=development /app/node_modules/@end/global ./node_modules/@end/global
COPY --from=development /app/apps/core-api/dist ./dist

CMD ["node", "dist/main"]