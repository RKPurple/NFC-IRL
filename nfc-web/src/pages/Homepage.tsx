import { useEffect, useState } from "react";
import { getJSON } from "../lib/api";
import HabitSlop from "../components/HabitSlop";
import LogSlop from "../components/LogSlop";

type HabitLogDisplay = {
    log_id: number;
    habit_id: number;
    value: number;
    logged_at: string;
    habit_name: string;
    habit_unit: string | null;
}

type GoalsWithHabit = {
    goal_id: number;
    habit_id: number,
    period: string;
    target_value: number;
    habit_name: string;
    habit_unit: string | null;
};

type TodaysTotal = {
    habit_id: number;
    total: number;
}

function Homepage() {
    const [habitLogs, setHabitLogs] = useState<HabitLogDisplay[] | null>(null);
    const [goalsWithHabit, setGoalsWithHabits] = useState<GoalsWithHabit[] | null>(null);
    const [habitLogsError, setHabitLogsError] = useState<string | null>(null);
    const [goalsWithHabitError, setGoalsWithHabitError] = useState<string | null>(null);
    const [todaysTotals, setTodaysTotals] = useState<Record<number, number>>({});

    useEffect(() => {
        getJSON<HabitLogDisplay[]>("/habit_logs/display").then(setHabitLogs).catch((e) => setHabitLogsError(e.message));
        getJSON<GoalsWithHabit[]>("/goals/with_habits").then(setGoalsWithHabits).catch((e) => setGoalsWithHabitError(e.message));
    }, []);

    useEffect(() => {
        if (!goalsWithHabit) return;
        const habitIds = [...new Set(goalsWithHabit.map((goal) => goal.habit_id))];
        Promise.all(
            habitIds.map((habitId) => getJSON<TodaysTotal>(`/habits/${habitId}/total_today`))
        )
            .then((totals) => {
                setTodaysTotals(
                    Object.fromEntries(totals.map((t) => [t.habit_id, t.total]))
                );
            })
            .catch(() => {});
    }, [goalsWithHabit]);

    return (
        <div className="flex flex-row items-start justify-center min-h-screen text-center gap-8 py-8">
            <div className="flex flex-col items-center gap-6">
                {goalsWithHabitError && <p className="text-red-500">{goalsWithHabitError}</p>}
                {goalsWithHabit?.map((goal) => (
                    <HabitSlop
                        key={goal.goal_id}
                        habit_id={goal.habit_id}
                        name={goal.habit_name}
                        unit={goal.habit_unit}
                        count={todaysTotals[goal.habit_id] ?? 0}
                        goal={goal.target_value}
                        onDeleted={() => window.location.reload()}
                        onLogged={() => window.location.reload()}
                    />
                ))}
            </div>
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
                {habitLogsError && <p className="text-red-500">{habitLogsError}</p>}
                {habitLogs?.map((log) => (
                    <LogSlop
                        key={log.log_id}
                        id={log.log_id}
                        habit_id={log.habit_id}
                        name={log.habit_name}
                        unit={log.habit_unit}
                        value={log.value}
                        timestamp={log.logged_at}
                        onDeleted={() => window.location.reload()}
                    />
                ))}
            </div>
        </div>
    )
}

export default Homepage
