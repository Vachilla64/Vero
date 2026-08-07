# Changes to fold into the docs site later

Running notes on infra/backend changes made during AWS setup that the docs site
doesn't reflect yet. Clear each line out once it's written up there.

- Backend now runs on AWS EC2 (instance `Fushira`, t3.micro, us-east-1c) instead of
  wherever it was described as running before — via Docker Compose (postgres + api),
  not a platform-managed deploy.
- Elastic IP `50.19.248.193` is the permanent backend address (was previously a
  transient public IP that changes on stop/start).
- API port changed from 8080 to **3712** (docker-compose.yml, backend/.env, and
  frontend `VITE_API_URL` all updated to match).
- Frontend now reads the backend URL from `VITE_API_URL` (`frontend/.env.production`),
  falling back to `http://localhost:3712` for local dev.
- Deploy/runbook docs live in `deploy/README.md` (this repo), not wherever the old
  Railway instructions were.
- LLM/AI service (self-hosted Ollama on a separate GPU EC2 instance) — planned, not
  yet built. Add once it exists.
