FROM node:16-alpine AS development

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npm run ci:build:api


FROM node:16-alpine

WORKDIR /usr/src/app
EXPOSE 3000

COPY --from=development /usr/src/app/apps/core-api/node_modules ./node_modules
COPY --from=development /usr/src/app/node_modules/@end/global ./node_modules/@end/global
COPY --from=development /usr/src/app/apps/core-api/dist ./dist

CMD ["node", "dist/main"]