# Galabau Fortkamp - Deployment Anleitung

## Voraussetzungen

1. **Docker & Docker Compose** installiert
2. **Traefik** als Reverse Proxy läuft
3. **Webproxy Netzwerk** existiert
4. **DNS-Eintrag** für die Subdomain

## Schnellstart

### 1. Subdomain konfigurieren

Die Subdomain ist bereits konfiguriert: **test.danapfel-digital.de**

Falls du sie ändern möchtest, öffne `docker-compose.yml` und passe die Host-Regeln an.

### 2. Deployment ausführen

```bash
# Skript ausführbar machen
chmod +x deploy.sh

# Deployment starten
./deploy.sh
```

### 3. DNS konfigurieren

Erstelle einen A-Record oder CNAME für deine Subdomain:

```
test.danapfel-digital.de  →  IP-Adresse deines Servers
```

## Manuelle Schritte

### Webproxy Netzwerk erstellen (falls nicht vorhanden)

```bash
docker network create webproxy
```

### Container bauen und starten

```bash
# Image bauen
docker-compose build

# Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

### Container verwalten

```bash
# Status prüfen
docker-compose ps

# Container stoppen
docker-compose down

# Container neustarten
docker-compose restart

# Logs anzeigen
docker-compose logs -f galabau-fortkamp
```

## Traefik Konfiguration

### Beispiel Traefik docker-compose.yml

Falls du noch keinen Traefik hast:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    networks:
      - webproxy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./acme.json:/acme.json
    labels:
      - "traefik.enable=true"

networks:
  webproxy:
    external: true
```

### Traefik Konfiguration (traefik.yml)

```yaml
api:
  dashboard: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: webproxy

certificatesResolvers:
  letsencrypt:
    acme:
      email: deine-email@example.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

## Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker-compose logs galabau-fortkamp

# Container Status
docker-compose ps
```

### Website nicht erreichbar

1. Prüfe DNS-Eintrag: `nslookup galabau.deine-domain.de`
2. Prüfe Traefik Logs: `docker logs traefik`
3. Prüfe ob Container läuft: `docker-compose ps`
4. Prüfe Netzwerk: `docker network inspect webproxy`

### SSL-Zertifikat Probleme

```bash
# Traefik Logs prüfen
docker logs traefik

# acme.json Berechtigungen prüfen
chmod 600 acme.json
```

## Updates

### Website aktualisieren

```bash
# Code aktualisieren (git pull, etc.)
git pull

# Neu deployen
./deploy.sh
```

## Produktions-Optimierungen

### 1. Astro Site URL anpassen

In `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://test.danapfel-digital.de',
  // ...
});
```

### 2. Umgebungsvariablen

Erstelle `.env` Datei:

```env
SITE_URL=https://test.danapfel-digital.de
```

## Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs -f`
2. Container Status: `docker-compose ps`
3. Traefik Dashboard prüfen

