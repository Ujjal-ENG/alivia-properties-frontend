# Deploying the Frontend (Next.js site)

Production VM: **`159.223.168.249`** (DigitalOcean droplet `alivia-prod`, Ubuntu 24.04).
The site runs under **pm2** (process manager) on port 3000.

| What | Value |
|------|-------|
| Public site | http://159.223.168.249:3000 |
| VM directory | `/root/alivia-properties-frontend` |
| pm2 process | `alivia-frontend` |
| Runtime env file | `.env.local` (on the VM, not committed) |
| API it points to | `NEXT_PUBLIC_API_BASE_URL=http://159.223.168.249:3001/api/v1` |

> ⚠️ **`NEXT_PUBLIC_*` env vars are baked in at BUILD time.** Editing `.env.local` does nothing
> until you re-run `pnpm build`. Always rebuild after changing env or code.

---

## Connect to the VM
```bash
ssh root@159.223.168.249
```

## Everyday commands (run on the VM)
```bash
cd /root/alivia-properties-frontend

# status / health
pm2 status
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000   # expect 200

# logs
pm2 logs alivia-frontend              # tail (Ctrl+C to stop)
pm2 logs alivia-frontend --lines 100

# start / stop / restart
pm2 restart alivia-frontend
pm2 stop alivia-frontend              # frees :3000
pm2 start alivia-frontend
pm2 delete alivia-frontend            # remove from pm2

# environment (e.g. API URL, Google Maps key)
nano .env.local
pnpm build && pm2 restart alivia-frontend   # MUST rebuild for NEXT_PUBLIC_* changes
```

## Deploy new code
```bash
cd /root/alivia-properties-frontend
git pull
pnpm install            # only needed if dependencies changed
pnpm build              # REQUIRED after any code/env change
pm2 restart alivia-frontend
pm2 save                # persist process list
```

Or just run the helper script (does pull + install + build + restart + health check):
```bash
bash deploy.sh
```

## First-time setup notes (already done on the current VM)
- `pm2` installed globally; process started with `pm2 start "pnpm start" --name alivia-frontend`.
- `pm2 startup systemd` + `pm2 save` configured → auto-restarts on crash and survives reboot.
- `AUTH_SECRET` generated into `.env.local` (required for Auth.js login).
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is still empty — map features stay blank until set + rebuilt.
