import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, X } from "lucide-react";
import CreateClassModal from "@/components/CreateClassModal";
import { useAppStore } from "@/store/useAppStore";

export default function StudentsPage() {
  const { user, students, catalogs, createClass, deleteClass } = useAppStore();
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [confirmClassId, setConfirmClassId] = useState<string | null>(null);
  const [confirmClassName, setConfirmClassName] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const [classPageIndex, setClassPageIndex] = useState(0);
  const classPageSize = 6;

  const filteredClasses = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    const classes = catalogs?.classes ?? [];
    if (!normalized) return classes;
    return classes.filter((item) =>
      [item.name, item.code].filter(Boolean).join(" ").toLowerCase().includes(normalized),
    );
  }, [catalogs?.classes, keyword]);

  const studentsCountByClassId = useMemo(() => {
    const counts = new Map<string, number>();
    students.forEach((student) => {
      counts.set(student.classId, (counts.get(student.classId) ?? 0) + 1);
    });
    return counts;
  }, [students]);

  const classEntries = useMemo(() => {
    return [...filteredClasses].sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));
  }, [filteredClasses]);

  useEffect(() => {
    setClassPageIndex(0);
  }, [keyword]);

  if (!catalogs) {
    return null;
  }

  const canCreateClass = user?.role === "admin";
  const classPageCount = Math.max(1, Math.ceil(classEntries.length / classPageSize));
  const pagedClasses = classEntries.slice(
    classPageIndex * classPageSize,
    classPageIndex * classPageSize + classPageSize,
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Hồ sơ sinh viên</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Danh sách lớp
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[250px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên lớp, mã lớp..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
          </label>
          {canCreateClass && (
            <button
              type="button"
              onClick={() => {
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
            >
              <Plus className="h-4 w-4" />
              Thêm lớp
            </button>
          )}
        </div>
      </section>

      <div className="space-y-4">
        {classEntries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">Không tìm thấy lớp nào</p>
          </div>
        ) : (
          pagedClasses.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50"
            >
              <Link
                to={`/class/${encodeURIComponent(item.name)}`}
                className="flex flex-1 items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Lớp {item.name}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {studentsCountByClassId.get(item.id) ?? 0} sinh viên
                  </span>
                </div>
                <span className="text-sm text-slate-600">Xem danh sách</span>
              </Link>
              {canCreateClass ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    const count = studentsCountByClassId.get(item.id) ?? 0;
                    if (count > 0) {
                      setDeleteError("Không thể xóa lớp này vì vẫn còn sinh viên trong lớp.");
                      setConfirmClassId(null);
                      return;
                    }
                    setDeleteError("");
                    setConfirmClassId(item.id);
                    setConfirmClassName(item.name);
                  }}
                  className="mr-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                  title="Xóa lớp"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Xóa</span>
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>

      {classEntries.length > classPageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700">
          <span>
            Trang {classPageIndex + 1} / {classPageCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setClassPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={classPageIndex === 0}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang trước
            </button>
            <button
              type="button"
              onClick={() => setClassPageIndex((prev) => Math.min(classPageCount - 1, prev + 1))}
              disabled={classPageIndex >= classPageCount - 1}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      ) : null}

      {confirmClassId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Xóa lớp</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Bạn chắc chắn muốn xóa lớp <strong>{confirmClassName}</strong>? Hành động này không thể hoàn tác.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmClassId(null);
                  setDeleteError("");
                }}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {deleteError ? (
              <div className="mt-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">{deleteError}</div>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmClassId(null);
                  setDeleteError("");
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError("");
                  try {
                    await deleteClass(confirmClassId);
                    setConfirmClassId(null);
                  } catch (error) {
                    setDeleteError(error instanceof Error ? error.message : "Không thể xóa lớp");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? "Đang xóa..." : "Xóa lớp"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CreateClassModal
        open={open}
        catalogs={catalogs}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => createClass(payload)}
      />
    </div>
  );
}
