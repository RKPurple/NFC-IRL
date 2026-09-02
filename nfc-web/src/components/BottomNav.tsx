import { NavLink } from "react-router-dom";

const links = [
    { to: "/", label: "Home" },
    { to: "/edit", label: "Edit" },
    { to: "/inventory", label: "Inventory" },
];

function BottomNav() {
    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-white/80 backdrop-blur border border-neutral-200 shadow-lg px-2 py-2">
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                        `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            isActive
                                ? "bg-neutral-900 text-white"
                                : "text-neutral-600 hover:bg-neutral-100"
                        }`
                    }
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
}

export default BottomNav;
