import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowRightLeft,
  ClipboardList,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    {
      to: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"]
    },
    {
      to: "/purchases",
      label: "Purchases",
      icon: ShoppingCart,
      roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"]
    },
    {
      to: "/transfers",
      label: "Transfers",
      icon: ArrowRightLeft,
      roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"]
    },
    {
      to: "/assignments",
      label: "Assignments",
      icon: ClipboardList,
      roles: ["ADMIN", "BASE_COMMANDER"]
    }
  ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white hidden md:block">
        <div className="p-5 border-b border-slate-700">
          <h1 className="font-bold text-lg">Military Assets</h1>
          <p className="text-xs text-slate-400 mt-1">Asset Management</p>
        </div>

        <nav className="p-3 space-y-1">
          {links
            .filter((link) => link.roles.includes(user.role))
            .map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive
                        ? "bg-blue-600"
                        : "text-slate-300 hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.label}
                </NavLink>
              );
            })}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{user.username}</h2>
            <p className="text-xs text-slate-500">
              {user.role}
              {user.baseName ? ` • ${user.baseName}` : " • All Bases"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-slate-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
