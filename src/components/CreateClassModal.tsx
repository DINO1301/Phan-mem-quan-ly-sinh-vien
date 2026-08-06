import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import type { Catalogs, CreateClassInput } from "@/types";

interface CreateClassModalProps {
  open: boolean;
  catalogs: Catalogs;
  onClose: () => void;
  onSubmit: (payload: CreateClassInput) => Promise<void>;
}

export default function CreateClassModal({ open, catalogs, onClose, onSubmit }: CreateClassModalProps) {
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
