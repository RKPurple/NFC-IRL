import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patchJSON } from "../lib/api";
import InventoryLinkModal from "./InventoryLinkModal";

type InventorySlopProps = {
    id: number;
    name: string;
    quantity: number;
    unit?: string | null;
    image_url?: string | null;
    low_stock_threshold?: number | null;
    onQuantityAdded?: () => void;
};

function InventorySlop({ id, name, quantity, unit, image_url, low_stock_threshold, onQuantityAdded }: InventorySlopProps) {
    const navigate = useNavigate();
    const isLowStock = low_stock_threshold != null && quantity <= low_stock_threshold;
    const [isLinking, setIsLinking] = useState(false);

    async function handleAdd() {
        const input = window.prompt("Enter amount to add (whole number):");
        if (input === null) return;
        const trimmed = input.trim();
        if (!/^-?\d+$/.test(trimmed)) {
            window.alert("Please enter a whole number.");
            return;
        }
        const value = Number(trimmed);
        try {
            await patchJSON(`/inventory_items/${id}/quantity?quantity=${value}`);
            onQuantityAdded?.();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div
            data-inventory-id={id}
            className="flex items-center justify-between gap-6 rounded-xl border border-gray-300 px-6 py-3 w-full max-w-md"
        >
            <div className="flex items-center gap-4">
                {image_url && (
                    <img
                        src={image_url}
                        alt={name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                )}
                <div className="flex flex-col items-start">
                    <p className="text-lg font-semibold">{name}</p>
                    <span className="text-xl font-mono">
                        {quantity}{unit ? ` ${unit}` : ""}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isLowStock && (
                    <span className="text-sm font-medium text-red-500 whitespace-nowrap">
                        Low stock
                    </span>
                )}
                <button
                    type="button"
                    onClick={handleAdd}
                    className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                    +
                </button>
                <button
                    type="button"
                    onClick={() => setIsLinking(true)}
                    className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    Link
                </button>
                <button
                    type="button"
                    onClick={() => navigate(`/inventory/${id}/edit`)}
                    className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    Edit
                </button>
            </div>

            {isLinking && (
                <InventoryLinkModal itemId={id} itemName={name} onClose={() => setIsLinking(false)} />
            )}
        </div>
    )
}

export default InventorySlop
