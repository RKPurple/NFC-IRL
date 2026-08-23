import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { deleteJSON, getJSON, postJSON } from "../lib/api";
import HabitEditorSlop from "../components/HabitEditorSlop";

type Habit = {
    id: number;
    slug: string;
    name: string;
    unit: string | null;
};

type CreatedHabitResponse = {
    created_habit: Habit;
};

function Editpage() {
    const navigate = useNavigate();
    const [habits, setHabits] = useState<Habit[] | null>(null);
    const [habitsError, setHabitsError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [slugInput, setSlugInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [unitInput, setUnitInput] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        getJSON<Habit[]>("/habits").then(setHabits).catch((e) => setHabitsError(e.message));
    }, []);

    async function handleCreateSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const slug = slugInput.trim();
        const name = nameInput.trim();
        const unit = unitInput.trim();

        if (!slug) {
            setCreateError("Slug is required.");
            return;
        }
        if (!name) {
            setCreateError("Name is required.");
            return;
        }

        const params = new URLSearchParams({ slug, name, unit });

        try {
            setCreateError(null);
            await postJSON<CreatedHabitResponse>(`/habits/create?${params.toString()}`);
            window.location.reload();
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to create habit.");
        }
    }

    async function handleDeleteHabit(id: number) {
        try {
            await deleteJSON(`/habits/${id}`);
            window.location.reload();
        } catch (e) {
            setHabitsError(e instanceof Error ? e.message : "Failed to delete habit.");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
            <header className="flex items-center justify-between px-8 py-6 border-b border-neutral-200 bg-white/60 backdrop-blur">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Edit</h1>
                <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-700 transition-colors"
                >
                    Back
                </button>
            </header>

            <div className="p-8 flex flex-col items-center gap-6">
                {habitsError && <p className="text-red-500">{habitsError}</p>}
                {habits?.map((habit) => (
                    <HabitEditorSlop
                        key={habit.id}
                        id={habit.id}
                        slug={habit.slug}
                        name={habit.name}
                        unit={habit.unit}
                        onDelete={handleDeleteHabit}
                    />
                ))}

                {!isCreating && (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-green-500 transition-colors"
                    >
                        + New habit
                    </button>
                )}

                {isCreating && (
                    <form
                        onSubmit={handleCreateSubmit}
                        className="flex flex-col gap-3 rounded-xl border border-gray-300 px-6 py-4 min-w-[240px] w-full max-w-sm"
                    >
                        {createError && <p className="text-red-500 text-sm">{createError}</p>}
                        <label className="flex flex-col text-sm text-gray-600">
                            Slug (nickname / shortform)
                            <input
                                type="text"
                                value={slugInput}
                                onChange={(e) => setSlugInput(e.target.value)}
                                className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                                required
                            />
                        </label>
                        <label className="flex flex-col text-sm text-gray-600">
                            Name
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                                required
                            />
                        </label>
                        <label className="flex flex-col text-sm text-gray-600">
                            Unit (optional)
                            <input
                                type="text"
                                value={unitInput}
                                onChange={(e) => setUnitInput(e.target.value)}
                                className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                            />
                        </label>
                        <div className="flex items-center justify-end gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setCreateError(null);
                                    setSlugInput("");
                                    setNameInput("");
                                    setUnitInput("");
                                }}
                                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-green-500 transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Editpage