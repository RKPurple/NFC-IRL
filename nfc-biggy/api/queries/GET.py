HABITS = "SELECT * FROM habits ORDER BY id"

HABIT_LOGS = "SELECT * FROM habit_logs ORDER BY logged_at DESC"

GOALS = "SELECT * FROM goals ORDER BY id"

GOALS_WITH_HABITS = """
    SELECT
        goals.id AS goal_id,
        goals.habit_id,
        goals.period,
        goals.target_value,
        habits.name AS habit_name,
        habits.unit AS habit_unit
    FROM goals
    JOIN habits ON habits.id = goals.habit_id
    ORDER BY goals.id
"""

HABIT_TOTAL_TODAY = """
    SELECT habit_id, SUM(value) AS total
    FROM habit_logs
    WHERE habit_id = %s AND logged_at >= %s AND logged_at < %s
    GROUP BY habit_id
"""

HABIT_LOG_DISPLAY = """
    SELECT
        hl.id AS log_id,
        hl.habit_id,
        hl.value,
        hl.logged_at,
        h.slug AS habit_name,
        h.unit AS habit_unit
    FROM habit_logs hl
    JOIN habits h ON h.id = hl.habit_id
    ORDER BY hl.logged_at DESC
"""