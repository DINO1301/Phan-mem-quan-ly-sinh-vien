import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import StudentsTable from "@/components/StudentsTable";
import { useAppStore } from "@/store/useAppStore";
import type { StudentSummary } from "@/types";

export default function ClassDetailPage() {
  const { className } = useParams<{ className: string }>();
  const { user, students, deleteStudent } = useAppStore();
  const [classStudents, setClassStudents] = useState<StudentSummary[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (className) {
      const decodedClassName = decodeURIComponent(className);
      setClassStudents(students.filter(student => student.className === decodedClassName));
    }
  }, [className, students]);

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
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Lớp học</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {className ? decodeURIComponent(className) : "Không tìm thấy lớp"}
          </h2>
          <p className="mt-2 text-slate-600">
            {classStudents.length} sinh viên
          </p>
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
    </div>
  );
}
