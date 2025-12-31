#!/bin/bash

# Fail immediately if any command exits with a non-zero status
set -euo pipefail

# Enable debug output for troubleshooting
# set -x

set -a  # Automatically export all variables
if [ -f .env.staging ]; then
    source .env.staging
else
    echo "Error: .env.staging file not found."
    exit 1
fi
set +a  # Stop automatically exporting

# Define variables
# Usage of GHCR as per plan
REGISTRY="ghcr.io"
IMAGE_NAME="$REGISTRY/mohamedaleya/linkops"
TAG_STAGING="staging"

# Function to log in to Docker Hub / GHCR
docker_login() {
    echo "Logging in to GHCR..."
    # Assuming GITHUB_TOKEN or similar is available or reusing DOCKER_PAT if compatible
    # If using GHCR, we normally need a PAT with package read/write scope
    echo "$DOCKER_PAT" | docker login "$REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
}

# Function to build the Docker image
build_image() {
    echo "Building Docker image for STAGING..."
    # Build specifically for linux/amd64
    docker build --platform linux/amd64 \
        --build-arg NEXT_PUBLIC_URL="https://staging.linkops.at" \
        -t "${IMAGE_NAME}:${TAG_STAGING}" . || { echo "Docker build failed."; exit 1; }
}

# Function to push the Docker image
push_image() {
    echo "Pushing Docker image to GHCR..."
    docker push "${IMAGE_NAME}:${TAG_STAGING}"
}

# Function to update VPS configuration
update_vps_config() {
    echo "Updating VPS configuration for STAGING..."
    # Create directory if it doesn't exist
    ssh -i "~/.ssh/ovh_dev_server" "$VPS_USERNAME"@"$VPS_IP" "mkdir -p linkops"
    
    # Copy configuration files (keeping filenames distinct from prod)
    scp -i "~/.ssh/ovh_dev_server" docker-compose.staging.yml "$VPS_USERNAME"@"$VPS_IP":~/linkops/docker-compose.staging.yml
    scp -i "~/.ssh/ovh_dev_server" .env.staging "$VPS_USERNAME"@"$VPS_IP":~/linkops/.env.staging
}

# Function to deploy the Docker container
deploy_container() {
    echo "Deploying Docker container..."
    ssh -i "~/.ssh/ovh_dev_server" "$VPS_USERNAME"@"$VPS_IP" <<INNEREOF
    echo "$DOCKER_PAT" | docker login "$REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
    
    # Navigate to project directory
    cd linkops
    
    # Pull the new staging image
    docker pull "${IMAGE_NAME}:${TAG_STAGING}"
    
    # Restart containers
    # Using explicit file and env file
    docker compose -f docker-compose.staging.yml --env-file .env.staging up -d --force-recreate
INNEREOF
}

# Main script execution
docker_login
build_image
push_image
update_vps_config
deploy_container
