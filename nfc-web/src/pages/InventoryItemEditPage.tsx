import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteJSON, getJSON, patchJSON } from "../lib/api";

type InventoryItem = {
    id: number;
    name: string;
    quantity: number;
    unit: string | null;
    image_url: string | null;
    created_at: string;
    low_stock_threshold: number | null;
};

function InventoryItemEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [item, setItem] = useState<InventoryItem | null>(null);
    const [itemError, setItemError] = useState<string | null>(null);

    const [nameInput, setNameInput] = useState("");
    const [quantityInput, setQuantityInput] = useState("");
    const [unitInput, setUnitInput] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [lowStockThresholdInput, setLowStockThresholdInput] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getJSON<InventoryItem[]>("/inventory_items")
            .then((items) => {
                const found = items.find((i) => i.id === Number(id));
                if (!found) {
                    setItemError("Inventory item not found.");
                    return;
                }
                setItem(found);
            })
            .catch((e) => setItemError(e.message));
    }, [id]);

    useEffect(() => {
        if (!item) return;
        setNameInput(item.name);
        setQuantityInput(String(item.quantity));
        setUnitInput(item.unit ?? "");
        setImageUrlInput(item.image_url ?? "");
        setLowStockThresholdInput(item.low_stock_threshold != null ? String(item.low_stock_threshold) : "");
    }, [item]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!id) return;

        const name = nameInput.trim();
        const quantity = Number(quantityInput);
        const unit = unitInput.trim();
        const imageUrl = imageUrlInput.trim();
        const lowStockThreshold = lowStockThresholdInput.trim();

        if (!name) {
            setSubmitError("Name is required.");
            return;
        }
        if (!Number.isFinite(quantity)) {
            setSubmitError("Quantity must be a number.");
            return;
        }
        if (lowStockThreshold && !Number.isFinite(Number(lowStockThreshold))) {
            setSubmitError("Low stock threshold must be a number.");
            return;
        }

        const params = new URLSearchParams({ name, quantity: String(quantity) });
        if (unit) params.set("unit", unit);
        if (imageUrl) params.set("image_url", imageUrl);
        if (lowStockThreshold) params.set("low_stock_threshold", lowStockThreshold);

        try {
            setSubmitError(null);
            await patchJSON(`/inventory_items/${id}?${params.toString()}`);
            navigate("/inventory");
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : "Failed to update inventory item.");
        }
    }

    async function handleDelete() {
        if (!id) return;
        try {
            setDeleteError(null);
            await deleteJSON(`/inventory_items/${id}`);
            navigate("/inventory");
        } catch (e) {
            setDeleteError(e instanceof Error ? e.message : "Failed to delete inventory item.");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-24">
            <div className="p-8 flex flex-col items-center gap-6">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Edit Item</h1>

                {itemError && <p className="text-red-500">{itemError}</p>}

                {item && (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-3 rounded-xl border border-gray-300 px-6 py-4 min-w-[240px] w-full max-w-sm"
                    >
                        {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
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
                            Quantity
                            <input
                                type="number"
                                value={quantityInput}
                                onChange={(e) => setQuantityInput(e.target.value)}
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
                        <label className="flex flex-col text-sm text-gray-600">
                            Image URL (optional)
                            <input
                                type="text"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                            />
                        </label>
                        <label className="flex flex-col text-sm text-gray-600">
                            Low stock threshold (optional)
                            <input
                                type="number"
                                value={lowStockThresholdInput}
                                onChange={(e) => setLowStockThresholdInput(e.target.value)}
                                className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900"
                            />
                        </label>

                        {deleteError && <p className="text-red-500 text-sm">{deleteError}</p>}

                        {isConfirmingDelete ? (
                            <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 mt-3">
                                <p className="text-sm text-red-700">
                                    This action can't be undone. Delete this item permanently?
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmingDelete(false)}
                                        className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="rounded-full px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors"
                                    >
                                        Confirm delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmingDelete(true)}
                                    className="rounded-full px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-700 transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
}

export default InventoryItemEditPage
