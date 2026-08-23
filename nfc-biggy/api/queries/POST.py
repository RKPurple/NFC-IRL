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