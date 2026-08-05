import type {
  AppBootstrap,
  Catalogs,
  DashboardData,
  ReportSummary,
  SearchFilters,
  StudentDetail,
  StudentEvent,
  StudentEventFormInput,
  StudentFormInput,
  StudentSummary,
} from "@/types";

const now = "2026-07-21T09:00:00.000Z";

export const sampleCatalogs: Catalogs = {
  faculties: [
    { id: "f1", name: "Khoa Công nghệ thông tin" },
    { id: "f2", name: "Khoa Kinh tế" },
    { id: "f3", name: "Khoa Ngoại ngữ" },
  ],
  majors: [
    { id: "m1", name: "Kỹ thuật phần mềm" },
    { id: "m2", name: "Hệ thống thông tin" },
    { id: "m3", name: "Quản trị kinh doanh" },
    { id: "m4", name: "Ngôn ngữ Anh" },
  ],
  classes: [
    { id: "c1", name: "KTPM 2023 A" },
    { id: "c2", name: "HTTT 2022 B" },
    { id: "c3", name: "QTKD 2023 A" },
    { id: "c4", name: "NNA 2024 A" },
  ],
  courses: [
    { id: "k1", name: "Khóa 2022", code: "K22" },
    { id: "k2", name: "Khóa 2023", code: "K23" },
    { id: "k3", name: "Khóa 2024", code: "K24" },
  ],
  trainingSystems: [
    { id: "t1", name: "Chính quy" },
    { id: "t2", name: "Chất lượng cao" },
  ],
  policyObjects: [
    { id: "p1", name: "Đối tượng chính sách" },
    { id: "p2", name: "Hộ nghèo cận nghèo" },
    { id: "p3", name: "Sinh viên quốc tế" },
  ],
};

export const sampleStudents: StudentSummary[] = [
  {
    id: "s1",
    studentCode: "SV23001",
    fullName: "Nguyễn Minh Anh",
    dateOfBirth: "2005-03-15",
    gender: "Nam",
    phone: "0909001001",
    email: "minhanh@demo.edu.vn",
    address: "Đà Nẵng",
    facultyId: "f1",
    facultyName: "Khoa Công nghệ thông tin",
    majorId: "m1",
    majorName: "Kỹ thuật phần mềm",
    classId: "c1",
    className: "KTPM 2023 A",
    courseId: "k2",
    courseName: "Khóa 2023",
    trainingSystemId: "t1",
    trainingSystemName: "Chính quy",
    policyObjectId: "p1",
    policyObjectName: "Đối tượng chính sách",
    status: "dang_hoc",
    updatedAt: now,
  },
  {
    id: "s2",
    studentCode: "SV23002",
    fullName: "Trần Hoài Thương",
    dateOfBirth: "2005-07-19",
    gender: "Nữ",
    phone: "0909001002",
    email: "hoaithuong@demo.edu.vn",
    address: "Huế",
    facultyId: "f1",
    facultyName: "Khoa Công nghệ thông tin",
    majorId: "m2",
    majorName: "Hệ thống thông tin",
    classId: "c2",
    className: "HTTT 2022 B",
    courseId: "k1",
    courseName: "Khóa 2022",
    trainingSystemId: "t2",
    trainingSystemName: "Chất lượng cao",
    status: "dang_hoc",
    updatedAt: now,
  },
  {
    id: "s3",
    studentCode: "SV23003",
    fullName: "Lê Gia Hân",
    dateOfBirth: "2004-11-08",
    gender: "Nữ",
    phone: "0909001003",
    email: "giahan@demo.edu.vn",
    address: "Quảng Nam",
    facultyId: "f2",
    facultyName: "Khoa Kinh tế",
    majorId: "m3",
    majorName: "Quản trị kinh doanh",
    classId: "c3",
    className: "QTKD 2023 A",
    courseId: "k2",
    courseName: "Khóa 2023",
    trainingSystemId: "t1",
    trainingSystemName: "Chính quy",
    policyObjectId: "p2",
    policyObjectName: "Hộ nghèo cận nghèo",
    status: "bao_luu",
    updatedAt: now,
  },
  {
    id: "s4",
    studentCode: "SV24001",
    fullName: "Phạm Tuấn Kiệt",
    dateOfBirth: "2006-02-12",
    gender: "Nam",
    phone: "0909001004",
    email: "tuankiet@demo.edu.vn",
    address: "Quảng Trị",
    facultyId: "f3",
    facultyName: "Khoa Ngoại ngữ",
    majorId: "m4",
    majorName: "Ngôn ngữ Anh",
    classId: "c4",
    className: "NNA 2024 A",
    courseId: "k3",
    courseName: "Khóa 2024",
    trainingSystemId: "t1",
    trainingSystemName: "Chính quy",
    policyObjectId: "p3",
    policyObjectName: "Sinh viên quốc tế",
    status: "dang_hoc",
    updatedAt: now,
  },
  {
    id: "s5",
    studentCode: "SV22011",
    fullName: "Võ Bảo Ngọc",
    dateOfBirth: "2004-01-28",
    gender: "Nữ",
    phone: "0909001005",
    email: "baongoc@demo.edu.vn",
    address: "Gia Lai",
    facultyId: "f1",
    facultyName: "Khoa Công nghệ thông tin",
    majorId: "m1",
    majorName: "Kỹ thuật phần mềm",
    classId: "c1",
    className: "KTPM 2023 A",
    courseId: "k1",
    courseName: "Khóa 2022",
    trainingSystemId: "t1",
    trainingSystemName: "Chính quy",
    status: "tot_nghiep",
    updatedAt: now,
  },
];

