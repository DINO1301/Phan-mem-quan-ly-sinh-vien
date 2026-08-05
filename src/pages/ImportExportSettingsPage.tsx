import { useState } from "react";
import * as XLSX from "xlsx";
import { FileUp, FileSpreadsheet } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { StudentFormInput } from "@/types";

export default function ImportExportSettingsPage() {
  const { importStudents, exportReport } = useAppStore();
  const [message, setMessage] = useState<string>("");

  const handleImport = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);
    const payload: Partial<StudentFormInput>[] = rows.map((row) => ({
      studentCode: row.studentCode ?? row["Mã sinh viên"] ?? row["ma_sv"],
      fullName: row.fullName ?? row["Họ và tên"] ?? row["ho_ten"],
      dateOfBirth: row.dateOfBirth ?? row["Ngày sinh"],
      gender: row.gender ?? row["Giới tính"],
      phone: row.phone ?? row["Số điện thoại"],
      email: row.email ?? row["Email"],
      address: row.address ?? row["Địa chỉ"],
      facultyId: row.facultyId ?? "f1",
      majorId: row.majorId ?? "m1",
      classId: row.classId ?? "c1",
      courseId: row.courseId ?? "k2",
      trainingSystemId: row.trainingSystemId ?? "t1",
      status: (row.status as StudentFormInput["status"]) ?? "dang_hoc",
    }));

    const result = await importStudents(payload);
    setMessage(
      `Đã nhập ${result.added} hồ sơ mới và cập nhật ${result.updated} hồ sơ.`
    );
  };

  const handleExport = async (type: "excel" | "pdf") => {
    const filePath = await exportReport(type);
    setMessage(
      `Đã tạo ${type === "excel" ? "file Excel" : "file PDF"}: ${filePath}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <FileUp className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Nhập dữ liệu
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                Import Excel hàng loạt
              </h3>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-sm leading-6 text-slate-700">
              Hỗ trợ đọc cột studentCode, fullName hoặc tên cột tiếng Việt như
              Mã sinh viên, Họ và tên.
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition">
              Chọn file Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleImport(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-100 p-3">
              <FileSpreadsheet className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Xuất dữ liệu
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                Xuất Excel/PDF
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void handleExport("excel")}
              className="rounded-2xl bg-slate-800 px-5 py-4 text-left text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Xuất danh sách Excel
            </button>
            <button
              type="button"
              onClick={() => void handleExport("pdf")}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Xuất báo cáo PDF
            </button>
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
