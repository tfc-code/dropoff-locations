FROM node:12 as base
WORKDIR /usr/src/app

FROM base AS buildDependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

FROM buildDependencies AS build
WORKDIR /usr/src/app
COPY src ./src
RUN npm run dist


FROM build AS dependencies
WORKDIR /usr/src/app
COPY --from=buildDependencies /usr/src/app/package.json ./
RUN npm install --production

FROM node:12-alpine AS release
EXPOSE 80
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/package.json ./
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY data ./data
ENTRYPOINT ["node", "dist/index.js", "80"]