export const sampleEvents: StudentEvent[] = [
  { id: "e1", studentId: "s1", type: "hoc_bong", title: "Học bổng khuyến khích học tập", effectiveDate: "2026-03-20" },
  { id: "e2", studentId: "s1", type: "ren_luyen", title: "Điểm rèn luyện 92", effectiveDate: "2026-05-30" },
  { id: "e3", studentId: "s2", type: "lam_them", title: "Đăng ký làm thêm tại phòng lab", effectiveDate: "2026-04-02" },
  { id: "e4", studentId: "s3", type: "bien_dong", title: "Bảo lưu 1 học kỳ", effectiveDate: "2026-01-11" },
  { id: "e5", studentId: "s4", type: "khen_thuong", title: "Sinh viên quốc tế tích cực", effectiveDate: "2026-05-10" },
  { id: "e6", studentId: "s5", type: "tot_nghiep", title: "Hoàn thành tốt nghiệp xếp loại Giỏi", effectiveDate: "2026-06-18" },
];

export function buildDashboard(students: StudentSummary[], events: StudentEvent[]): DashboardData {
  const statusMap = [
    { label: "Đang học", key: "dang_hoc", accent: "text-emerald-300" },
    { label: "Bảo lưu", key: "bao_luu", accent: "text-amber-300" },
    { label: "Tốt nghiệp", key: "tot_nghiep", accent: "text-cyan-300" },
  ] as const;

  const stats = [
    { label: "Tổng sinh viên", value: students.length, accent: "text-white" },
    {
      label: "Học bổng và khen thưởng",
      value: events.filter((item) => item.type === "hoc_bong" || item.type === "khen_thuong").length,
      accent: "text-teal-300",
    },
    {
      label: "Hồ sơ cần xử lý",
      value: students.filter((item) => item.status === "bao_luu" || item.status === "tam_ngung").length,
      accent: "text-amber-300",
    },
    {
      label: "Báo cáo khả dụng",
      value: 14,
      accent: "text-fuchsia-300",
    },
  ];

  return {
    stats,
    recentStudents: [...students].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4),
    alerts: [
      {
        id: "a1",
        title: "Đồng bộ hồ sơ mới",
        description: "2 sinh viên vừa cập nhật thông tin học bổng và rèn luyện trong tháng này.",
        tone: "success",
      },
      {
        id: "a2",
        title: "Cần rà soát bảo lưu",
        description: `${students.filter((item) => item.status === "bao_luu").length} hồ sơ đang ở trạng thái bảo lưu cần kiểm tra lại.`,
        tone: "warning",
      },
      {
        id: "a3",
        title: "Sao lưu dữ liệu",
        description: "Nên tạo bản sao lưu mới trước khi nhập dữ liệu Excel số lượng lớn.",
        tone: "info",
      },
    ],
    statusBreakdown: statusMap.map((item) => ({
      label: item.label,
      value: students.filter((student) => student.status === item.key).length,
    })),
  };
}

