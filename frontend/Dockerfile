# Build stage: Node compiles the React app into static files in /app/dist.
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build


# Runtime stage: nginx serves the static files; Node and the source code are not included.
FROM nginxinc/nginx-unprivileged:1.30-alpine

# Pull in Alpine security fixes published after the base image was built.
USER root
RUN apk upgrade --no-cache

ENV BACKEND_URL=http://backend:8000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Runs as the unprivileged nginx user (UID 101) on port 8080.
USER 101
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
