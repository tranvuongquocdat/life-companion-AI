FROM node:20-alpine
WORKDIR /app

# Copy workspace root and package files
COPY package*.json ./
COPY packages/core/package*.json packages/core/
COPY packages/server/package*.json packages/server/

# Install all dependencies (including devDeps for build)
RUN npm install --workspace=packages/core --workspace=packages/server

# Copy source code
COPY packages/core packages/core
COPY packages/server packages/server

# Build server (bundles core via esbuild, then devDeps no longer needed)
RUN cd packages/server && node esbuild.config.mjs

EXPOSE 3456
CMD ["node", "packages/server/dist/index.js"]
