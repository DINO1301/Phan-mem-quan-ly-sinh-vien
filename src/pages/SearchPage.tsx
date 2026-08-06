import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { UserRole } from "@/types";

const roleOptions: Array<{ value: Exclude<UserRole, "admin">; label: string; permissionLabel: string }> = [
  { value: "affairs_officer", label: "Có thể sửa", permissionLabel: "Sửa" },
  { value: "academic_officer", label: "Chỉ xem", permissionLabel: "Chỉ xem" },
];

export default function SearchPage() {
  const { user, users, loadUsers, createUser, updateUserRole, updateUserActive } = useAppStore();
  const [savingUserId, setSavingUserId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string>("");
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Exclude<UserRole, "admin">>("affairs_officer");
  const [userPageIndex, setUserPageIndex] = useState(0);
  const userPageSize = 6;

  useEffect(() => {
    if (user?.role === "admin") {
      void loadUsers();
    }
  }, [loadUsers, user?.role]);

  useEffect(() => {
    setUserPageIndex(0);
  }, [users.length]);

  const isAdmin = user?.role === "admin";
  const roleMap = useMemo(() => Object.fromEntries(roleOptions.map((opt) => [opt.value, opt])), []);
  const userPageCount = Math.max(1, Math.ceil(users.length / userPageSize));
  const pagedUsers = users.slice(
    userPageIndex * userPageSize,
    userPageIndex * userPageSize + userPageSize,
  );

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Bạn không có quyền truy cập chức năng này.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Quản trị hệ thống</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Phân quyền tài khoản</h2>
        <p className="mt-2 text-slate-600">Thiết lập tài khoản có thể sửa hoặc chỉ xem dữ liệu.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Tạo tài khoản</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Cấp tài khoản mới</h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tên tài khoản</span>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="vd: gv01"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Họ tên</span>
            <input
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="vd: Giáo viên A"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Quyền</span>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Exclude<UserRole, "admin">)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="affairs_officer">Có thể sửa</option>
              <option value="academic_officer">Chỉ xem</option>
            </select>
          </label>
        </div>

        {createError && <div className="mt-4 text-sm text-red-600">{createError}</div>}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={creating}
            onClick={async () => {
              setCreateError("");
              const username = newUsername.trim();
              const fullName = newFullName.trim();
              const password = newPassword.trim();
              if (!username || !fullName || !password) {
                setCreateError("Vui lòng nhập đầy đủ tên tài khoản, họ tên và mật khẩu.");
                return;
              }

              setCreating(true);
              try {
                await createUser({ username, fullName, password, role: newRole, isActive: true });
                setNewUsername("");
                setNewFullName("");
                setNewPassword("");
                setNewRole("affairs_officer");
              } catch (error) {
                setCreateError(error instanceof Error ? error.message : "Không thể tạo tài khoản");
              } finally {
                setCreating(false);
              }
            }}
            className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50"
          >
            {creating ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Tài khoản</th>
                <th className="px-6 py-4 font-medium">Họ tên</th>
                <th className="px-6 py-4 font-medium">Quyền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pagedUsers.map((account) => (
                <tr key={account.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{account.username}</div>
                    <div className="text-xs text-slate-500">
                      {account.role === "admin" ? "Toàn quyền" : roleMap[account.role]?.permissionLabel}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{account.fullName}</td>
                  <td className="px-6 py-4">
                    {account.role === "admin" ? (
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                        Quản trị
                      </div>
                    ) : (
                      <select
                        value={account.role}
                        disabled={savingUserId === account.id}
                        onChange={async (event) => {
                          const nextRole = event.target.value as Exclude<UserRole, "admin">;
                          setSavingUserId(account.id);
                          try {
                            await updateUserRole(account.id, nextRole);
                          } finally {
                            setSavingUserId("");
                          }
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <label className="inline-flex items-center gap-2 text-slate-700">
                      <input
                        type="checkbox"
                        checked={account.isActive}
                        disabled={savingUserId === account.id}
                        onChange={async (event) => {
                          setSavingUserId(account.id);
                          try {
                            await updateUserActive(account.id, event.target.checked);
                          } finally {
                            setSavingUserId("");
                          }
                        }}
                      />
                      Hoạt động
                    </label>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Chưa có tài khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {users.length > userPageSize ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-700">
            <span>
              Trang {userPageIndex + 1} / {userPageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={userPageIndex === 0}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trang trước
              </button>
              <button
                type="button"
                onClick={() => setUserPageIndex((prev) => Math.min(userPageCount - 1, prev + 1))}
                disabled={userPageIndex >= userPageCount - 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
