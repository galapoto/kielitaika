# Running KieliTaika With `kielitaikka-yki-engine`

## Topology

There are 3 separate runtimes involved:

1. The Expo client in `apps/client`
2. The KieliTaika app backend in `apps/backend`
3. The separate YKI engine in `/home/vitus/kielitaikka-yki-engine`

The current architecture is:

`Expo client -> app backend -> local app YKI runtime`

The external engine can be started alongside the app for inspection and comparison, but the app backend is not yet wired to proxy YKI traffic to it.

## What Works Today

If your goal is to use the app normally:

1. Start the app backend on port `8000`
2. Start the Expo client
3. Optionally start the external engine on port `8181`

This is valid for development, comparison, and engine inspection.

This is not yet valid for claiming that the app is backed by the external engine.

## Ports

Use this layout consistently:

- App backend: `http://<your-host>:8000`
- App audio route: `http://<your-host>:8000/api/audio/...`
- External YKI engine: `http://<your-host>:8181`

## Start The App Backend

The repo already contains a Python virtual environment under `apps/backend/.venv`.

```bash
cd /home/vitus/kielitaika-app/apps/backend
./.venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Why this matters:

- The Expo client reads `EXPO_PUBLIC_API_URL`
- The backend exposes the governed learning, speaking, practice, YKI, and audio routes

Useful backend endpoints:

- `GET /api/v1/auth/status`
- `POST /api/v1/yki/sessions/start`
- `GET /api/v1/yki/sessions/{session_id}`
- `POST /api/v1/yki/sessions/{session_id}/next`
- `POST /api/v1/yki/sessions/{session_id}/answer`
- `POST /api/v1/yki/sessions/{session_id}/audio`
- `POST /api/v1/yki/sessions/{session_id}/play`
- `GET /api/audio/{audio_id}`

## Configure The Expo Client

The client env file lives at `apps/client/.env`.

Recommended local configuration:

```env
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:8000
EXPO_PUBLIC_AUDIO_URL=http://YOUR-LAN-IP:8000
```

Notes:

- Use `localhost` only for browser-only testing on the same machine
- Use your machine's LAN IP for physical Android devices
- `EXPO_PUBLIC_AUDIO_URL` is optional; if omitted, the client falls back to `EXPO_PUBLIC_API_URL`

## Start The Expo Client

```bash
cd /home/vitus/kielitaika-app/apps/client
npm install
npm run start
```

Alternative entrypoints:

```bash
npm run web
npm run android
```

## Start The External YKI Engine

The engine repo already includes a launcher:

```bash
cd /home/vitus/kielitaikka-yki-engine
./run_engine.sh
```

That script starts:

```bash
uvicorn engine.api.server_v3_3:app --reload --host 0.0.0.0 --port "${YKI_ENGINE_PORT:-8181}"
```

So the engine is available at:

```text
http://<your-host>:8181
```

Useful engine endpoints:

- `GET /health`
- `GET /engine/health`
- `GET /engine/status`
- `POST /exam/start`
- `GET /exam/{session_id}`

## Verify Each Runtime Separately

Verify app backend:

```bash
curl -i http://127.0.0.1:8000/api/v1/auth/status
```

Verify engine:

```bash
curl -i http://127.0.0.1:8181/health
curl -i http://127.0.0.1:8181/engine/status
```

Verify client:

1. Open Expo web or Android
2. Load the app
3. Exercise learning, daily practice, speaking, and YKI flows

## What "Together" Means Right Now

If you start all three runtimes:

1. Expo client
2. App backend
3. External engine

the app still uses the app backend's internal YKI runtime. The current adapter in `apps/backend/yki/adapter.py` still calls local session functions from `apps/backend/yki/session_store.py`.

It does not currently:

- call the engine over HTTP
- proxy `POST /exam/start`
- map engine state into the governed frontend contract

## What Has To Change For Real Integration

To make the app actually use the external engine, the integration point is `apps/backend/yki/adapter.py`.

The required architecture is:

`Expo client -> app backend -> external YKI engine -> governed backend contract`

Practical integration work:

1. Add backend engine configuration such as `YKI_ENGINE_BASE_URL`
2. Replace local YKI adapter calls with `httpx` calls into the engine
3. Map engine responses into the governed contract expected by the frontend
4. Keep the frontend unchanged
5. Verify the governed session endpoints still satisfy the frontend schema

Until that work is completed, the external engine is not in the live request path.

## Recommended Development Workflow

Start app backend:

```bash
cd /home/vitus/kielitaika-app/apps/backend
./.venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Start Expo client:

```bash
cd /home/vitus/kielitaika-app/apps/client
npm run start
```

Start engine only when needed:

```bash
cd /home/vitus/kielitaikka-yki-engine
./run_engine.sh
```

Quick health checks:

```bash
curl http://127.0.0.1:8000/api/v1/auth/status
curl http://127.0.0.1:8181/health
```

## Troubleshooting

If the client loads but API calls fail:

- check `apps/client/.env`
- use your LAN IP, not `localhost`, for physical Android devices

If audio fails:

- set both `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_AUDIO_URL` explicitly to the same backend host

If the engine starts but the app behavior does not change:

- that is expected with the current codebase
- the backend is not yet proxying YKI traffic to the engine

If the backend fails to start:

```bash
cd /home/vitus/kielitaika-app
apps/backend/.venv/bin/python -c "import fastapi, uvicorn; print('ok')"
```
