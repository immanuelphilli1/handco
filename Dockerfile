# syntax=docker/dockerfile:1

# Production only. There is deliberately no dev target: local work uses
# `npm run dev` directly. This image builds the storefront once,
# deterministically. The deploy workflow serves it from here for the smoke
# test and extracts the same files for the gateway's bind-mounted web root,
# so the verified image and the published build cannot drift apart.

FROM node:22-bookworm-slim AS build

WORKDIR /app

# Baked into the bundle by Vite at build time. Same origin as the API, so no
# CORS is involved. Override per market with --build-arg when needed.
ARG VITE_API_BASE_URL=https://handcoliveapi.craftsmanjohn.com/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Cap the heap so a small CI runner fails loudly instead of OOMing mid-build.
ENV NODE_OPTIONS=--max-old-space-size=4096

# Default Vite base ('/') on purpose, not /spa-assets/: the source references
# dozens of public files by literal absolute path (/assets/auth/...,
# /assets/featured/... in code and data), which Vite cannot rewrite with a
# base prefix. The gateway serves those from the web root's /assets/ block,
# and Vite's bundled chunks land in the fixed assets/ dir, so nothing collides
# with the admin portal's /build/. A /spa-assets/ base would 404 every one of
# those literal references and require relocating all public files at publish.
RUN npx tsc -b && npx vite build

# A build that still points at the Vite dev server would render a blank page
# in production. Fail the image here, not on the live origin.
RUN ! grep -qE '@vite/client|/@vite|localhost:517[0-9]' dist/index.html \
    && test -f dist/index.html

FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
