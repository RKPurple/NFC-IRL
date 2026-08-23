import { useState } from "react";

type HabitEditorSlopProps = {
    id: number;
    slug: string;
    name: string;
    unit: string | null;
    onDelete: (id: number) => void;
};

function HabitEditorSlop({ id, slug, name, unit, onDelete }: HabitEditorSlopProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold">
                {name}{unit ? ` (${unit})` : ""}
            </p>
            <div className="flex items-center justify-between gap-6 rounded-xl border border-gray-300 px-6 py-3 min-w-[240px]">
                <div className="flex flex-col text-sm text-gray-500">
                    <span>id: {id}</span>
                    <span>slug: {slug}</span>
                </div>
                {isConfirming ? (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsConfirming(false)}
                            className="text-xs font-medium rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(id)}
                            className="text-xs font-medium rounded-full px-3 py-1.5 bg-red-600 text-white hover:bg-red-500"
                        >
                            Confirm
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        aria-label="Delete habit"
                        onClick={() => setIsConfirming(true)}
                        className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full text-red-600 hover:bg-red-100"
                    >
                        -
                    </button>
                )}
            </div>
        </div>
    )
}

export default HabitEditorSlop
