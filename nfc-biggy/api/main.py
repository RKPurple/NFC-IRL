import os
from pathlib import Path
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import psycopg2
import psycopg2.extras
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .notify import send_notification
from fastapi import BackgroundTasks

try:
    from .queries import GET, POST, DELETE, PATCH
except ImportError:
    # Falls back to an absolute import when main.py is run without its
    # parent package context (e.g. `uvicorn main:app` from inside api/,
    # which is how Railway's default start command can invoke it).
    from queries import GET, POST, DELETE

def load_env(path):
    env = {}
    if not path.exists():
        return env
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, _, value = line.partition('=')
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env

# Railway sets real env vars via its dashboard (os.environ).
# Locally, fall back to reading .env directly since you're not
# running `railway run` or similar to inject them for you.
_local_env = load_env(Path(__file__).parent.parent.parent / '.env')

DATABASE_URL = os.environ.get('DATABASE_URL') or _local_env.get('DATABASE_URL')
FRONTEND_URL = os.environ.get('FRONTEND_URL') or _local_env.get('FRONTEND_URL')

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set (checked os.environ and local .env)")

app = FastAPI(title="NFC-IRL API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL else [],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)

def run_query(query: str, params: tuple = ()):
    try:
        with get_connection() as conn, conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {e}")
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

# ------- GET Endpoints -------

@app.get("/habits")
def get_habits():
    return run_query(GET.HABITS)

@app.get("/habit_logs")
def get_habit_logs():
    return run_query(GET.HABIT_LOGS)

@app.get("/goals")
def get_goals():
    return run_query(GET.GOALS)

@app.get("/goals/with_habits")
def get_goals_with_habits():
    return run_query(GET.GOALS_WITH_HABITS)

@app.get("/habits/{habit_id}/total_today")
def get_habit_total_today(habit_id: int):
    tz = ZoneInfo("America/New_York")
    now_local = datetime.now(tz)
    start = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    rows = run_query(GET.HABIT_TOTAL_TODAY, (habit_id, start, end))
    return {"habit_id": habit_id, "total": rows[0]["total"] if rows else 0}

@app.get("/habit_logs/display")
def get_habit_logs_display():
    return run_query(GET.HABIT_LOG_DISPLAY)

@app.get("/inventory_items")
def get_inventory_items():
    return run_query(GET.INVENTORY_ITEMS)

@app.get("/inventory_item_links/by_inventory_item/{item_id}")
def get_inventory_item_links_by_inventory_item(item_id: int):
    rows = run_query(GET.INVENTORY_LINKS_BY_INVENTORY_ITEM_ID, (item_id,))
    return {"item_id": item_id, "links": rows}

# ------ POST Endpoints -------

@app.post("/habit_logs/manual")
def create_manual_habit_log(habit_id: int, value: int):
    tz = ZoneInfo("America/New_York")
    logged_at = datetime.now(tz)
    rows = run_query(POST.MANUAL_HABIT_LOG, (habit_id, value, logged_at))
    return {"created_log": rows[0]}

@app.post("/habits/create")
def create_habit(slug: str, name: str, unit: str):
    tz = ZoneInfo("America/New_York")
    created_at = datetime.now(tz)
    rows = run_query(POST.CREATE_HABIT, (slug, name, unit, created_at))
    return {"created_habit": rows[0]}

@app.post("/webhooks/habit_log_created")
def habit_log_created_webhook(payload: dict, background_tasks: BackgroundTasks):
    record = payload.get("record", {})
    habit_id = record.get("habit_id")
    value = record.get("value")

    habit_rows = run_query(GET.HABIT_BY_ID, (habit_id,))
    habit_name = habit_rows[0]["name"] if habit_rows else f"Habit {habit_id}"
    
    background_tasks.add_task(
        send_notification,
        title="Habit logged",
        message=f"{habit_name} logged (+{value})",
    )
    return {"status": "success"}

@app.post("/inventory_items/create")
def create_inventory_item(name: str, quantity: int, unit: str | None = None, image_url: str | None = None, low_stock_threshold: int | None = None):
    tz = ZoneInfo("America/New_York")
    created_at = datetime.now(tz)
    rows = run_query(POST.CREATE_INVENTORY_ITEM, (name, quantity, unit, image_url, low_stock_threshold, created_at))
    return {"created_item": rows[0]}

@app.post("/inventory_item_links/create")
def create_inventory_item_link(habit_id: int, item_id: int, decrement_amount: int):
    tz = ZoneInfo("America/New_York")
    created_at = datetime.now(tz)
    rows = run_query(POST.CREATE_INVENTORY_ITEM_LINK, (habit_id, item_id, decrement_amount, created_at))
    return {"created_link": rows[0]}

# ------ PATCH Endpoints -------

@app.patch("/inventory_items/{item_id}/quantity")
def quick_add_inventory_item(item_id: int, quantity: int):
    rows = run_query(PATCH.INVENTORY_QUANTITY, (quantity, item_id))
    if not rows:
        raise HTTPException(status_code=404, detail="Inventory item not found.")
    return {"updated_item": rows[0]}

@app.patch("/inventory_items/{item_id}")
def update_inventory_item(
    item_id: int,
    name: str | None = None,
    quantity: float | None = None,
    unit: str | None = None,
    image_url: str | None = None,
    low_stock_threshold: float | None = None,
):
    fields = {
        "name": name,
        "quantity": quantity,
        "unit": unit,
        "image_url": image_url,
        "low_stock_threshold": low_stock_threshold,
    }
    updates = {column: value for column, value in fields.items() if value is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    set_clause = ", ".join(f"{column} = %s" for column in updates)
    query = PATCH.UPDATE_INVENTORY_ITEM.format(set_clause=set_clause)
    params = tuple(updates.values()) + (item_id,)

    rows = run_query(query, params)
    if not rows:
        raise HTTPException(status_code=404, detail="Inventory item not found.")
    return {"updated_item": rows[0]}

# ------ DELETE Endpoints -------

@app.delete("/habit_logs/most_recent")
def delete_most_recent_habit_log(habit_id: int):
    tz = ZoneInfo("America/New_York")
    now_local = datetime.now(tz)
    start = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    rows = run_query(DELETE.MOST_RECENT_HABIT_LOG, (habit_id, start, end))
    if not rows:
        raise HTTPException(status_code=404, detail="No habit log found for today.")
    return {"deleted_log": rows[0]}

@app.delete("/habit_logs/{log_id}")
def delete_habit_log_by_id(log_id: int):
    rows = run_query(DELETE.HABIT_LOG_BY_ID, (log_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Habit log not found.")
    return {"deleted_log": rows[0]}

@app.delete("/habits/{habit_id}")
def delete_habit_by_id(habit_id: int):
    rows = run_query(DELETE.HABIT_BY_ID, (habit_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Habit not found.")
    return {"deleted_habit": rows[0]}

@app.delete("/inventory_items/{item_id}")
def delete_inventory_item_by_id(item_id: int):
    rows = run_query(DELETE.INVENTORY_ITEM_BY_ID, (item_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Inventory item not found.")
    return {"deleted_item": rows[0]}

@app.delete("/inventory_item_links/{link_id}")
def delete_inventory_item_link_by_id(link_id: int):
    rows = run_query(DELETE.INVENTORY_LINK_BY_ID, (link_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Inventory item link not found.")
    return {"deleted_link": rows[0]}