export function buildReportSummaries(students: StudentSummary[], events: StudentEvent[]): ReportSummary[] {
  return [
    {
      title: "Sinh viên theo khóa",
      value: new Set(students.map((item) => item.courseId)).size,
      subtitle: "Tổng hợp dữ liệu theo niên khóa và lớp học",
    },
    {
      title: "Sinh viên được học bổng",
      value: events.filter((item) => item.type === "hoc_bong").length,
      subtitle: "Theo quyết định học bổng hiện hành",
    },
    {
      title: "Hồ sơ tốt nghiệp",
      value: students.filter((item) => item.status === "tot_nghiep").length,
      subtitle: "Sẵn sàng xuất file tổng hợp và đối soát",
    },
  ];
}

export function filterStudents(students: StudentSummary[], events: StudentEvent[], filters: SearchFilters): StudentSummary[] {
  const keyword = filters.keyword?.trim().toLowerCase();

  return students.filter((student) => {
    const matchKeyword =
      !keyword ||
      [student.studentCode, student.fullName, student.className, student.majorName, student.courseName]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    const matchEvent =
      !filters.eventType ||
      events.some((event) => event.studentId === student.id && event.type === filters.eventType);

    return (
      matchKeyword &&
      (!filters.classId || student.classId === filters.classId) &&
      (!filters.courseId || student.courseId === filters.courseId) &&
      (!filters.majorId || student.majorId === filters.majorId) &&
      (!filters.trainingSystemId || student.trainingSystemId === filters.trainingSystemId) &&
      (!filters.status || student.status === filters.status) &&
      (!filters.policyObjectId || student.policyObjectId === filters.policyObjectId) &&
      matchEvent
    );
  });
}

export function buildStudentDetail(studentId: string, students: StudentSummary[], events: StudentEvent[]): StudentDetail | null {
  const student = students.find((item) => item.id === studentId);
  if (!student) {
    return null;
  }

  return {
    ...student,
    events: events.filter((item) => item.studentId === studentId),
  };
}

export function upsertStudentLocal(students: StudentSummary[], catalogs: Catalogs, payload: StudentFormInput): StudentSummary {
  const facultyName = catalogs.faculties.find((item) => item.id === payload.facultyId)?.name ?? "";
  const majorName = catalogs.majors.find((item) => item.id === payload.majorId)?.name ?? "";
  const className = catalogs.classes.find((item) => item.id === payload.classId)?.name ?? "";
  const courseName = catalogs.courses.find((item) => item.id === payload.courseId)?.name ?? "";
  const trainingSystemName = catalogs.trainingSystems.find((item) => item.id === payload.trainingSystemId)?.name ?? "";
  const policyObjectName = catalogs.policyObjects.find((item) => item.id === payload.policyObjectId)?.name;

  return {
    id: payload.id ?? `local-${payload.studentCode}`,
    studentCode: payload.studentCode,
    fullName: payload.fullName,
    dateOfBirth: payload.dateOfBirth,
    gender: payload.gender,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    facultyId: payload.facultyId,
    facultyName,
    majorId: payload.majorId,
    majorName,
    classId: payload.classId,
    className,
    courseId: payload.courseId,
    courseName,
    trainingSystemId: payload.trainingSystemId,
    trainingSystemName,
    policyObjectId: payload.policyObjectId,
    policyObjectName,
    status: payload.status,
    updatedAt: new Date().toISOString(),
  };
}

export function createBootstrap(userName = "Quản trị viên"): AppBootstrap {
  return {
    user: {
      id: "u1",
      tenantId: "t-default",
      username: "admin",
      fullName: userName,
      role: "admin",
    },
    dashboard: buildDashboard(sampleStudents, sampleEvents),
    students: sampleStudents,
    catalogs: sampleCatalogs,
    backups: [
      {
        id: "b1",
        filePath: "C:/Users/Admin/Documents/QuanLySinhVien/backups/backup-demo.db",
        createdAt: now,
        createdBy: "Quản trị viên",
      },
    ],
    reportSummaries: buildReportSummaries(sampleStudents, sampleEvents),
  };
}

export function upsertEventLocal(events: StudentEvent[], payload: StudentEventFormInput): StudentEvent {
  const eventId = payload.id ?? `evt-${Date.now()}`;
  return {
    id: eventId,
    studentId: payload.studentId,
    type: payload.type,
    title: payload.title,
    decisionNumber: payload.decisionNumber,
    effectiveDate: payload.effectiveDate,
    note: payload.note,
    metadataJson: payload.metadataJson,
  };
}
