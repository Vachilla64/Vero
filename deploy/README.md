# AWS Deployment Runbook

Two EC2 instances:
1. **backend** — t3.small/medium, runs `docker-compose.yml` (postgres + api)
2. **llm** — g4dn.xlarge (GPU), runs Ollama with a small model

I can't touch your AWS account directly, so this is the sequence to run yourself
(paste me output/errors along the way and I'll help debug).

## 1. Launch the backend instance
- AWS Console → EC2 → Launch instance
- Ubuntu 22.04/24.04, t3.small (2GB is tight with postgres+api; t3.medium safer)
- Create/select a key pair, download the .pem
- Security group: allow SSH (22) from your IP, and 8080 (or 443 if you add TLS) from anywhere
- Launch, then: `ssh -i key.pem ubuntu@<public-ip>`
- Run `deploy/backend-ec2-setup.sh` on the box (uncomment the git clone line, or `scp` the repo up first)
- Create `backend/.env` from `deploy/.env.production.example` with real secrets
- `docker compose up -d postgres api`

## 2. Launch the LLM instance
- Same flow, but instance type `g4dn.xlarge`, same VPC as the backend instance
- Security group: SSH (22) from your IP only; port 11434 open ONLY to the
  backend instance's security group (not 0.0.0.0/0 — this is a real cost/abuse risk
  if left open to the internet since anyone could run inference on your GPU and bill)
- Run `deploy/llm-gpu-ec2-setup.sh`, reboot once if driver install requires it, run again
- Note the instance's **private IP** — that's what the backend calls

## 3. Wire the backend to the LLM
- Add `OLLAMA_BASE_URL=http://<llm-private-ip>:11434` to backend `.env`
- Backend code needs a call site for it (not yet present — say the word and I'll add
  an Ollama client alongside the existing Gemini one in `backend/utils`)

## Cost notes
- g4dn.xlarge is ~$0.53/hr on-demand — **stop the instance** (not just close SSH) when
  not actively demoing/testing to avoid burning credits overnight
- t3.small/medium backend instance is cheap enough to leave running through finals

## Later: domain + TLS
- Point a domain's A record at the backend instance's public IP
- Put Caddy or Nginx in front of port 8080 for automatic HTTPS (ask me when you're ready)
