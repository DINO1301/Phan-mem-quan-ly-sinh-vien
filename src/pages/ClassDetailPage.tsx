import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import StudentEditorModal from "@/components/StudentEditorModal";
import StudentsTable from "@/components/StudentsTable";
import { useAppStore } from "@/store/useAppStore";
import type { StudentSummary } from "@/types";

export default function ClassDetailPage() {
  const { className } = useParams<{ className: string }>();
  const { user, students, catalogs, deleteStudent, saveStudent } = useAppStore();
  const [classStudents, setClassStudents] = useState<StudentSummary[]>([]);
  const [openCreateStudent, setOpenCreateStudent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (className) {
      const decodedClassName = decodeURIComponent(className);
      setClassStudents(students.filter(student => student.className === decodedClassName));
    }
  }, [className, students]);

  const decodedClassName = className ? decodeURIComponent(className) : "";
  const classId = useMemo(() => {
    if (!catalogs || !decodedClassName) return "";
    return catalogs.classes.find((item) => item.name === decodedClassName)?.id ?? "";
  }, [catalogs, decodedClassName]);

  const handleEdit = (student: StudentSummary) => {
    navigate(`/students/${student.id}`);
  };
  const canEdit = user?.role !== "academic_officer";

  return (
    <div className="space-y-6">
      <Link
        to="/students"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại danh sách lớp
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Lớp học</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {decodedClassName || "Không tìm thấy lớp"}
            </h2>
            <p className="mt-2 text-slate-600">{classStudents.length} sinh viên</p>
          </div>

          {canEdit ? (
            <button
              type="button"
              onClick={() => setOpenCreateStudent(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
            >
              <Plus className="h-4 w-4" />
              Thêm sinh viên
            </button>
          ) : null}
        </div>
      </section>

      <StudentsTable
        students={classStudents}
        onEdit={handleEdit}
        onDelete={deleteStudent}
        hideClassColumn={true}
        canEdit={canEdit}
        canDelete={canEdit}
      />

      {catalogs ? (
        <StudentEditorModal
          open={openCreateStudent}
          catalogs={catalogs}
          initialValue={null}
          initialClassId={classId}
          onClose={() => setOpenCreateStudent(false)}
          onSubmit={(payload) => saveStudent(payload)}
        />
      ) : null}
    </div>
  );
}
