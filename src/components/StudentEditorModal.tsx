import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import type { Catalogs, StudentFormInput, StudentSummary } from "@/types";

interface StudentEditorModalProps {
  open: boolean;
  catalogs: Catalogs;
  initialValue?: StudentSummary | null;
  onClose: () => void;
  onSubmit: (payload: StudentFormInput) => Promise<void>;
}

const statuses = [
  { value: "dang_hoc", label: "Đang học" },
  { value: "bao_luu", label: "Bảo lưu" },
  { value: "tam_ngung", label: "Tạm ngừng" },
  { value: "tot_nghiep", label: "Tốt nghiệp" },
  { value: "thoi_hoc", label: "Thôi học" },
] as const;

export default function StudentEditorModal({
  open,
  catalogs,
  initialValue,
  onClose,
  onSubmit,
}: StudentEditorModalProps) {
  const { register, handleSubmit, reset } = useForm<StudentFormInput>({
    defaultValues: {
      studentCode: "",
      fullName: "",
      facultyId: catalogs.faculties[0]?.id ?? "",
      majorId: catalogs.majors[0]?.id ?? "",
      classId: catalogs.classes[0]?.id ?? "",
      courseId: catalogs.courses[0]?.id ?? "",
      trainingSystemId: catalogs.trainingSystems[0]?.id ?? "",
      status: "dang_hoc",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      id: initialValue?.id,
      studentCode: initialValue?.studentCode ?? "",
      fullName: initialValue?.fullName ?? "",
      dateOfBirth: initialValue?.dateOfBirth ?? "",
      gender: initialValue?.gender ?? "",
      phone: initialValue?.phone ?? "",
      email: initialValue?.email ?? "",
      address: initialValue?.address ?? "",
      facultyId: initialValue?.facultyId ?? catalogs.faculties[0]?.id ?? "",
      majorId: initialValue?.majorId ?? catalogs.majors[0]?.id ?? "",
      classId: initialValue?.classId ?? catalogs.classes[0]?.id ?? "",
      courseId: initialValue?.courseId ?? catalogs.courses[0]?.id ?? "",
      trainingSystemId: initialValue?.trainingSystemId ?? catalogs.trainingSystems[0]?.id ?? "",
      policyObjectId: initialValue?.policyObjectId ?? "",
      status: initialValue?.status ?? "dang_hoc",
    });
  }, [catalogs, initialValue, open, reset]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Cập nhật hồ sơ</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {initialValue ? "Chỉnh sửa sinh viên" : "Thêm sinh viên mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
            onClose();
          })}
        >
          {[
            ["studentCode", "Mã sinh viên"],
            ["fullName", "Họ và tên"],
            ["dateOfBirth", "Ngày sinh"],
            ["gender", "Giới tính"],
            ["phone", "Số điện thoại"],
            ["email", "Email"],
            ["address", "Địa chỉ"],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                {...register(field as keyof StudentFormInput)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-slate-500"
              />
            </label>
          ))}

          {(
            [
              ["facultyId", "Khoa", catalogs.faculties],
              ["majorId", "Ngành", catalogs.majors],
              ["classId", "Lớp", catalogs.classes],
              ["courseId", "Khóa học", catalogs.courses],
              ["trainingSystemId", "Hệ đào tạo", catalogs.trainingSystems],
              ["policyObjectId", "Đối tượng ưu tiên", catalogs.policyObjects],
            ] as Array<[keyof StudentFormInput, string, Array<{ id: string; name: string }>]>
          ).map(([field, label, options]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <select
                {...register(field)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Chọn</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id} className="bg-white">
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Trạng thái</span>
            <select
              {...register("status")}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-500"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value} className="bg-white">
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
