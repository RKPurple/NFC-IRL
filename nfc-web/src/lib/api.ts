const API_URL = import.meta.env.VITE_API_URL;

export async function getJSON<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error(`Request to ${path} failed: ${res.status}`);
    return res.json();
}
