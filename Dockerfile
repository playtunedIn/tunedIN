# Create the docker image for the multiplayer/questions server

FROM node:20 as base
RUN npm install -g pnpm

ENV NDOE_ENV production
ARG APPLICATION_PORT=3000

FROM base as deps
WORKDIR /server

ADD package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
ADD packages/server/package.json ./packages/server/

RUN export JWT_SIGNING_HASH=ae4c5a1987fa5315227c807a35d91011d380db8f0b04da549beeba0777334330b6fe44e74a46007cd94ac4970ce9d37eaf436d3c2bde0721683b692d323c8d6e
RUN pnpm install --production=false --frozen-lockfile --prefer-offline --config.ignore-scripts=true

FROM base as build
WORKDIR /server

ADD packages/server/. ./packages/server/.
ADD package.json pnpm-workspace.yaml ./
COPY --from=deps /server/packages/server/node_modules /server/packages/server/node_modules
COPY --from=deps /server/node_modules /server/node_modules
RUN export JWT_SIGNING_HASH=ae4c5a1987fa5315227c807a35d91011d380db8f0b04da549beeba0777334330b6fe44e74a46007cd94ac4970ce9d37eaf436d3c2bde0721683b692d323c8d6e
RUN pnpm run -F server build

FROM base as production-deps
WORKDIR /server

COPY --from=deps /server/packages/server/node_modules /server/node_modules
ADD packages/server/package.json .npmrc ./
RUN export JWT_SIGNING_HASH=ae4c5a1987fa5315227c807a35d91011d380db8f0b04da549beeba0777334330b6fe44e74a46007cd94ac4970ce9d37eaf436d3c2bde0721683b692d323c8d6e
RUN pnpm prune --prod --config.ignore-scripts=true

FROM base
WORKDIR /server

COPY --from=production-deps /server/node_modules /server/node_modules
COPY --from=build /server/packages/server/dist /server/dist
COPY --from=build /server/packages/server/package.json /server/package.json
RUN export JWT_SIGNING_HASH=ae4c5a1987fa5315227c807a35d91011d380db8f0b04da549beeba0777334330b6fe44e74a46007cd94ac4970ce9d37eaf436d3c2bde0721683b692d323c8d6e
RUN export REDIS_HOSTNAME=redis://redis:6379

EXPOSE 3001
EXPOSE 3000
EXPOSE $APPLICATION_PORT

CMD ["pnpm", "start"]
