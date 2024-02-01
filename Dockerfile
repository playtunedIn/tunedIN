# Create the docker image for the multiplayer/questions server

FROM node:20 as base
RUN npm install -g pnpm

ENV NDOE_ENV production
ARG APPLICATION_PORT=3000

FROM base as deps
WORKDIR /server

ADD package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
ADD packages/server/package.json ./packages/server/

RUN pnpm install --production=false --frozen-lockfile --prefer-offline --config.ignore-scripts=true

FROM base as build
WORKDIR /server

ADD packages/server/. ./packages/server/.
ADD package.json pnpm-workspace.yaml ./
COPY --from=deps /server/packages/server/node_modules /server/packages/server/node_modules
COPY --from=deps /server/node_modules /server/node_modules
RUN pnpm run -F server build

FROM base as production-deps
WORKDIR /server

COPY --from=deps /server/packages/server/node_modules /server/node_modules
ADD packages/server/package.json .npmrc ./
RUN pnpm prune --prod --config.ignore-scripts=true

FROM base
WORKDIR /server

COPY --from=production-deps /server/node_modules /server/node_modules
COPY --from=build /server/packages/server/dist /server/dist
COPY --from=build /server/packages/server/package.json /server/package.json

RUN export REDIS_HOSTNAME=redis://redis:6379

EXPOSE $APPLICATION_PORT

CMD ["pnpm", "start"]
