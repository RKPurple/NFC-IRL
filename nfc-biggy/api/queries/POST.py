MANUAL_HABIT_LOG = """
    INSERT INTO habit_logs (habit_id, value, logged_at)
    VALUES (%s, %s, %s)
    RETURNING *
"""

CREATE_HABIT = """
    INSERT INTO habits (slug, name, unit, created_at)
    VALUES (%s, %s, %s, %s)
    RETURNING *
"""

CREATE_INVENTORY_ITEM = """
    INSERT INTO inventory_items (name, quantity, unit, image_url, low_stock_threshold, created_at)
    VALUES (%s, %s, %s, %s, %s, %s)
    RETURNING *
"""

CREATE_INVENTORY_ITEM_LINK = """
    INSERT INTO habit_inventory_links (habit_id, item_id, decrement_amount, created_at)
    VALUES (%s, %s, %s, %s)
    RETURNING *
"""