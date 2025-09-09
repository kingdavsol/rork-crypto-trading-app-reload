# syntax=docker/dockerfile:1
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
COPY . .
RUN bun install --frozen-lockfile
RUN bunx expo export --platform web -o dist

FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

