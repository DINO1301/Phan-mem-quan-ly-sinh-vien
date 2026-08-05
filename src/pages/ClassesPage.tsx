import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Catalogs, CreateClassInput } from "@/types";

interface CreateClassModalProps {
  open: boolean;
  catalogs: Catalogs;
  onClose: () => void;
  onSubmit: (payload: CreateClassInput) => Promise<void>;
}

function CreateClassModal({ open, catalogs, onClose, onSubmit }: CreateClassModalProps) {
  const { register, handleSubmit, reset } = useForm<CreateClassInput>({
    defaultValues: {
      name: "",
      code: "",
      majorId: catalogs.majors[0]?.id ?? "",
      courseId: catalogs.courses[0]?.id ?? "",
    },
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    reset({
      name: "",
      code: "",
      majorId: catalogs.majors[0]?.id ?? "",
      courseId: catalogs.courses[0]?.id ?? "",
    });
  }, [catalogs.courses, catalogs.majors, open, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Lớp</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Thêm lớp</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form
          className="grid gap-4"
          onSubmit={handleSubmit(async (values) => {
            setError("");
            setSaving(true);
            try {
              await onSubmit(values);
              onClose();
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Không thể thêm lớp");
            } finally {
              setSaving(false);
            }
          })}
        >
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tên lớp</span>
            <input
              {...register("name")}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Mã lớp</span>
            <input
              {...register("code")}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Ngành</span>
            <select
              {...register("majorId")}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
            >
              {catalogs.majors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Khóa học</span>
            <select
              {...register("courseId")}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
            >
              {catalogs.courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Thêm lớp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

