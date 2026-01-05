#!/bin/bash

# Erstelle webproxy Overlay-Netzwerk für Docker Swarm
# Dieses Skript muss nur einmal auf dem Swarm Manager ausgeführt werden

echo "🌐 Erstelle webproxy Overlay-Netzwerk für Docker Swarm..."

# Prüfe ob Swarm aktiv ist
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Fehler: Docker Swarm ist nicht aktiv."
    exit 1
fi

# Prüfe ob Netzwerk bereits existiert
if docker network ls | grep -q "webproxy.*swarm"; then
    echo "✅ webproxy Netzwerk existiert bereits"
    docker network inspect webproxy
else
    echo "📡 Erstelle webproxy Overlay-Netzwerk..."
    docker network create \
        --driver overlay \
        --attachable \
        webproxy
    
    if [ $? -eq 0 ]; then
        echo "✅ webproxy Netzwerk erfolgreich erstellt!"
        docker network inspect webproxy
    else
        echo "❌ Fehler beim Erstellen des Netzwerks"
        exit 1
    fi
fi

echo ""
echo "💡 Dieses Netzwerk wird von Traefik und allen Services verwendet."
echo "   Services können sich mit '--network webproxy' verbinden."

