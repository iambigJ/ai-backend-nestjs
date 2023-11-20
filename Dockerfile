###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine As development
RUN apk add poppler-utils

WORKDIR /usr/src/app
ENV NODE_ENV DEVELOPMENT

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn

COPY --chown=node:node . .


###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build

WORKDIR /usr/src/app

COPY --chown=backend:backend package*.json ./


COPY --chown=backend:backend --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=backend:backend . .


RUN yarn build
USER backend


###################
# PRODUCTION_DEPS
###################
FROM node:20-alpine As base_image
ENV NODE_ENV production
RUN apk add poppler-utils

WORKDIR /app
COPY --chown=backend:backend --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=backend:backend package.json yarn.lock  ./
RUN yarn install --production --ignore-scripts --prefer-offline


###################
# PRODUCTION
###################

FROM base_image As production

WORKDIR /app

COPY --chown=backend:backend --from=build /usr/src/app/dist ./dist

CMD ["yarn" ,"start:prod"] 