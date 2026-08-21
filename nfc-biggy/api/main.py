from pathlib import Path

import psycopg2
import psycopg2.extras
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from queries import GET

def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, _, value = line.partition('=')
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env

env = load_env(Path(__file__).parent.parent.parent / '.env')
FRONTEND_URL = env.get('FRONTEND_URL')
DATABASE_URL = env.get('DATABASE_URL')

app = FastAPI(title="NFC-IRL API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)

def run_query(query: str):
    try:
        with get_connection() as conn, conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {e}")
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    
@app.get("/habits")
def get_habits():
    return run_query(GET.HABITS)


@app.get("/habit_logs")
def get_habit_logs():
    return run_query(GET.HABIT_LOGS)


@app.get("/goals")
def get_goals():
    return run_query(GET.GOALS)