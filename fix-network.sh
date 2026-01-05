#!/bin/bash

# Fix: Lösche altes lokales webproxy Netzwerk und erstelle Swarm Overlay-Netzwerk
# Dieses Skript behebt das Problem wenn ein lokales Netzwerk existiert

echo "🔧 Behebe webproxy Netzwerk-Problem..."

# Prüfe ob Swarm aktiv ist
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Fehler: Docker Swarm ist nicht aktiv."
    exit 1
fi

# Prüfe ob bereits ein Swarm Overlay-Netzwerk existiert
if docker network ls | grep -q "webproxy.*swarm"; then
    echo "✅ webproxy Overlay-Netzwerk existiert bereits - kein Fix nötig!"
    docker network inspect webproxy
    exit 0
fi

# Prüfe ob ein lokales Netzwerk existiert
if docker network ls | grep -q "webproxy"; then
    echo "⚠️  Lokales webproxy Netzwerk gefunden - wird gelöscht..."
    
    # Zeige Container die das Netzwerk verwenden
    echo ""
    echo "📋 Container die das Netzwerk verwenden:"
    docker ps --filter network=webproxy --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"
    
    # Frage ob fortfahren
    echo ""
    read -p "Möchtest du das Netzwerk löschen und neu erstellen? (y/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Abgebrochen"
        exit 1
    fi
    
    # Lösche Netzwerk
    echo "🗑️  Lösche altes Netzwerk..."
    docker network rm webproxy
    
    if [ $? -ne 0 ]; then
        echo "❌ Fehler beim Löschen. Stoppe zuerst alle Container:"
        echo "   docker ps --filter network=webproxy -q | xargs docker stop"
        exit 1
    fi
    
    echo "✅ Altes Netzwerk gelöscht"
fi

# Erstelle Overlay-Netzwerk
echo "📡 Erstelle webproxy Overlay-Netzwerk..."
docker network create \
    --driver overlay \
    --attachable \
    webproxy

if [ $? -eq 0 ]; then
    echo "✅ webproxy Overlay-Netzwerk erfolgreich erstellt!"
    echo ""
    docker network inspect webproxy
    echo ""
    echo "🎉 Problem behoben! Du kannst jetzt deployen:"
    echo "   ./deploy-swarm.sh"
else
    echo "❌ Fehler beim Erstellen des Netzwerks"
    exit 1
fi

