# 🚀 Deployment auf dem Server

## Schnellanleitung

### 1. Auf den Server verbinden
```bash
ssh root@dein-server
cd ~/Fortkamp
```

### 2. Neueste Änderungen holen
```bash
git pull
```

### 3. Deployment ausführen
```bash
./deploy-swarm.sh
```

## ⚠️ WICHTIG: Korrektes Stack-File verwenden

**NICHT** das alte `~/test.danapfel-digital-de.yml` verwenden!

Das Deployment-Skript `deploy-swarm.sh` verwendet automatisch das korrekte `docker-stack.yml` aus dem Repository.

## 🔧 Manuelles Deployment (falls nötig)

Falls du manuell deployen möchtest:

```bash
cd ~/Fortkamp

# Stack deployen
docker stack deploy -c docker-stack.yml galabau

# NICHT verwenden:
# docker stack deploy -c ~/test.danapfel-digital-de.yml Fortkamp  ❌
```

## 📋 Wichtige Unterschiede

### ✅ Korrektes Stack-File (`docker-stack.yml`)
- Image: `10.1.9.0:5000/galabau-fortkamp:latest`
- Netzwerk: `webproxy`
- Port: `80` (Apache2)
- Certresolver: `letsencrypt`
- Stack-Name: `galabau`

### ❌ Altes Stack-File (`~/test.danapfel-digital-de.yml`)
- Image: `test.danapfel-digital-de` (existiert nicht!)
- Netzwerk: `public-ingress` (falsch)
- Port: `3000` (falsch für Apache)
- Certresolver: `myresolver` (falsch)
- Stack-Name: `Fortkamp`

## 🗑️ Alten Stack entfernen

Falls der alte Stack noch läuft:

```bash
# Alten Stack entfernen
docker stack rm Fortkamp

# Warten bis alle Container gestoppt sind
docker stack ps Fortkamp  # Sollte leer sein

# Neuen Stack deployen
cd ~/Fortkamp
./deploy-swarm.sh
```

## ✅ Deployment verifizieren

```bash
# Service-Status prüfen
docker service ls | grep galabau

# Logs anzeigen
docker service logs -f galabau_galabau-fortkamp

# Traefik-Routing prüfen
docker service logs traefik | grep -i fortkamp

# Website testen
curl -I https://test.danapfel-digital.de
```

## 🌐 Erwartetes Ergebnis

Nach erfolgreichem Deployment:
- ✅ Service läuft: `galabau_galabau-fortkamp`
- ✅ Replicas: `1/1`
- ✅ Apache2 läuft auf Port 80
- ✅ Traefik routet zu `test.danapfel-digital.de`
- ✅ HTTPS mit Let's Encrypt
- ✅ HTTP → HTTPS Redirect

## 🔍 Troubleshooting

### Website nicht erreichbar?

1. **Prüfe Service-Status:**
   ```bash
   docker service ps galabau_galabau-fortkamp
   ```

2. **Prüfe Traefik-Labels:**
   ```bash
   docker service inspect galabau_galabau-fortkamp --format '{{json .Spec.TaskTemplate.ContainerSpec.Labels}}' | jq
   ```

3. **Prüfe Netzwerk:**
   ```bash
   docker network inspect webproxy
   ```

4. **Teste Apache direkt:**
   ```bash
   docker exec $(docker ps -q -f name=galabau_galabau-fortkamp) wget -O- http://localhost/
   ```

5. **Prüfe DNS:**
   ```bash
   nslookup test.danapfel-digital.de
   ```

### Falsches Image?

```bash
# Prüfe welches Image verwendet wird
docker service inspect galabau_galabau-fortkamp --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'

# Sollte sein: 10.1.9.0:5000/galabau-fortkamp:latest
```

### Falscher Port?

```bash
# Prüfe Port in Labels
docker service inspect galabau_galabau-fortkamp | grep loadbalancer.server.port

# Sollte sein: 80 (nicht 3000!)
```

