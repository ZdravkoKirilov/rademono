FROM node:16-alpine AS development

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY ./tsconfig.json ./tsconfig.json
COPY ./apps/core-api ./apps/core-api
COPY ./libs/global ./libs/global
COPY ./libs/global ./node_modules/@end/global

RUN ls
RUN npm run ci:prep:core-api
RUN npm run ci:build:api


FROM node:16-alpine

WORKDIR /usr/src/app
EXPOSE 3000

COPY --from=development /usr/src/app/apps/core-api/node_modules ./node_modules
COPY --from=development /usr/src/app/node_modules/@end/global ./node_modules/@end/global
COPY --from=development /usr/src/app/apps/core-api/dist ./dist

RUN ls
RUN cd node_modules && ls
CMD ["node", "dist/main"]