import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAppStore();
  const isSystemAdmin = user?.role === "admin";
  const canEdit = user?.role !== "academic_officer";
  const items = [
    { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/students", label: "Hồ sơ sinh viên", icon: Users },
    ...(isSystemAdmin ? [{ to: "/permissions", label: "Phân quyền", icon: Shield }] : []),
    { to: "/reports", label: "Báo cáo", icon: FileBarChart },
    ...(isSystemAdmin ? [{ to: "/settings", label: "Hệ thống", icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white p-6">
          <Link
            to="/dashboard"
            className="mb-8 block text-2xl font-bold text-slate-900"
          >
            Campus Desk
          </Link>

          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </aside>

        <main className="p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {items.find((item) => location.pathname.startsWith(item.to))
                  ?.label ?? "Quản lý sinh viên"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <Bell className="h-4 w-4" />
                <span>{user?.fullName ?? "Chưa đăng nhập"}</span>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
