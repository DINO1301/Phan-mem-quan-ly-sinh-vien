import { Download, FileSpreadsheet, Files, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { compactPath } from "@/utils/format";

export default function ReportsPage() {
  const { reportSummaries, exportReport } = useAppStore();
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Báo cáo và thống kê</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-900">
            Tạo báo cáo tổng hợp, xuất Excel và PDF để gửi cho phòng ban liên quan.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Bộ chỉ số được tính từ hồ sơ sinh viên, nghiệp vụ phát sinh và trạng thái hiện tại, phù hợp cho tổng hợp theo lớp, khóa, đối tượng và quyết định học vụ.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Xuất file an toàn</p>
              <p className="text-xl font-semibold text-slate-900">Lưu vào thư mục Downloads hoặc backup nội bộ</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={async () => {
                const filePath = await exportReport("excel");
                setMessage(`Đã tạo file Excel: ${compactPath(filePath)}`);
              }}
              className="rounded-2xl bg-slate-800 px-5 py-4 text-left text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <FileSpreadsheet className="mb-3 h-5 w-5" />
              Xuất danh sách Excel
            </button>
            <button
              type="button"
              onClick={async () => {
                const filePath = await exportReport("pdf");
                setMessage(`Đã tạo file PDF: ${compactPath(filePath)}`);
              }}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              <Files className="mb-3 h-5 w-5" />
              Xuất báo cáo PDF
            </button>
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {reportSummaries.map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{item.title}</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{item.value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.subtitle}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-fuchsia-100 p-3">
            <Download className="h-5 w-5 text-fuchsia-700" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Mẫu báo cáo</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Danh mục thống kê sẵn dùng</h3>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {[
              "Thống kê HSSV theo cơ cấu xã hội",
              "Danh sách sinh viên được học bổng",
              "Báo cáo sinh viên bị kỷ luật",
              "Thống kê sinh viên tốt nghiệp",
              "Thống kê sinh viên bảo lưu và biến động",
              "Tổng hợp kết quả học tập và rèn luyện",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                {item}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
