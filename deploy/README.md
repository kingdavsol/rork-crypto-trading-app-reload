# Deployment (Web)

## Build locally

```
bun install --frozen-lockfile
bun run build:web
```

Artifacts are in `dist/`.

## Docker

```
# build
docker build -t rork-web:latest .
# run
docker run -d -p 8080:80 --name rork-web rork-web:latest
```

## VPS (SSH)

```
# copy files if not using docker
rsync -avz dist/ user@server:/var/www/rork
# or copy the repo and build on server
rsync -avz --exclude node_modules --exclude dist . user@server:~/rork
```

Use a reverse proxy (nginx) to serve `/var/www/rork`.
