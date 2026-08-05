import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import StudentEditorModal from "@/components/StudentEditorModal";
import { useAppStore } from "@/store/useAppStore";
import type { StudentSummary } from "@/types";

export default function StudentsPage() {
  const { user, students, catalogs, saveStudent } = useAppStore();
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentSummary | null>(null);
  const [classPageIndex, setClassPageIndex] = useState(0);
  const classPageSize = 6;

  const filteredStudents = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return students;
    }

    return students.filter((student) =>
      [student.studentCode, student.fullName, student.className, student.majorName, student.courseName]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [keyword, students]);

  // Group students by class
  const studentsByClass = useMemo(() => {
    const groups: Record<string, StudentSummary[]> = {};
    filteredStudents.forEach((student) => {
      if (!groups[student.className]) {
        groups[student.className] = [];
      }
      groups[student.className].push(student);
    });
    return groups;
  }, [filteredStudents]);

  const classEntries = useMemo(
    () =>
      Object.entries(studentsByClass).sort(([a], [b]) =>
        a.localeCompare(b, "vi", { sensitivity: "base" }),
      ),
    [studentsByClass],
  );

  useEffect(() => {
    setClassPageIndex(0);
  }, [keyword]);

  if (!catalogs) {
    return null;
  }

  const handleCloseModal = () => {
    setOpen(false);
    setEditingStudent(null);
  };
  const canEdit = user?.role !== "academic_officer";
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
            Danh sách và cập nhật hồ sơ
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[250px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã SV, tên, lớp, ngành..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
          </label>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingStudent(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
            >
              <Plus className="h-4 w-4" />
              Thêm sinh viên
            </button>
          )}
        </div>
      </section>

      <div className="space-y-4">
        {classEntries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">Không tìm thấy sinh viên nào</p>
          </div>
        ) : (
          pagedClasses.map(([className, classStudents]) => (
            <Link
              key={className}
              to={`/class/${encodeURIComponent(className)}`}
              className="block rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50"
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Lớp {className}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {classStudents.length} sinh viên
                  </span>
                </div>
                <span className="text-sm text-slate-600">Xem danh sách</span>
              </div>
            </Link>
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

      <StudentEditorModal
        open={open}
        catalogs={catalogs}
        initialValue={editingStudent}
        onClose={handleCloseModal}
        onSubmit={async (payload) => {
          await saveStudent(payload);
          handleCloseModal();
        }}
      />
    </div>
  );
}
