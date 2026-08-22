import { useEffect, useState } from "react";
import { getJSON } from "../lib/api";
import HabitSlop from "../components/HabitSlop";

type Row = Record<string, unknown>;

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

function DataSection({ title, rows, error }: { title: string; rows: Row[] | null; error: string | null }) {
    return (
        <section className="w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            {error && <p className="text-red-500">{error}</p>}
            {!error && rows === null && <p className="text-gray-500">Loading...</p>}
            {!error && rows !== null && rows.length === 0 && <p className="text-gray-500">No data.</p>}
            {!error && rows !== null && rows.length > 0 && (
                <ul className="text-left space-y-1">
                    {rows.map((row, i) => (
                        <li key={i} className="text-sm font-mono bg-gray-100 rounded px-2 py-1">
                            {JSON.stringify(row)}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

function Homepage() {
    const [habitLogs, setHabitLogs] = useState<Row[] | null>(null);
    const [goalsWithHabit, setGoalsWithHabits] = useState<GoalsWithHabit[] | null>(null);
    const [habitLogsError, setHabitLogsError] = useState<string | null>(null);
    const [goalsWithHabitError, setGoalsWithHabitError] = useState<string | null>(null);
    const [todaysTotals, setTodaysTotals] = useState<Record<number, number>>({});

    useEffect(() => {
        getJSON<Row[]>("/habit_logs").then(setHabitLogs).catch((e) => setHabitLogsError(e.message));
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
                        name={goal.habit_name}
                        unit={goal.habit_unit}
                        count={todaysTotals[goal.habit_id] ?? 0}
                        goal={goal.target_value}
                    />
                ))}
            </div>
            <DataSection title="Habit Logs" rows={habitLogs} error={habitLogsError} />
        </div>
    )
}

export default Homepage
