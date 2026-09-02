import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { deleteJSON, getJSON, postJSON } from "../lib/api";

type Habit = {
    id: number;
    slug: string;
    name: string;
    unit: string | null;
};

type InventoryLink = {
    id: number;
    habit_id: number;
    item_id: number;
    decrement_amount: number;
    created_at: string;
    habit_name: string;
};

type InventoryLinksResponse = {
    item_id: number;
    links: InventoryLink[];
};

type InventoryLinkModalProps = {
    itemId: number;
    itemName: string;
    onClose: () => void;
};

function InventoryLinkModal({ itemId, itemName, onClose }: InventoryLinkModalProps) {
    const [habits, setHabits] = useState<Habit[] | null>(null);
    const [habitsError, setHabitsError] = useState<string | null>(null);

    const [links, setLinks] = useState<InventoryLink[] | null>(null);
    const [linksError, setLinksError] = useState<string | null>(null);

    const [habitIdInput, setHabitIdInput] = useState("");
    const [decrementAmountInput, setDecrementAmountInput] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);

    function refreshLinks() {
        getJSON<InventoryLinksResponse>(`/inventory_item_links/by_inventory_item/${itemId}`)
            .then((res) => setLinks(res.links))
            .catch((e) => setLinksError(e.message));
    }

    useEffect(() => {
        getJSON<Habit[]>("/habits").then(setHabits).catch((e) => setHabitsError(e.message));
        refreshLinks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

    async function handleCreateSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const habitId = Number(habitIdInput);
        const decrementAmount = Number(decrementAmountInput);

        if (!habitIdInput) {
            setCreateError("Please select a habit.");
            return;
        }
        if (!Number.isFinite(decrementAmount)) {
            setCreateError("Decrement amount must be a number.");
            return;
        }

        try {
            setCreateError(null);
            await postJSON(`/inventory_item_links/create?habit_id=${habitId}&item_id=${itemId}&decrement_amount=${decrementAmount}`);
            setHabitIdInput("");
            setDecrementAmountInput("");
            refreshLinks();
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to create link.");
        }
    }

    async function handleDeleteLink(linkId: number) {
        try {
            await deleteJSON(`/inventory_item_links/${linkId}`);
            refreshLinks();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-xl border border-gray-300 shadow-lg w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-neutral-800">Links for {itemName}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3 flex-1">
                        {habitsError && <p className="text-red-500 text-sm">{habitsError}</p>}
                        {createError && <p className="text-red-500 text-sm">{createError}</p>}
                        <label className="flex flex-col text-sm text-gray-600">
                            Habit
                            <select
                                value={habitIdInput}
                                onChange={(e) => setHabitIdInput(e.target.value)}
                                className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                                required
                            >
                                <option value="" disabled>
                                    Select a habit
                                </option>
                                {habits?.map((habit) => (
                                    <option key={habit.id} value={habit.id}>
                                        {habit.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col text-sm text-gray-600">
                            Decrement amount
                            <input
                                type="number"
                                value={decrementAmountInput}
                                onChange={(e) => setDecrementAmountInput(e.target.value)}
                                className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                                required
                            />
                        </label>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-700 transition-colors"
                        >
                            Submit
                        </button>
                    </form>

                    <div className="flex flex-col gap-2 flex-1 max-h-80 overflow-y-auto">
                        {linksError && <p className="text-red-500 text-sm">{linksError}</p>}
                        {links?.length === 0 && <p className="text-sm text-gray-500">No links yet.</p>}
                        {links?.map((link) => (
                            <div
                                key={link.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-800">{link.habit_name}</span>
                                    <span className="text-xs text-gray-500">-{link.decrement_amount} per log</span>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Delete link"
                                    onClick={() => handleDeleteLink(link.id)}
                                    className="text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500"
                                >
                                    &minus;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InventoryLinkModal
