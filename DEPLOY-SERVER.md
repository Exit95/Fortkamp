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
- Image: `10.1.9.0:5000/test.danapfel-digital.de:latest`
- Netzwerk: `public-ingress` (wie alle anderen Services!)
- Port: `80` (Apache2)
- Certresolver: `myresolver` (wie alle anderen Services!)
- Stack-Name: `test-danapfel-digital-de`
- Service-Name: `web`

## 🗑️ Alte Stacks entfernen

Falls alte Stacks noch laufen:

```bash
# Alle alten Stacks entfernen
docker stack rm Fortkamp 2>/dev/null || true
docker stack rm galabau 2>/dev/null || true

# Warten bis alle Container gestoppt sind (10 Sekunden)
sleep 10

# Neuen Stack deployen
cd ~/Fortkamp
./deploy-swarm.sh
```

## ✅ Deployment verifizieren

```bash
# Service-Status prüfen
docker service ls | grep test-danapfel-digital-de

# Logs anzeigen
docker service logs -f test-danapfel-digital-de_web

# Traefik-Routing prüfen
docker service logs ingress_traefik | grep -i "test.danapfel"

# Website testen
curl -I https://test.danapfel-digital.de
```

## 🌐 Erwartetes Ergebnis

Nach erfolgreichem Deployment:
- ✅ Service läuft: `test-danapfel-digital-de_web`
- ✅ Replicas: `1/1`
- ✅ Apache2 läuft auf Port 80
- ✅ Traefik routet zu `test.danapfel-digital.de`
- ✅ HTTPS mit Let's Encrypt
- ✅ HTTP → HTTPS Redirect

## 🔍 Troubleshooting

### Website nicht erreichbar?

1. **Prüfe Service-Status:**
   ```bash
   docker service ps test-danapfel-digital-de_web
   ```

2. **Prüfe Traefik-Labels:**
   ```bash
   docker service inspect test-danapfel-digital-de_web --format '{{json .Spec.TaskTemplate.ContainerSpec.Labels}}' | jq
   ```

3. **Prüfe Netzwerk:**
   ```bash
   docker network inspect webproxy
   ```

4. **Teste Apache direkt:**
   ```bash
   docker exec $(docker ps -q -f name=test-danapfel-digital-de_web) wget -O- http://localhost/
   ```

5. **Prüfe DNS:**
   ```bash
   nslookup test.danapfel-digital.de
   ```

### Falsches Image?

```bash
# Prüfe welches Image verwendet wird
docker service inspect test-danapfel-digital-de_web --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'

# Sollte sein: 10.1.9.0:5000/test.danapfel-digital.de:latest
```

### Falscher Port?

```bash
# Prüfe Port in Labels
docker service inspect test-danapfel-digital-de_web | grep loadbalancer.server.port

# Sollte sein: 80 (nicht 3000!)
```

