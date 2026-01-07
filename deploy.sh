#!/bin/bash

# Galabau Fortkamp Deployment Script
set -e

echo "🚀 Starting deployment for Galabau Fortkamp..."

# Configuration
REGISTRY="10.1.9.0:5000"
IMAGE_NAME="galabau-fortkamp.de"
TAG="latest"
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${TAG}"
STACK_NAME="galabau-fortkamp-de"

# Step 1: Build Docker image
echo ""
echo "📦 Building Docker image..."
docker build -t ${FULL_IMAGE} .

# Step 2: Push to registry
echo ""
echo "📤 Pushing image to registry..."
docker push ${FULL_IMAGE}

# Step 3: Deploy stack
echo ""
echo "🔄 Deploying stack..."
docker stack deploy -c docker-stack.yml ${STACK_NAME}

# Step 4: Wait for deployment
echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 5

# Step 5: Check status
echo ""
echo "📊 Deployment status:"
docker service ls | grep ${STACK_NAME}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Website: https://galabau-fortkamp.de"
echo "🔧 Admin: https://galabau-fortkamp.de/admin"
echo ""
echo "📝 Check logs with:"
echo "   docker service logs ${STACK_NAME}_web -f"

