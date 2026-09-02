import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getJSON, postJSON } from "../lib/api";
import InventorySlop from "../components/InventorySlop";

type InventoryItem = {
    id: number;
    name: string;
    quantity: number;
    unit: string | null;
    image_url: string | null;
    created_at: string;
    low_stock_threshold: number | null;
};

type CreatedInventoryItemResponse = {
    created_item: InventoryItem;
};

function InventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[] | null>(null);
    const [inventoryItemsError, setInventoryItemsError] = useState<string | null>(null);

    const [isCreating, setIsCreating] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [quantityInput, setQuantityInput] = useState("");
    const [unitInput, setUnitInput] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [lowStockThresholdInput, setLowStockThresholdInput] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        getJSON<InventoryItem[]>("/inventory_items").then(setInventoryItems).catch((e) => setInventoryItemsError(e.message));
    }, []);

    async function handleCreateSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const name = nameInput.trim();
        const quantity = Number(quantityInput);
        const unit = unitInput.trim();
        const imageUrl = imageUrlInput.trim();
        const lowStockThreshold = lowStockThresholdInput.trim();

        if (!name) {
            setCreateError("Name is required.");
            return;
        }
        if (!Number.isFinite(quantity)) {
            setCreateError("Quantity must be a number.");
            return;
        }
        if (lowStockThreshold && !Number.isFinite(Number(lowStockThreshold))) {
            setCreateError("Low stock threshold must be a number.");
            return;
        }

        const params = new URLSearchParams({ name, quantity: String(quantity) });
        if (unit) params.set("unit", unit);
        if (imageUrl) params.set("image_url", imageUrl);
        if (lowStockThreshold) params.set("low_stock_threshold", lowStockThreshold);

        try {
            setCreateError(null);
            await postJSON<CreatedInventoryItemResponse>(`/inventory_items/create?${params.toString()}`);
            window.location.reload();
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to create inventory item.");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-24">
            <div className="p-8 flex flex-col items-center gap-6">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">Inventory</h1>

                {inventoryItemsError && <p className="text-red-500">{inventoryItemsError}</p>}
                {inventoryItems?.map((item) => (
                    <InventorySlop
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        quantity={item.quantity}
                        unit={item.unit}
                        image_url={item.image_url}
                        low_stock_threshold={item.low_stock_threshold}
                        onQuantityAdded={() => window.location.reload()}
                    />
                ))}

                {!isCreating && (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-green-500 transition-colors"
                    >
                        + New item
                    </button>
                )}

                {isCreating && (
                    <form
                        onSubmit={handleCreateSubmit}
                        className="flex flex-col gap-3 rounded-xl border border-gray-300 px-6 py-4 min-w-[240px] w-full max-w-sm"
                    >
                        {createError && <p className="text-red-500 text-sm">{createError}</p>}
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
                        <div className="flex items-center justify-end gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setCreateError(null);
                                    setNameInput("");
                                    setQuantityInput("");
                                    setUnitInput("");
                                    setImageUrlInput("");
                                    setLowStockThresholdInput("");
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

export default InventoryPage
