#!/bin/bash

# Galabau Fortkamp - Deployment Script
# Dieses Skript baut und deployed die Website

set -e

echo "🚀 Starte Deployment für Galabau Fortkamp..."

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funktion für Fehlerbehandlung
error_exit() {
    echo -e "${RED}❌ Fehler: $1${NC}" 1>&2
    exit 1
}

# Prüfe ob Docker läuft
if ! docker info > /dev/null 2>&1; then
    error_exit "Docker läuft nicht. Bitte starte Docker."
fi

# Prüfe ob webproxy Netzwerk existiert
if ! docker network inspect webproxy > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Webproxy Netzwerk existiert nicht. Erstelle es...${NC}"
    docker network create webproxy || error_exit "Konnte webproxy Netzwerk nicht erstellen"
fi

# Stoppe alte Container
echo -e "${YELLOW}🛑 Stoppe alte Container...${NC}"
docker-compose down || true

# Baue neues Image
echo -e "${YELLOW}🔨 Baue Docker Image...${NC}"
docker-compose build --no-cache || error_exit "Docker Build fehlgeschlagen"

# Starte Container
echo -e "${YELLOW}🚢 Starte Container...${NC}"
docker-compose up -d || error_exit "Container Start fehlgeschlagen"

# Warte auf Container
echo -e "${YELLOW}⏳ Warte auf Container...${NC}"
sleep 5

# Prüfe Container Status
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment erfolgreich!${NC}"
    echo -e "${GREEN}🌐 Website ist erreichbar unter: https://test.danapfel-digital.de${NC}"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
else
    error_exit "Container läuft nicht korrekt"
fi

echo ""
echo "💡 Nützliche Befehle:"
echo "  - Logs anzeigen: docker-compose logs -f"
echo "  - Container stoppen: docker-compose down"
echo "  - Container neustarten: docker-compose restart"

