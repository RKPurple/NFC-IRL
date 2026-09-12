import { useEffect, useState } from "react";
import { getJSON } from "../lib/api";
import GoalCardSlop from "../components/GoalCardSlop";

type Habit = { id: number; slug: string; name: string; unit: string | null };
type GoalWithHabit = {
    goal_id: number;
    habit_id: number;
    period: string;
    target_value: number;
    habit_name: string;
    habit_unit: string;
};
type GoalHistoryRow = {
    day: string;
    target_value: number;
    total_logged: number;
    percent: number;
    met: boolean;
};
type Period = "Week" | "Month" | "Year";

const PERIODS: Period[] = ["Week", "Month", "Year"];
const PERIOD_COUNTS: Record<Period, number> = { Week: 7, Month: 30, Year: 365 };

function Viewpage() {
    const [period, setPeriod] = useState<Period>("Week");
    const [habits, setHabits] = useState<Habit[] | null>(null);
    const [habitsError, setHabitsError] = useState<string | null>(null);
    const [habitId, setHabitId] = useState("");
    const [goals, setGoals] = useState<GoalWithHabit[] | null>(null);
    const [goalHistory, setGoalHistory] = useState<GoalHistoryRow[] | null>(null);
    const [goalHistoryError, setGoalHistoryError] = useState<string | null>(null);

    useEffect(() => {
        getJSON<Habit[]>("/habits")
            .then(setHabits)
            .catch((e) => setHabitsError(e.message));
        getJSON<GoalWithHabit[]>("/goals/with_habits")
            .then(setGoals)
            .catch((e) => setHabitsError(e.message));
    }, []);

    useEffect(() => {
        if (habits && habits.length > 0 && habitId === "") {
            setHabitId(String(habits[0].id));
        }
    }, [habits, habitId]);

    const selectedGoal = goals?.find((g) => g.habit_id === Number(habitId));

    useEffect(() => {
        if (!selectedGoal) {
            setGoalHistory(null);
            return;
        }
        getJSON<GoalHistoryRow[]>(`/goal_history/${selectedGoal.goal_id}?days=${PERIOD_COUNTS[period]}`)
            .then(setGoalHistory)
            .catch((e) => setGoalHistoryError(e.message));
    }, [selectedGoal, period]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-24">
            <h1>View</h1>

            <div className="flex flex-col gap-4 px-4 pt-4">
                <label className="flex flex-col text-sm text-gray-600">
                    Period
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as Period)}
                        className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                    >
                        {PERIODS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col text-sm text-gray-600">
                    Habit
                    <select
                        value={habitId}
                        onChange={(e) => setHabitId(e.target.value)}
                        className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                    >
                        <option value="" disabled>Select a habit</option>
                        {habits?.map((habit) => (
                            <option key={habit.id} value={habit.id}>{habit.name}</option>
                        ))}
                    </select>
                    {habitsError && <span className="mt-1 text-red-600">{habitsError}</span>}
                </label>
            </div>

            <div className="flex flex-wrap gap-2 px-4 pt-6">
                {goalHistoryError && <span className="text-red-600">{goalHistoryError}</span>}
                {goalHistory?.map((row) => (
                    <GoalCardSlop key={row.day} {...row} />
                ))}
            </div>
        </div>
    );
}

export default Viewpage;
