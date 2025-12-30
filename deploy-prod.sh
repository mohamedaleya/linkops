#!/bin/bash

# Fail immediately if any command exits with a non-zero status
set -euo pipefail

# Enable debug output for troubleshooting
# set -x

set -a  # Automatically export all variables
if [ -f .env.prod ]; then
    source .env.prod
else
    source .env.production
fi
set +a  # Stop automatically exporting

# Define variables for convenience and readability
REGISTRY="ghcr.io"
IMAGE_NAME="$REGISTRY/mohamedaleya/linkops"
TAG_VERSION=$(node -p "require('./package.json').version")
TAG_LATEST="latest"

# Function to log in to Docker Hub
docker_login() {
    echo "Logging in to GHCR..."
    echo "$DOCKER_PAT" | docker login "$REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
}

# Function to build the Docker image
build_image() {
    echo "Building Docker image (no cache)..."
    # Build specifically for linux/amd64 to match VPS
    # Pass NEXT_PUBLIC_URL as build arg so it's baked into the client bundle
    docker build --platform linux/amd64 \
        --build-arg NEXT_PUBLIC_URL="$NEXT_PUBLIC_URL" \
        -t "${IMAGE_NAME}:${TAG_VERSION}" \
        -t "${IMAGE_NAME}:${TAG_LATEST}" . || { echo "Docker build failed."; exit 1; }
}

# Function to push the Docker image
push_image() {
    echo "Pushing Docker image to Docker Hub..."
    docker push "${IMAGE_NAME}:${TAG_VERSION}"
    docker push "${IMAGE_NAME}:${TAG_LATEST}"
}

# Function to update VPS configuration
update_vps_config() {
    echo "Updating VPS configuration..."
    # Create directory if it doesn't exist
    ssh -i "~/.ssh/ovh_dev_server" "$VPS_USERNAME"@"$VPS_IP" "mkdir -p linkops"
    
    # Copy configuration files
    scp -i "~/.ssh/ovh_dev_server" docker-compose.prod.yml "$VPS_USERNAME"@"$VPS_IP":~/linkops/docker-compose.yml
    scp -i "~/.ssh/ovh_dev_server" .env.prod "$VPS_USERNAME"@"$VPS_IP":~/linkops/.env
}

# Function to deploy the Docker container
deploy_container() {
    echo "Deploying Docker container..."
    ssh -i "~/.ssh/ovh_dev_server" "$VPS_USERNAME"@"$VPS_IP" <<INNEREOF
    echo "$DOCKER_PAT" | docker login "$REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
    
    # Navigate to project directory
    cd linkops
    
    # Pull the new image
    docker pull "${IMAGE_NAME}:${TAG_LATEST}"
    
    # Restart containers with fresh pull and recreation
    docker compose up -d --force-recreate
INNEREOF
}

# Main script execution
docker_login
build_image
push_image
update_vps_config
deploy_container
