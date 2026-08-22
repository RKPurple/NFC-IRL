import { deleteJSON, postJSON } from "../lib/api";

type HabitSlopProps = {
    habit_id: number;
    name: string;
    unit?: string | null;
    count: number;
    goal: number;
    onDeleted: (habit_id: number) => void;
    onLogged: () => void;
};

function HabitSlop({ habit_id, name, unit, count, goal, onDeleted, onLogged }: HabitSlopProps) {
    async function handleDelete() {
        try {
            await deleteJSON(`/habit_logs/most_recent?habit_id=${habit_id}`);
            onDeleted(habit_id);
        } catch (e) {
            if (e instanceof Error && e.message.includes("404")) return;
            console.error(e);
        }
    }

    async function handleAdd() {
        const input = window.prompt("Enter value:");
        if (input === null) return;
        const value = Number(input);
        if (!Number.isFinite(value)) return;
        try {
            await postJSON(`/habit_logs/manual?habit_id=${habit_id}&value=${value}`);
            onLogged();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold">
                {name}{unit ? ` (${unit})` : ""}
            </p>
            <div className="flex items-center justify-between gap-6 rounded-xl border border-gray-300 px-6 py-3 min-w-[240px]">
                <button
                    type="button"
                    onClick={handleDelete}
                    className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                    -
                </button>
                <span className="text-xl font-mono">
                    {count}/{goal}
                </span>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                    +
                </button>
            </div>
        </div>
    )
}

export default HabitSlop
