#!/usr/bin/env bash
# Run this ON the EC2 instance (Ubuntu 22.04/24.04) after SSH'ing in.
# Installs Docker + Compose, clones the repo, and gets api+postgres running
# using the existing docker-compose.yml at the repo root.
set -euo pipefail

# 1. Docker + Compose plugin
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"

# 2. Get the code onto the box
# Replace with your actual git remote (or scp the repo up instead)
# git clone <your-repo-url> vero
# cd vero

echo "Docker installed. Next steps:"
echo "  1) Log out/in (or 'newgrp docker') so your user can run docker without sudo"
echo "  2) cd into the repo, create backend/.env with real secrets (see .env.example)"
echo "  3) docker compose up -d postgres api"
echo "  4) Confirm with: curl http://localhost:8080/ (or your health route)"
