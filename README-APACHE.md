# 🌐 Apache2 Konfiguration für Astro

## Übersicht

Diese Website verwendet **Apache2** (httpd:2.4-alpine) als Webserver für die statische Astro-Website.

## 📁 Konfigurationsdateien

### 1. `apache.conf`
VirtualHost-Konfiguration für den Docker-Container:
- DocumentRoot: `/usr/local/apache2/htdocs`
- Aktiviert `.htaccess` Overrides
- Logging zu stdout/stderr
- Compression & Security Headers

### 2. `.htaccess`
Rewrite-Regeln und Optimierungen:
- **URL Rewriting:** Entfernt `.html` Endungen
- **Caching:** Browser-Caching für statische Assets (1 Jahr)
- **Compression:** Gzip für Text-Dateien
- **Security Headers:** X-Frame-Options, X-XSS-Protection, etc.
- **Error Pages:** Custom 404-Seite

## 🔧 Aktivierte Apache Module

Im Dockerfile werden folgende Module aktiviert:
- `mod_rewrite` - URL Rewriting
- `mod_deflate` - Gzip Compression
- `mod_expires` - Browser Caching
- `mod_headers` - HTTP Headers

## 🚀 Deployment

### Docker Build
```bash
docker build -t galabau-fortkamp .
```

### Lokaler Test
```bash
docker run -p 8080:80 galabau-fortkamp
# Öffne: http://localhost:8080
```

### Production Deployment
```bash
# Docker Compose
./deploy.sh

# Docker Swarm
./deploy-swarm.sh
```

## 📊 Performance-Optimierungen

### Caching-Strategie
- **Bilder:** 1 Jahr Cache (`max-age=31536000`)
- **CSS/JS:** 1 Monat Cache
- **HTML:** Kein Cache (immer aktuell)

### Compression
Alle Text-Dateien werden mit Gzip komprimiert:
- HTML, CSS, JavaScript
- JSON, XML
- SVG

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## 🔍 Troubleshooting

### .htaccess funktioniert nicht?
Prüfe ob `AllowOverride All` in `apache.conf` gesetzt ist.

### Rewrite Rules funktionieren nicht?
Stelle sicher, dass `mod_rewrite` aktiviert ist:
```bash
docker exec -it <container> apachectl -M | grep rewrite
```

### Compression funktioniert nicht?
Prüfe ob `mod_deflate` aktiviert ist:
```bash
docker exec -it <container> apachectl -M | grep deflate
```

## 📝 Logs

Logs werden zu stdout/stderr geschrieben und können mit Docker angezeigt werden:
```bash
# Docker Compose
docker-compose logs -f

# Docker Swarm
docker service logs galabau_galabau -f
```

## 🔄 Von Nginx zu Apache2

Falls du von Nginx kommst, hier die wichtigsten Unterschiede:

| Nginx | Apache2 |
|-------|---------|
| `nginx.conf` | `apache.conf` + `.htaccess` |
| `try_files` | `FallbackResource` |
| `location` blocks | `.htaccess` Regeln |
| Port 80 | Port 80 (gleich) |
| `nginx:alpine` | `httpd:2.4-alpine` |

## 🎯 Astro-spezifische Konfiguration

### URL-Struktur
Astro generiert Dateien mit `.html` Endung. Die `.htaccess` entfernt diese:
- `/about.html` → `/about`
- `/leistungen/index.html` → `/leistungen`

### Fallback für 404
```apache
FallbackResource /index.html
ErrorDocument 404 /404.html
```

### Statische Assets
Alle Dateien in `/public` werden direkt ausgeliefert mit optimalen Cache-Headern.

