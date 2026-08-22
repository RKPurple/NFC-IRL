MANUAL_HABIT_LOG = """
    INSERT INTO habit_logs (habit_id, value, logged_at)
    VALUES (%s, %s, %s)
    RETURNING *
"""