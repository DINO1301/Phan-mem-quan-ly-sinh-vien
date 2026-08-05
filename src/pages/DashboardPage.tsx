import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const { dashboard } = useAppStore();

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Trung tâm điều hành
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            Theo dõi biến động sinh viên, xử lý nghiệp vụ và xuất báo cáo
          </h2>
        </div>
        <div className="flex gap-3">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Mở hồ sơ sinh viên
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xem báo cáo
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboard.stats.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Phân bố trạng thái
          </p>
          <div className="mt-4 space-y-3">
            {dashboard.statusBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-900">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Math.max(item.value * 20, 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Hồ sơ gần đây
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                Cập nhật mới nhất
              </h3>
            </div>
            <Link
              to="/students"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {dashboard.recentStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {student.fullName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {student.studentCode} • {student.className} •{" "}
                      {student.majorName}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {student.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
