FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for build
RUN npm ci

# Copy TypeScript config and source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript with build info
ARG BUILD_DATE
ARG GIT_COMMIT
ENV BUILD_DATE=${BUILD_DATE}
ENV GIT_COMMIT=${GIT_COMMIT}
RUN npm run build

# Remove dev dependencies and source files
RUN npm prune --production
RUN rm -rf src tsconfig.json node_modules/@types node_modules/typescript node_modules/@typescript-eslint

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]