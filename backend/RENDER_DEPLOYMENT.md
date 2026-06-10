# Render Deployment Guide

## Configuration

The backend is configured to build and run in production mode on Render.

### Build Process

1. **Build Command**: `npm run build`
   - Installs dependencies (including dev types) via `npm install --include=dev`
   - Compiles TypeScript to JavaScript in the `dist/` folder
   - `backend/.npmrc` sets `production=false` so Render's install step also includes devDependencies

2. **Start Command**: `npm start`
   - Runs the compiled JavaScript: `node dist/server.js`

### MongoDB Atlas (required)

The app uses database name **`postcard_crm`**. Your Atlas URI must include this path:

```
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/postcard_crm?retryWrites=true&w=majority&appName=Cluster0
```

**Do not** use a URI without a database name (e.g. `...mongodb.net/?appName=...`).

#### Atlas setup checklist

1. **Network Access** → allow `0.0.0.0/0` (or Render egress IPs)
2. **Database Access** → user with read/write on `postcard_crm`
3. Set `MONGO_URI` in Render Environment (never commit credentials to git)

#### Bootstrap a fresh Atlas database

From `backend/` with `MONGO_URI` pointing at Atlas:

```bash
export MONGO_URI='mongodb+srv://USER:PASSWORD@cluster.mongodb.net/postcard_crm?retryWrites=true&w=majority'
export TS_NODE_TRANSPILE_ONLY=true
npm run seed:admin
npm run seed:everything
npm run seed:kb:fixtures
# Then run dashboard widgets, system filters, workflows (see seedComplete.ts)
```

Or: `npm run seed:complete` (with `TS_NODE_TRANSPILE_ONLY=true` if ts-node type errors occur).

Default admin after seed: `admin@postcardcrm.local` / `Admin@123` (change after first login).

### Environment Variables (Render dashboard)

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGO_URI` | Yes | Atlas URI with `/postcard_crm` database path |
| `JWT_SECRET` | Yes | Strong random string |
| `FRONTEND_URL` | Yes | Netlify URL for OAuth/email redirects |
| `NODE_ENV` | Yes | `production` |
| `NODE_OPTIONS` | Recommended | `--max-old-space-size=4096` |
| `PORT` | Auto | Render sets automatically |

### Render Dashboard Configuration

1. **Root Directory**: `backend`
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Environment**: Node 22

After changing env vars: **Manual Deploy → Clear build cache & deploy**.

### Post-deploy verification

- Logs show: `Connected to MongoDB` and `PostcardCRM API listening on port ...`
- `GET /health` returns `{"status":"ok"}`
- Frontend login works with seeded admin user

### Troubleshooting

**Build fails with TS errors**: Ensure `npm run build` runs (installs all deps). Check build logs for `npm install --include=dev`.

**ECONNREFUSED localhost:27017**: `MONGO_URI` is not set on Render. Add Atlas URI to Environment.

**Mongoose buffering timeout on startup**: Usually means MongoDB not connected; fix `MONGO_URI` and Atlas network access.

**JavaScript heap out of memory**: Set `NODE_OPTIONS=--max-old-space-size=4096`.
