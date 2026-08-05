import { useState } from "react";
import { DatabaseBackup, ShieldPlus, Users2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { compactPath, formatDate } from "@/utils/format";

export default function AdminSettingsPage() {
  const { backups, user, createBackup } = useAppStore();
  const [message, setMessage] = useState<string>("");

  const handleCreateBackup = async () => {
    const filePath = await createBackup();
    setMessage(`Đã tạo backup: ${filePath}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-100 p-3">
              <Users2 className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Vai trò đăng nhập</p>
              <p className="text-xl font-bold text-slate-900">
                {user?.role ?? "admin"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Quản trị viên có thể phân quyền, cập nhật danh mục và quản lý các
            tác vụ import, backup.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-fuchsia-100 p-3">
              <DatabaseBackup className="h-5 w-5 text-fuchsia-700" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Sao lưu
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                Backup cơ sở dữ liệu
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleCreateBackup()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            <ShieldPlus className="h-4 w-4" />
            Tạo bản sao lưu mới
          </button>

          <div className="mt-6 space-y-3">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-medium text-slate-900">
                  {compactPath(backup.filePath)}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Tạo lúc {formatDate(backup.createdAt)} bởi {backup.createdBy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
          {message}
        </div>
      ) : null}
    </div>
  );
}
