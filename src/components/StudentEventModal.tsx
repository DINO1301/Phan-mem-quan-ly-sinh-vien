import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import type { StudentEvent, StudentEventFormInput } from "@/types";

const eventTypeGroups = [
  {
    label: "Học tập và rèn luyện",
    options: [
      { value: "hoc_tap", label: "Học tập" },
      { value: "ren_luyen", label: "Rèn luyện" },
    ],
  },
  {
    label: "Khen thưởng và kỷ luật",
    options: [
      { value: "khen_thuong", label: "Khen thưởng" },
      { value: "ky_luat", label: "Kỷ luật" },
    ],
  },
  {
    label: "Tài chính và hỗ trợ",
    options: [
      { value: "hoc_bong", label: "Học bổng" },
      { value: "vay_von", label: "Vay vốn" },
      { value: "lam_them", label: "Làm thêm" },
      { value: "noi_ngoai_tru", label: "Nội-ngoại trú" },
    ],
  },
  {
    label: "Sự thay đổi và tốt nghiệp",
    options: [
      { value: "bien_dong", label: "Biến động" },
      { value: "tot_nghiep", label: "Tốt nghiệp" },
    ],
  },
] as const;

interface Props {
  open: boolean;
  studentId: string;
  initialValue?: StudentEvent | null;
  onClose: () => void;
  onSubmit: (data: StudentEventFormInput) => Promise<void>;
}

export default function StudentEventModal({ open, studentId, initialValue, onClose, onSubmit }: Props) {
  const initialMetadata = useMemo(() => {
    if (!initialValue?.metadataJson) return {};
    try {
      return JSON.parse(initialValue.metadataJson) as Record<string, unknown>;
    } catch {
      return {};
    }
  }, [initialValue?.metadataJson]);

  const [effectiveDateTo, setEffectiveDateTo] = useState("");
  const [semester, setSemester] = useState<"" | "1" | "2">("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<StudentEventFormInput>({
    defaultValues: initialValue || {
      studentId,
      type: "hoc_bong",
      title: "",
      decisionNumber: "",
      effectiveDate: "",
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(initialValue || { studentId, type: "hoc_bong", title: "" });
      const meta = initialMetadata as { effectiveDateTo?: string; semester?: string };
      setEffectiveDateTo(meta.effectiveDateTo ?? "");
      setSemester(meta.semester === "1" || meta.semester === "2" ? meta.semester : "");
    }
  }, [open, initialValue, initialMetadata, reset, studentId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900">
            {initialValue ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(async (data) => {
            const meta = {
              ...initialMetadata,
              ...(effectiveDateTo ? { effectiveDateTo } : {}),
              ...(semester ? { semester } : {}),
            };
            const normalizedMeta = Object.keys(meta).length ? JSON.stringify(meta) : undefined;
            await onSubmit({ ...data, metadataJson: normalizedMeta });
            onClose();
          })}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loại sự kiện</label>
            <select
              {...register("type", { required: true })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {eventTypeGroups.map((group, groupIndex) => (
                <optgroup key={groupIndex} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Học kì</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value as "" | "1" | "2")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Chọn học kì</option>
              <option value="1">Học kì 1</option>
              <option value="2">Học kì 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên sự kiện *</label>
            <input
              {...register("title", { required: true })}
              placeholder="Nhập tên sự kiện"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số quyết định</label>
            <input
              {...register("decisionNumber")}
              placeholder="Nhập số quyết định (nếu có)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hiệu lực</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-xs text-slate-500">Từ ngày</div>
                <input
                  type="date"
                  {...register("effectiveDate")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">Đến ngày</div>
                <input
                  type="date"
                  value={effectiveDateTo}
                  onChange={(e) => setEffectiveDateTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Nhập ghi chú (nếu có)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
