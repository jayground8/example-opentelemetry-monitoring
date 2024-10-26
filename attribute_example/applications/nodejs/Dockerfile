FROM node:22 As package
WORKDIR /usr/src/app
COPY package* .
RUN npm ci --only=production --loglevel verbose && npm cache clean --force

FROM gcr.io/distroless/nodejs22-debian12:debug-nonroot
COPY --from=package /usr/src/app/node_modules ./node_modules
COPY *.js .
CMD [ "index.js" ]