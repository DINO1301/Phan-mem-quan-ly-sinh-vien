import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

export default function SettingsPage() {
  const { user } = useAppStore();
  if (user?.username !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { to: "/settings/catalogs", label: "Danh mục hệ thống" },
    { to: "/settings/import-export", label: "Nhập xuất dữ liệu" },
    { to: "/settings/admin", label: "Quản trị hệ thống" },
  ];

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-slate-800 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
