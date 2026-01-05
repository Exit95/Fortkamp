# Galabau Fortkamp - Docker Swarm Deployment

## Für dein Proxmox Docker Swarm Setup

### 🎯 Übersicht

Dein Setup:
- **Swarm Manager:** 1901 (swarm-manager-1)
- **Swarm Workers:** 1910, 1911 (swarm-worker-1, swarm-worker-2)
- **Registry:** 1900 (swarm-registry) auf Port 5000
- **Subdomain:** test.danapfel-digital.de

## 🚀 Schnellstart

### 1. Code auf Swarm Manager hochladen

```bash
# Auf deinem lokalen Rechner
git push origin main

# Auf dem Swarm Manager (1901) einloggen und klonen
ssh root@<swarm-manager-ip>
git clone https://github.com/Exit95/Fortkamp.git
cd Fortkamp
```

### 2. Deployment ausführen

```bash
# Skript ausführbar machen
chmod +x deploy-swarm.sh

# Deployment starten
./deploy-swarm.sh
```

Das war's! 🎉

## 📋 Manuelle Schritte

### Schritt 1: Image bauen

```bash
docker build -t galabau-fortkamp:latest .
```

### Schritt 2: Image taggen für Registry

```bash
docker tag galabau-fortkamp:latest 10.1.9.0:5000/galabau-fortkamp:latest
```

### Schritt 3: Image zur Registry pushen

```bash
docker push 10.1.9.0:5000/galabau-fortkamp:latest
```

### Schritt 4: Stack deployen

```bash
docker stack deploy -c docker-stack.yml galabau
```

## 🔍 Status prüfen

### Stack Services anzeigen

```bash
docker stack services galabau
```

### Service Logs anzeigen

```bash
docker service logs -f galabau_galabau-fortkamp
```

### Stack Tasks/Container anzeigen

```bash
docker stack ps galabau
```

### Welcher Node führt den Service aus?

```bash
docker service ps galabau_galabau-fortkamp
```

## 🔧 Verwaltung

### Service skalieren

```bash
# Auf 3 Replicas skalieren
docker service scale galabau_galabau-fortkamp=3
```

### Service aktualisieren (nach Code-Änderungen)

```bash
# Neu bauen und pushen
docker build -t galabau-fortkamp:latest .
docker tag galabau-fortkamp:latest 10.1.9.0:5000/galabau-fortkamp:latest
docker push 10.1.9.0:5000/galabau-fortkamp:latest

# Service aktualisieren (Rolling Update)
docker service update --image 10.1.9.0:5000/galabau-fortkamp:latest galabau_galabau-fortkamp
```

### Stack entfernen

```bash
docker stack rm galabau
```

### Stack neu deployen

```bash
docker stack rm galabau
sleep 10
docker stack deploy -c docker-stack.yml galabau
```

## 🌐 DNS Konfiguration

Stelle sicher, dass der DNS-Eintrag auf deinen Swarm zeigt:

```
A-Record: test.danapfel-digital.de → <IP deines Swarm Managers oder Load Balancer>
```

## 📊 Monitoring

### Alle Swarm Services

```bash
docker service ls
```

### Swarm Nodes

```bash
docker node ls
```

### Service Inspect

```bash
docker service inspect galabau_galabau-fortkamp --pretty
```

## 🔄 Updates deployen

### Automatisch mit Skript

```bash
./deploy-swarm.sh
```

### Manuell (Rolling Update)

```bash
# Code aktualisieren
git pull

# Image neu bauen und pushen
docker build -t galabau-fortkamp:latest .
docker tag galabau-fortkamp:latest 10.1.9.0:5000/galabau-fortkamp:latest
docker push 10.1.9.0:5000/galabau-fortkamp:latest

# Rolling Update
docker service update --image 10.1.9.0:5000/galabau-fortkamp:latest galabau_galabau-fortkamp
```

## 🐛 Troubleshooting

### Service startet nicht

```bash
# Logs prüfen
docker service logs galabau_galabau-fortkamp

# Tasks prüfen
docker service ps galabau_galabau-fortkamp --no-trunc
```

### Image nicht gefunden

```bash
# Prüfe ob Image in Registry ist
curl http://10.1.9.0:5000/v2/_catalog

# Prüfe Image Tags
curl http://10.1.9.0:5000/v2/galabau-fortkamp/tags/list
```

### Traefik findet Service nicht

```bash
# Prüfe Traefik Logs
docker service logs traefik_traefik

# Prüfe ob Service im webproxy Netzwerk ist
docker network inspect webproxy
```

### Website nicht erreichbar

1. DNS prüfen: `nslookup test.danapfel-digital.de`
2. Service Status: `docker service ps galabau_galabau-fortkamp`
3. Traefik Logs: `docker service logs traefik_traefik`
4. Service Logs: `docker service logs galabau_galabau-fortkamp`

## 📝 Wichtige Dateien

- `docker-stack.yml` - Swarm Stack Definition
- `Dockerfile` - Image Build Instructions
- `nginx.conf` - Webserver Konfiguration
- `deploy-swarm.sh` - Automatisches Deployment-Skript

## 🔐 Registry Zugriff

Falls die Registry Authentifizierung benötigt:

```bash
docker login 10.1.9.0:5000
```

## 💡 Best Practices

1. **Immer über Registry deployen** - Nicht lokal gebaute Images verwenden
2. **Rolling Updates nutzen** - `docker service update` für Zero-Downtime
3. **Health Checks** - Sind bereits im Dockerfile definiert
4. **Replicas** - Bei Bedarf auf mehrere Nodes verteilen
5. **Logs** - Regelmäßig prüfen mit `docker service logs`

## 🎯 Nächste Schritte

1. ✅ Code ist auf GitHub
2. ⏳ Auf Swarm Manager klonen
3. ⏳ `./deploy-swarm.sh` ausführen
4. ⏳ DNS konfigurieren
5. ✅ Website unter https://test.danapfel-digital.de erreichbar

