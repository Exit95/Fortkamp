# 🚀 Galabau Fortkamp - Schnellstart Deployment

## Subdomain: test.danapfel-digital.de

### ✅ Voraussetzungen

1. **Server mit Docker & Docker Compose**
2. **Traefik Reverse Proxy** läuft bereits
3. **Webproxy Netzwerk** existiert: `docker network create webproxy`
4. **DNS-Eintrag** für test.danapfel-digital.de zeigt auf deinen Server

### 🎯 Deployment in 3 Schritten

#### 1. DNS konfigurieren
Erstelle einen A-Record bei deinem DNS-Provider:
```
A-Record: test.danapfel-digital.de → [IP deines Servers]
```

Prüfen mit:
```bash
nslookup test.danapfel-digital.de
```

#### 2. Webproxy Netzwerk erstellen (falls nicht vorhanden)
```bash
docker network create webproxy
```

#### 3. Deployment starten
```bash
./deploy.sh
```

Das war's! 🎉

### 🌐 Zugriff

Nach erfolgreichem Deployment:
- **URL:** https://test.danapfel-digital.de
- **Automatisches HTTPS** via Let's Encrypt
- **HTTP → HTTPS Redirect** aktiv

### 📊 Nützliche Befehle

```bash
# Logs anzeigen
docker-compose logs -f

# Container Status
docker-compose ps

# Container neustarten
docker-compose restart

# Container stoppen
docker-compose down

# Neu deployen
./deploy.sh
```

### 🔧 Troubleshooting

#### Website nicht erreichbar?

1. **DNS prüfen:**
   ```bash
   nslookup test.danapfel-digital.de
   ```

2. **Container Status:**
   ```bash
   docker-compose ps
   ```

3. **Logs prüfen:**
   ```bash
   docker-compose logs -f galabau-fortkamp
   docker logs traefik
   ```

4. **Netzwerk prüfen:**
   ```bash
   docker network inspect webproxy
   ```

#### SSL-Zertifikat Fehler?

Traefik benötigt einige Minuten für Let's Encrypt:
```bash
docker logs traefik | grep -i acme
```

### 📝 Wichtige Dateien

- `docker-compose.yml` - Container & Traefik Konfiguration
- `Dockerfile` - Build-Anweisungen
- `nginx.conf` - Webserver Konfiguration
- `deploy.sh` - Automatisches Deployment-Skript
- `astro.config.mjs` - Site URL Konfiguration

### 🔄 Updates deployen

```bash
# Code aktualisieren
git pull

# Neu deployen
./deploy.sh
```

### 📚 Weitere Informationen

Siehe `README-DEPLOYMENT.md` für detaillierte Informationen und Traefik-Setup.

