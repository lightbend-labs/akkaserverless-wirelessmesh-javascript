# This Dockerfile uses multi-stage build process.
# See https://docs.docker.com/develop/develop-images/multistage-build/
# Stage 1: Downloading dependencies and building the application
FROM node:15.10.0-buster-slim AS builder

# workaround for node-gyp problem -> downgrade from npm v7 to npm v6
# (NOTE: npm v7 comes with node v15. We don't need this patch if using node v14)
RUN apt-get update && apt-get install -y python3 make g++ && npm install -g npm@6.14.13 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /home/node

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy sources and build the app
COPY . .
RUN npm run build

# Remove dev packages
# (the rest will be copied to the production image at stage 2)
RUN npm prune --production

# Stage 2: Building the production image
FROM node:15.10.0-buster-slim

# Set the working directory
WORKDIR /home/node

# Copy dependencies
COPY --from=builder --chown=node /home/node/node_modules node_modules/

# Copy the app
COPY --from=builder --chown=node /home/node/package*.json ./
COPY --from=builder --chown=node /home/node/src src/
COPY --from=builder --chown=node /home/node/proto proto/
COPY --from=builder --chown=node /home/node/user-function.desc ./

# Run the app as an unprivileged user for extra security.
USER node

# Run
EXPOSE 8080
CMD ["npm", "start"]
