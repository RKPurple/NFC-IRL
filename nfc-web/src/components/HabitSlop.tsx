type HabitSlopProps = {
    name: string;
    unit?: string | null;
    count: number;
    goal: number;
};

function HabitSlop({ name, unit, count, goal }: HabitSlopProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold">
                {name}{unit ? ` (${unit})` : ""}
            </p>
            <div className="flex items-center justify-between gap-6 rounded-xl border border-gray-300 px-6 py-3 min-w-[240px]">
                <button
                    type="button"
                    className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                    -
                </button>
                <span className="text-xl font-mono">
                    {count}/{goal}
                </span>
                <button
                    type="button"
                    className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                    +
                </button>
            </div>
        </div>
    )
}

export default HabitSlop
