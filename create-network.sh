#!/bin/bash

# Erstelle webproxy Overlay-Netzwerk für Docker Swarm
# Dieses Skript muss nur einmal auf dem Swarm Manager ausgeführt werden

echo "🌐 Erstelle webproxy Overlay-Netzwerk für Docker Swarm..."

# Prüfe ob Swarm aktiv ist
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Fehler: Docker Swarm ist nicht aktiv."
    exit 1
fi

# Prüfe ob Netzwerk bereits als Swarm Overlay existiert
if docker network ls | grep -q "webproxy.*swarm"; then
    echo "✅ webproxy Overlay-Netzwerk existiert bereits"
    docker network inspect webproxy
    exit 0
fi

# Prüfe ob ein lokales webproxy Netzwerk existiert
if docker network ls | grep -q "webproxy"; then
    echo "⚠️  Ein lokales 'webproxy' Netzwerk existiert bereits!"
    echo "   Dieses muss gelöscht werden, um ein Swarm Overlay-Netzwerk zu erstellen."
    echo ""
    echo "🔧 Führe folgende Schritte aus:"
    echo ""
    echo "   1. Stoppe alle Container die das Netzwerk verwenden:"
    echo "      docker ps --filter network=webproxy"
    echo ""
    echo "   2. Lösche das alte Netzwerk:"
    echo "      docker network rm webproxy"
    echo ""
    echo "   3. Führe dieses Skript erneut aus:"
    echo "      ./create-network.sh"
    echo ""
    exit 1
fi

# Erstelle Overlay-Netzwerk
echo "📡 Erstelle webproxy Overlay-Netzwerk..."
docker network create \
    --driver overlay \
    --attachable \
    webproxy

if [ $? -eq 0 ]; then
    echo "✅ webproxy Overlay-Netzwerk erfolgreich erstellt!"
    docker network inspect webproxy
else
    echo "❌ Fehler beim Erstellen des Netzwerks"
    exit 1
fi

echo ""
echo "💡 Dieses Netzwerk wird von Traefik und allen Services verwendet."
echo "   Services können sich mit '--network webproxy' verbinden."

