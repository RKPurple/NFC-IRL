MOST_RECENT_HABIT_LOG = """
    DELETE FROM habit_logs
    WHERE id = (
        SELECT id FROM habit_logs
        WHERE habit_id = %s
            AND logged_at >= %s AND logged_at < %s
        ORDER BY logged_at DESC
        LIMIT 1
    )
    RETURNING *
"""

HABIT_LOG_BY_ID = """
    DELETE FROM habit_logs
    WHERE id = %s
    RETURNING *
"""

HABIT_BY_ID = """
    DELETE FROM habits
    WHERE id = %s
    RETURNING *
"""