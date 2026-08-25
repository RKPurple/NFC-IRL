# NFC-IRL

Personal app used for tracking habits of mine using NFC tags around my house.

## Stack
 
|| Tech | Hosted on |
|---|---|---|
| Frontend | React + Vite + TypeScript | Vercel |
| Backend | FastAPI + psycopg2 | Railway |
| Database | Supabase (Postgres + PostgREST) | Supabase |
| Logging trigger | iOS Shortcuts | — |
 

## Running locally

**Frontend**
```
cd nfc-web
npm install
npm run dev
```
Requires `VITE_API_URL` in `nfc-web/.env`.

**Backend**
```
cd nfc-biggy
pip install -r requirements.txt
uvicorn api.main:app --reload
```
Requires `DATABASE_URL` in `nfc-biggy/.env`.

