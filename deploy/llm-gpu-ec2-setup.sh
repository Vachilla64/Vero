#!/usr/bin/env bash
# Run this ON a GPU EC2 instance (recommended: g4dn.xlarge, Ubuntu 22.04,
# "Deep Learning AMI" or plain Ubuntu + NVIDIA driver install below).
# Sets up Ollama and pulls a small model for the backend to call.
set -euo pipefail

# 1. NVIDIA driver (skip if using a Deep Learning AMI that already has it)
sudo apt-get update -y
sudo apt-get install -y ubuntu-drivers-common
sudo ubuntu-drivers autoinstall
echo "Reboot required after driver install: sudo reboot, then re-run from step 2."

# 2. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 3. Pull a small model (pick one; llama3.1:8b is a good default balance)
ollama pull llama3.1:8b
# Alternatives: ollama pull phi3:mini   (smaller/faster, less capable)

# 4. Make Ollama listen on all interfaces (not just localhost) so the
#    backend EC2 instance can reach it over the private network.
sudo systemctl edit ollama --full <<'EOF'
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
Environment="OLLAMA_HOST=0.0.0.0:11434"
User=ollama
Group=ollama
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF
sudo systemctl daemon-reload
sudo systemctl restart ollama

echo "Ollama running on port 11434."
echo "IMPORTANT: lock down the security group so port 11434 is only reachable"
echo "from the backend EC2 instance's security group — never expose it publicly."
echo "Test: curl http://localhost:11434/api/generate -d '{\"model\":\"llama3.1:8b\",\"prompt\":\"hi\"}'"
