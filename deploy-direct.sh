#!/bin/bash

# Direct deployment to server (without registry)
set -e

echo "🚀 Direct deployment for Galabau Fortkamp..."

# Configuration
IMAGE_NAME="galabau-fortkamp.de"
TAG="latest"
LOCAL_IMAGE="${IMAGE_NAME}:${TAG}"
SERVER="root@2a01:4f8:202:1129:2447:2447:1:901"
STACK_NAME="galabau-fortkamp-de"

# Step 1: Build Docker image locally
echo ""
echo "📦 Building Docker image locally..."
docker build -t ${LOCAL_IMAGE} .

# Step 2: Save image to tar
echo ""
echo "💾 Saving image to tar file..."
docker save ${LOCAL_IMAGE} | gzip > /tmp/${IMAGE_NAME}.tar.gz

# Step 3: Copy to server
echo ""
echo "📤 Copying image to server..."
scp /tmp/${IMAGE_NAME}.tar.gz ${SERVER}:/tmp/

# Step 4: Load image on server
echo ""
echo "📥 Loading image on server..."
ssh ${SERVER} "docker load < /tmp/${IMAGE_NAME}.tar.gz"

# Step 5: Tag for registry
echo ""
echo "🏷️  Tagging image for registry..."
ssh ${SERVER} "docker tag ${LOCAL_IMAGE} 10.1.9.0:5000/${LOCAL_IMAGE}"

# Step 6: Push to local registry
echo ""
echo "📤 Pushing to local registry..."
ssh ${SERVER} "docker push 10.1.9.0:5000/${LOCAL_IMAGE}"

# Step 7: Deploy stack
echo ""
echo "🔄 Deploying stack..."
scp docker-stack.yml ${SERVER}:/tmp/
ssh ${SERVER} "docker stack deploy -c /tmp/docker-stack.yml ${STACK_NAME}"

# Step 8: Cleanup
echo ""
echo "🧹 Cleaning up..."
rm /tmp/${IMAGE_NAME}.tar.gz
ssh ${SERVER} "rm /tmp/${IMAGE_NAME}.tar.gz /tmp/docker-stack.yml"

# Step 9: Wait and check status
echo ""
echo "⏳ Waiting for deployment..."
sleep 10

echo ""
echo "📊 Deployment status:"
ssh ${SERVER} "docker service ls | grep ${STACK_NAME}"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Website: https://galabau-fortkamp.de"
echo "🔧 Admin: https://galabau-fortkamp.de/admin"
echo ""
echo "📝 Check logs with:"
echo "   ssh ${SERVER} 'docker service logs ${STACK_NAME}_web -f'"

