#!/bin/bash

# galabau-fortkamp.de - Docker Swarm Deployment Script
# Dieses Skript baut das Image, pusht es zur Registry und deployed den Stack

set -e

echo "🚀 Starte Docker Swarm Deployment für galabau-fortkamp.de..."

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Konfiguration
# Registry-Adresse (kann über Umgebungsvariable überschrieben werden)
REGISTRY="${REGISTRY:-10.1.9.0:5000}"
IMAGE_NAME="galabau-fortkamp.de"
STACK_NAME="galabau-fortkamp-de"

echo -e "${YELLOW}📝 Verwende Registry: ${REGISTRY}${NC}"

# Funktion für Fehlerbehandlung
error_exit() {
    echo -e "${RED}❌ Fehler: $1${NC}" 1>&2
    exit 1
}

# Prüfe ob Docker läuft
if ! docker info > /dev/null 2>&1; then
    error_exit "Docker läuft nicht. Bitte starte Docker."
fi

# Prüfe ob Swarm aktiv ist
if ! docker info | grep -q "Swarm: active"; then
    error_exit "Docker Swarm ist nicht aktiv. Bitte initialisiere Swarm zuerst."
fi

# Prüfe/Erstelle webproxy Overlay-Netzwerk
echo -e "${YELLOW}🌐 Prüfe webproxy Netzwerk...${NC}"
if docker network ls | grep -q "webproxy.*swarm"; then
    echo -e "${GREEN}✅ webproxy Overlay-Netzwerk existiert${NC}"
elif docker network ls | grep -q "webproxy"; then
    echo -e "${RED}❌ Ein lokales 'webproxy' Netzwerk existiert!${NC}"
    echo -e "${YELLOW}   Bitte lösche es zuerst:${NC}"
    echo -e "   docker network rm webproxy"
    echo -e "   Oder führe aus: ./create-network.sh"
    error_exit "Falscher Netzwerk-Typ"
else
    echo -e "${YELLOW}📡 Erstelle webproxy Overlay-Netzwerk...${NC}"
    docker network create --driver overlay --attachable webproxy || error_exit "Netzwerk-Erstellung fehlgeschlagen"
    echo -e "${GREEN}✅ Netzwerk erstellt${NC}"
fi

echo -e "${YELLOW}🔨 Baue Docker Image...${NC}"
docker build -t ${IMAGE_NAME}:latest . || error_exit "Docker Build fehlgeschlagen"

echo -e "${YELLOW}🏷️  Tagge Image für Registry...${NC}"
docker tag ${IMAGE_NAME}:latest ${REGISTRY}/${IMAGE_NAME}:latest

echo -e "${YELLOW}📤 Pushe Image zur Swarm Registry...${NC}"
docker push ${REGISTRY}/${IMAGE_NAME}:latest || error_exit "Push zur Registry fehlgeschlagen"

echo -e "${YELLOW}🚢 Deploye Stack zu Swarm...${NC}"
docker stack deploy -c docker-stack.yml ${STACK_NAME} || error_exit "Stack Deployment fehlgeschlagen"

echo -e "${YELLOW}⏳ Warte auf Service...${NC}"
sleep 5

# Prüfe Service Status
echo -e "${GREEN}✅ Deployment erfolgreich!${NC}"
echo -e "${GREEN}🌐 Website ist erreichbar unter: https://galabau-fortkamp.de${NC}"
echo ""
echo "📊 Stack Status:"
docker stack ps ${STACK_NAME}
echo ""
echo "📋 Services:"
docker stack services ${STACK_NAME}

echo ""
echo "💡 Nützliche Befehle:"
echo "  - Logs anzeigen: docker service logs -f ${STACK_NAME}_web"
echo "  - Service Status: docker stack services ${STACK_NAME}"
echo "  - Stack entfernen: docker stack rm ${STACK_NAME}"
echo "  - Service skalieren: docker service scale ${STACK_NAME}_web=3"

