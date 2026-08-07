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
- Backend now has a real HTTPS domain: `https://verolive.duckdns.org` (free DuckDNS
  subdomain + Caddy auto-TLS via Let's Encrypt on the EC2 box). Frontend
  `VITE_API_URL` updated to match. Raw IP:port (`50.19.248.193:3712`) still works as
  a fallback but shouldn't be the documented address anymore.
- Caddy config lives at `/etc/caddy/Caddyfile` on the server (not in this repo) —
  reverse-proxies 443 -> localhost:3712. Worth committing a copy to `deploy/` too.
- The EC2 Postgres needed `npx prisma db push` (schema) + `node prisma/seed.js`
  (demo accounts) run manually after first deploy — it wasn't part of the
  docker-compose flow and silently left the DB schemaless. Worth adding an
  automatic migrate+seed step to the deploy process so this can't be missed again.
