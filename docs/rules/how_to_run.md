1. > [!NOTE]
  > $$
  > How To Run Everything
  > 
  > 1. cd /home/vitus/kielitaikka-yki-engine
  >   venv/bin/uvicorn engine.api.server_v3_3:app --host 127.0.0.1 --port 8181
  > --
  > 
  > http://127.0.0.1:8181/health
  > 
  > 2. cd /home/vitus/kielitaika
  >   .venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000
  > --
  > 
  > host
  > 
  > 127.0.0.1
  > --
  > 
  > port
  > 8000
  > http://127.0.0.1:8000/docs
  > 
  > 3.  cd /home/vitus/kielitaika/frontend
  >   npm run dev
  > --
  > Then open:
  > 
  >   - Laptop browser: http://localhost:5173/
  >   - Android phone on same Wi‑Fi: http://192.168.100.41:5173/
  >   
  >   
  > --
  >  └ ruka@ruka.com ruka123
  >     vitus@ruka.com None
  >     testi@testi.com ruka123
  >     admin@ruka.com None
  >     admin@ruka.app admin123
  > $$

  

## ▶️ Step A — Start backend

Go to your backend folder:

```
cd backend
```

Run:

```
python3 app.py
```

or if you are using FastAPI + uvicorn:

```
uvicorn app:app --reload --port 8000
```

👉 What should happen:

- Server starts (usually on `http://localhost:8000`)
- No errors about missing `ELEVENLABS_API_KEY`

------

## ▶️ Step B — Start frontend

In another terminal:

```
cd frontend
npm install   # only if not already done
npm run dev
```

👉 You’ll get something like:

```
http://localhost:5173
```

Open that in browser.

------

## 🔁 Step C — Check proxy (important)

You said:

> Vite proxies generation requests

So confirm in:

```
frontend/vite.config.ts
```

You have something like:

```
server: {
  proxy: {
    '/tts': 'http://localhost:8000'
  }
}
```

👉 If this is wrong, TTS won’t work.

------

## 🧪 Step D — Test TTS quickly

Open your app and:

1. Create/load a document
2. Trigger TTS generation (whatever UI action you built)
3. Then check:

```
frontend/public/audio-cache/
```