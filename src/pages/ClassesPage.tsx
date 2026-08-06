import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import CreateClassModal from "@/components/CreateClassModal";
import { useAppStore } from "@/store/useAppStore";

export default function ClassesPage() {
  const { user, catalogs, createClass } = useAppStore();
  const [open, setOpen] = useState(false);
  const [classPageIndex, setClassPageIndex] = useState(0);
  const classPageSize = 6;

  const canEdit = user?.role !== "academic_officer";

  if (!catalogs) return null;

  if (!canEdit) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Bạn không có quyền truy cập chức năng này.
      </div>
    );
  }

  const classPageCount = Math.max(1, Math.ceil(catalogs.classes.length / classPageSize));
  const pagedClasses = useMemo(
    () =>
      catalogs.classes.slice(
        classPageIndex * classPageSize,
        classPageIndex * classPageSize + classPageSize,
      ),
    [catalogs.classes, classPageIndex],
  );

  useEffect(() => {
    setClassPageIndex(0);
  }, [catalogs.classes.length]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Danh mục</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Quản lý lớp</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            <Plus className="h-4 w-4" />
            Thêm lớp
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          {pagedClasses.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800"
            >
              {item.name}
            </div>
          ))}
          {pagedClasses.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Chưa có lớp nào.
            </div>
          ) : null}
        </div>

        {catalogs.classes.length > classPageSize ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
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
      </section>

      <CreateClassModal
        open={open}
        catalogs={catalogs}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => createClass(payload)}
      />
    </div>
  );
}
