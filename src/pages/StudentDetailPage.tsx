import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { StudentDetail, StudentEvent, StudentEventFormInput } from "@/types";
import { formatDate, formatStatus, getStatusClasses } from "@/utils/format";
import StudentEventModal from "@/components/StudentEventModal";
import StudentEditorModal from "@/components/StudentEditorModal";

const eventLabels: Record<string, string> = {
  hoc_bong: "Học bổng",
  khen_thuong: "Khen thưởng",
  ky_luat: "Kỷ luật",
  vay_von: "Vay vốn",
  bien_dong: "Biến động",
  noi_ngoai_tru: "Nội ngoại trú",
  lam_them: "Làm thêm",
  hoc_tap: "Học tập",
  ren_luyen: "Rèn luyện",
  tot_nghiep: "Tốt nghiệp",
};

const eventTypeColors: Record<string, { bg: string; text: string }> = {
  hoc_bong: { bg: "bg-slate-100", text: "text-slate-700" },
  khen_thuong: { bg: "bg-slate-100", text: "text-slate-700" },
  ky_luat: { bg: "bg-slate-100", text: "text-slate-700" },
  vay_von: { bg: "bg-slate-100", text: "text-slate-700" },
  bien_dong: { bg: "bg-slate-100", text: "text-slate-700" },
  noi_ngoai_tru: { bg: "bg-slate-100", text: "text-slate-700" },
  lam_them: { bg: "bg-slate-100", text: "text-slate-700" },
  hoc_tap: { bg: "bg-slate-100", text: "text-slate-700" },
  ren_luyen: { bg: "bg-slate-100", text: "text-slate-700" },
  tot_nghiep: { bg: "bg-slate-100", text: "text-slate-700" },
};

function readEventMetadata(value?: string) {
  if (!value) return {};
  try {
    return JSON.parse(value) as { effectiveDateTo?: string; semester?: string };
  } catch {
    return {};
  }
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const { user, catalogs, getStudentById, saveStudentEvent, deleteStudentEvent, saveStudent } = useAppStore();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StudentEvent | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [studentEditorOpen, setStudentEditorOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    void getStudentById(id).then(setStudent);
  }, [getStudentById, id]);

  const refreshStudent = async () => {
    if (id) {
      const refreshed = await getStudentById(id);
      setStudent(refreshed);
    }
  };

  const handleEventSubmit = async (data: StudentEventFormInput) => {
    // First, save the event
    await saveStudentEvent(data);
    
    // Then, update the student's status if needed
    if (student) {
      let newStatus = student.status;
      
      // Map event types to statuses
      if (data.type === "tot_nghiep") {
        newStatus = "tot_nghiep";
      } else if (data.type === "ky_luat") {
        newStatus = "tam_ngung";
      } else if (data.type === "bien_dong") {
        // Maybe "bao_luu" for bien dong?
        newStatus = "bao_luu";
      }
      
      // If status changed, update the student
      if (newStatus !== student.status) {
        const updatedStudent = {
          studentCode: student.studentCode,
          fullName: student.fullName,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          phone: student.phone,
          email: student.email,
          address: student.address,
          facultyId: student.facultyId,
          majorId: student.majorId,
          classId: student.classId,
          courseId: student.courseId,
          trainingSystemId: student.trainingSystemId,
          policyObjectId: student.policyObjectId,
          status: newStatus,
        };
        await saveStudent(updatedStudent);
      }
    }
    
    await refreshStudent();
  };

  if (!student) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Đang tải hồ sơ sinh viên...
      </div>
    );
  }

  const canEdit = user?.role !== "academic_officer";

  return (
    <div className="space-y-6">
      <Link
        to={student ? `/class/${encodeURIComponent(student.className)}` : "/students"}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại danh sách lớp
      </Link>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Student Info */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Hồ sơ chi tiết</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{student.fullName}</h2>
              <p className="mt-2 text-slate-600">
                {student.studentCode} • {student.className} • {student.majorName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(student.status)}`}
              >
                {formatStatus(student.status)}
              </span>
              {canEdit && catalogs && (
                <button
                  type="button"
                  onClick={() => setStudentEditorOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Sửa
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["Ngày sinh", formatDate(student.dateOfBirth)],
              ["Giới tính", student.gender ?? "Chưa cập nhật"],
              ["Số điện thoại", student.phone ?? "Chưa cập nhật"],
              ["Email", student.email ?? "Chưa cập nhật"],
              ["Địa chỉ", student.address ?? "Chưa cập nhật"],
              ["Hệ đào tạo", student.trainingSystemName],
              ["Khóa học", student.courseName],
              ["Đối tượng", student.policyObjectName ?? "Không có"],
            ].map(([label, value]) => (
              <div key={label} className={`rounded-2xl bg-slate-50 p-4 ${label === "Email" ? "md:col-span-2" : ""}`}>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-2 text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Nghiệp vụ liên quan</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">Lịch sử sự kiện</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Tất cả loại sự kiện</option>
                {Object.entries(eventLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
                >
                  <Plus className="h-4 w-4" />
                  Thêm sự kiện
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {(() => {
              const filteredEvents = eventTypeFilter
                ? student.events.filter(event => event.type === eventTypeFilter)
                : student.events;

              return filteredEvents.length ? (
                filteredEvents.map((event) => {
                  const colors = eventTypeColors[event.type] || { bg: "bg-slate-100", text: "text-slate-700" };
                  const meta = readEventMetadata(event.metadataJson);
                  const effectiveTo = meta.effectiveDateTo;
                  const semester = meta.semester === "1" || meta.semester === "2" ? meta.semester : undefined;
                  return (
                    <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-slate-900">{event.title}</h4>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                              {eventLabels[event.type]}
                            </span>
                            {semester && (
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                                HK{semester}
                              </span>
                            )}
                          </div>
                          {event.effectiveDate && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4" />
                              {effectiveTo
                                ? `Ngày hiệu lực: từ ${formatDate(event.effectiveDate)} đến ${formatDate(effectiveTo)}`
                                : `Ngày hiệu lực: ${formatDate(event.effectiveDate)}`}
                            </div>
                          )}
                          {event.decisionNumber && (
                            <p className="mt-1 text-sm text-slate-600">Quyết định: {event.decisionNumber}</p>
                          )}
                          {event.note && <p className="mt-3 text-sm text-slate-700 leading-relaxed">{event.note}</p>}
                        </div>
                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setModalOpen(true);
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
                                  void deleteStudentEvent(event.id, student.id).then(refreshStudent);
                                }
                              }}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-slate-500">Chưa có nghiệp vụ phát sinh cho sinh viên này.</p>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      <StudentEventModal
        open={modalOpen}
        studentId={student.id}
        initialValue={editingEvent}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEventSubmit}
      />

      {catalogs && (
        <StudentEditorModal
          open={studentEditorOpen}
          catalogs={catalogs}
          initialValue={student}
          onClose={() => setStudentEditorOpen(false)}
          onSubmit={async (payload) => {
            await saveStudent(payload);
            await refreshStudent();
            setStudentEditorOpen(false);
          }}
        />
      )}
    </div>
  );
}
