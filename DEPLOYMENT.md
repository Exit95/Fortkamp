# Galabau Fortkamp - Deployment Guide

## Repository
- **GitHub**: https://github.com/Exit95/Fortkamp.git
- **Branch**: main

## Server-Zugang
- **Host**: `2a01:4f8:202:1129:2447:2447:1:901`
- **User**: root
- **SSH Key**: `~/.ssh/danapfel`
- **Projekt-Verzeichnis**: `~/Fortkamp`

## Docker Registry
- **Registry**: `10.1.9.0:5000`
- **Image Name**: `galabau-fortkamp.de`
- **Stack File**: `~/Fortkamp/docker-stack.yml`
- **Stack Name**: `galabau-fortkamp-de`

---

## Befehle

### 1. Lokale Änderungen pushen (nach GitHub)
```bash
git add -A && git commit -m "Beschreibung" && git push origin main
```

### 2. Vollständiger Deploy (vom lokalen Rechner)
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "cd ~/Fortkamp && git pull && \
   docker build -t 10.1.9.0:5000/galabau-fortkamp.de:latest . && \
   docker push 10.1.9.0:5000/galabau-fortkamp.de:latest && \
   docker stack deploy -c docker-stack.yml galabau-fortkamp-de"
```

### 3. Nur Pull auf Server
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel "cd ~/Fortkamp && git pull"
```

### 4. Nur Build auf Server
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "cd ~/Fortkamp && docker build -t 10.1.9.0:5000/galabau-fortkamp.de:latest ."
```

### 5. Nur Push zum Registry
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "docker push 10.1.9.0:5000/galabau-fortkamp.de:latest"
```

### 6. Nur Stack Deploy
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "docker stack deploy -c ~/Fortkamp/docker-stack.yml galabau-fortkamp-de"
```

### 7. Service Force Update (ohne neuen Build)
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "docker service update --force galabau-fortkamp-de_web"
```

### 8. Logs ansehen
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "docker service logs galabau-fortkamp-de_web --tail 100"
```

### 9. Service Status prüfen
```bash
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "docker service ls"
```

---

## Traefik Labels
- Domain: `galabau-fortkamp.de`
- Port: `3000`
- TLS: Let's Encrypt via `myresolver`

---

## Quick Deploy (Copy & Paste)

**Alles in einem:**
```bash
git add -A && git commit -m "Update" && git push origin main && \
ssh root@2a01:4f8:202:1129:2447:2447:1:901 -i ~/.ssh/danapfel \
  "cd ~/Fortkamp && git pull && docker build -t 10.1.9.0:5000/galabau-fortkamp.de:latest . && docker push 10.1.9.0:5000/galabau-fortkamp.de:latest && docker service update --force galabau-fortkamp-de_web"
```

---

## Unterschiede zu Danapfel

| | Fortkamp | Danapfel |
|---|---|---|
| Verzeichnis | `~/Fortkamp` | `~/project` |
| Image | `galabau-fortkamp.de` | `danapfel-de` |
| Stack | `galabau-fortkamp-de` | `danapfel-de` |
| Stack File | `docker-stack.yml` (im Repo) | `~/danapfel-de.yml` |
| Domain | `galabau-fortkamp.de` | `danapfel-digital.de` |

