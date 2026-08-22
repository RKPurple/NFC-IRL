import { deleteJSON } from "../lib/api";

type LogSlopProps = {
    id: number;
    habit_id: number;
    name: string;
    unit?: string | null;
    value: number;
    timestamp: string;
    onDeleted?: (id: number) => void;
};

function LogSlop({ id, name, unit, value, timestamp, onDeleted }: LogSlopProps) {
    const formattedTimestamp = new Date(timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });

    async function handleDelete() {
        try {
            await deleteJSON(`/habit_logs/${id}`);
            onDeleted?.(id);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex items-center justify-between gap-6 rounded-xl border border-gray-300 px-6 py-3 w-full max-w-md">
            <div className="flex flex-col items-start">
                <p className="text-lg font-semibold">{name} log</p>
                <span className="text-xl font-mono">
                    {value}{unit ? ` ${unit}` : ""}
                </span>
                <span className="text-sm text-gray-500">{formattedTimestamp}</span>
            </div>
            <button
                type="button"
                onClick={handleDelete}
                className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
                -
            </button>
        </div>
    )
}

export default LogSlop
