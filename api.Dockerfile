FROM node:latest AS development

WORKDIR /app
COPY package*.json ./

RUN npm -v
RUN node -v
RUN npm ci

RUN cd node_modules && ls
COPY tsconfig.json ./tsconfig.json
COPY apps/core-api ./apps/core-api
COPY libs/global ./libs/global
COPY node_modules ./node_modules

RUN npm run ci:prep:core-api
RUN npm run ci:build:api


FROM node:latest

WORKDIR /app
EXPOSE 3000

COPY --from=development /app/apps/core-api/node_modules ./node_modules
COPY --from=development /app/node_modules/@end/global ./node_modules/@end/global
COPY --from=development /app/apps/core-api/dist ./dist

CMD ["node", "dist/main"]