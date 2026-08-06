import type {
  AppBootstrap,
  BackupRecord,
  DesktopApi,
  CreateClassInput,
  CreateUserInput,
  ImportResult,
  RegisterTenantInput,
  SearchFilters,
  StudentDetail,
  StudentEvent,
  StudentEventFormInput,
  StudentFormInput,
  StudentSummary,
  UserAccount,
  UserRole,
} from "@/types";
import {
  buildDashboard,
  buildReportSummaries,
  buildStudentDetail,
  createBootstrap,
  filterStudents,
  sampleEvents,
  sampleStudents,
  upsertStudentLocal,
  upsertEventLocal,
} from "@/utils/appData";

declare global {
  interface Window {
    desktopAPI?: DesktopApi;
  }
}

const STORAGE_KEY = "student-manager-local-data";

interface LocalState {
  user: AppBootstrap["user"];
  students: StudentSummary[];
  backups: BackupRecord[];
  events: StudentEvent[];
  users: UserAccount[];
  credentials: Record<string, string>;
}

function readState(): LocalState {
  if (typeof window === "undefined") {
    return {
      user: createBootstrap().user,
      students: sampleStudents,
      backups: createBootstrap().backups,
      events: sampleEvents,
      users: [
        {
          id: "u1",
          tenantId: "t-default",
          username: "admin",
          fullName: "Quan tri demo",
          role: "admin" as const,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      credentials: {
        admin: "admin123",
      },
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = {
      user: createBootstrap().user,
      students: sampleStudents,
      backups: createBootstrap().backups,
      events: sampleEvents,
      users: [
        {
          id: "u1",
          tenantId: "t-default",
          username: "admin",
          fullName: "Quan tri demo",
          role: "admin" as const,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "u2",
          tenantId: "t-default",
          username: "ctsv",
          fullName: "Can bo cong tac sinh vien",
          role: "affairs_officer" as const,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "u3",
          tenantId: "t-default",
          username: "gv",
          fullName: "Tai khoan chi xem",
          role: "academic_officer" as const,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      credentials: {
        admin: "admin123",
        ctsv: "123456",
        gv: "123456",
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw);
  return {
    ...parsed,
    events: parsed.events || sampleEvents,
    users: parsed.users || [],
  } as LocalState;
}

function writeState(state: LocalState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

const browserFallbackApi: DesktopApi = {
  async bootstrap(): Promise<AppBootstrap> {
    const state = readState();
    return {
      user: state.user,
      students: state.students,
      backups: state.backups,
      catalogs: createBootstrap().catalogs,
      dashboard: buildDashboard(state.students, state.events),
      reportSummaries: buildReportSummaries(state.students, state.events),
    };
  },

  async login(username: string, password: string) {
    // TODO(dev-only): Che do browser fallback nay KHONG kiem tra password.
    // Chi dung cho phat trien, production phai qua Electron (window.desktopAPI).
    void password;
    const state = readState();
    const matched = state.users.find((item) => item.username === username && item.isActive);
    if (!matched) {
      throw new Error("Sai tài khoản hoặc mật khẩu");
    }
    const user = {
      id: matched.id,
      tenantId: matched.tenantId,
      username: matched.username,
      fullName: matched.fullName,
      role: matched.role as UserRole,
    };
    writeState({ ...state, user });
    return user;
  },

  async createClass(_payload: CreateClassInput) {
    void _payload;
    throw new Error("Chức năng này chỉ hỗ trợ trong bản Desktop (Electron)");
  },

  async deleteClass(classId: string) {
    const state = readState();
    if (!state.user) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }
    const catalogs = createBootstrap().catalogs;
    const classes = catalogs.classes.filter((item) => item.id !== classId);
    const sampleStudentsLocal = state.students;
    const hasStudents = sampleStudentsLocal.some((student) => student.classId === classId);
    if (hasStudents) {
      throw new Error("Không thể xóa lớp này vì vẫn còn sinh viên trong lớp");
    }
    const nextStudents = sampleStudentsLocal.map((student) => {
      if (student.classId === classId) {
        return { ...student, classId: classes[0]?.id ?? "", className: classes[0]?.name ?? "" };
      }
      return student;
    });
    const nextCatalogs = { ...catalogs, classes };
    void nextCatalogs;
    writeState({ ...state, students: nextStudents });
  },

  async register(payload: RegisterTenantInput) {
    const state = readState();
    const now = new Date().toISOString();
    if (state.users.some((user) => user.username === payload.username)) {
      throw new Error("Tên tài khoản đã tồn tại");
    }
    const nextUser: AppBootstrap["user"] = {
      id: `u-${Date.now()}`,
      tenantId: `t-${Date.now()}`,
      username: payload.username,
      fullName: payload.fullName,
      role: "admin",
    };
    const nextUsers: UserAccount[] = [
      {
        id: nextUser.id,
        tenantId: nextUser.tenantId,
        username: nextUser.username,
        fullName: nextUser.fullName,
        role: "admin",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      ...state.users,
    ];
    writeState({ ...state, user: nextUser, users: nextUsers });
    return nextUser;
  },

  async logout() {
    const state = readState();
    writeState({ ...state, user: null });
  },

  async getStudentById(studentId: string): Promise<StudentDetail | null> {
    const state = readState();
    return buildStudentDetail(studentId, state.students, state.events);
  },

  async saveStudent(payload: StudentFormInput): Promise<StudentDetail> {
    const state = readState();
    const nextStudent = upsertStudentLocal(state.students, createBootstrap().catalogs, payload);
    const nextStudents = state.students.some((item) => item.id === nextStudent.id)
      ? state.students.map((item) => (item.id === nextStudent.id ? nextStudent : item))
      : [nextStudent, ...state.students];

    writeState({ ...state, students: nextStudents });
    return {
      ...nextStudent,
      events: state.events.filter((item) => item.studentId === nextStudent.id),
    };
  },

  async deleteStudent(studentId: string) {
    const state = readState();
    const nextStudents = state.students.filter((item) => item.id !== studentId);
    const nextEvents = state.events.filter((item) => item.studentId !== studentId);
    writeState({ ...state, students: nextStudents, events: nextEvents });
  },

  async searchStudents(filters: SearchFilters) {
    const state = readState();
    return filterStudents(state.students, state.events, filters);
  },

  async saveStudentEvent(payload: StudentEventFormInput): Promise<StudentEvent> {
    const state = readState();
    const nextEvent = upsertEventLocal(state.events, payload);
    const nextEvents = state.events.some((item) => item.id === nextEvent.id)
      ? state.events.map((item) => (item.id === nextEvent.id ? nextEvent : item))
      : [nextEvent, ...state.events];

    writeState({ ...state, events: nextEvents });
    return nextEvent;
  },

  async deleteStudentEvent(eventId: string, _studentId: string) {
    void _studentId;
    const state = readState();
    const nextEvents = state.events.filter((item) => item.id !== eventId);
    writeState({ ...state, events: nextEvents });
  },

  async exportReport(kind: "excel" | "pdf") {
    return {
      filePath: `C:/Downloads/bao-cao-sinh-vien-demo.${kind === "excel" ? "xlsx" : "pdf"}`,
    };
  },

  async importStudents(rows: Partial<StudentFormInput>[]): Promise<ImportResult> {
    const state = readState();
    let added = 0;
    let updated = 0;
    let nextStudents = [...state.students];

    rows.forEach((row, index) => {
      if (!row.studentCode || !row.fullName) {
        return;
      }

      const payload: StudentFormInput = {
        id: nextStudents.find((item) => item.studentCode === row.studentCode)?.id,
        studentCode: row.studentCode,
        fullName: row.fullName,
        dateOfBirth: row.dateOfBirth,
        gender: row.gender ?? "Khac",
        phone: row.phone,
        email: row.email,
        address: row.address,
        facultyId: row.facultyId ?? "f1",
        majorId: row.majorId ?? "m1",
        classId: row.classId ?? "c1",
        courseId: row.courseId ?? "k2",
        trainingSystemId: row.trainingSystemId ?? "t1",
        policyObjectId: row.policyObjectId,
        status: row.status ?? "dang_hoc",
      };

      const nextStudent = upsertStudentLocal(nextStudents, createBootstrap().catalogs, payload);
      const exists = nextStudents.some((item) => item.id === nextStudent.id || item.studentCode === payload.studentCode);
      nextStudents = exists
        ? nextStudents.map((item) => (item.studentCode === payload.studentCode ? nextStudent : item))
        : [{ ...nextStudent, id: nextStudent.id || `import-${index}` }, ...nextStudents];

      if (exists) {
        updated += 1;
      } else {
        added += 1;
      }
    });

    writeState({ ...state, students: nextStudents });
    return { added, updated };
  },

  async createBackup() {
    const state = readState();
    const filePath = `C:/Users/Admin/Documents/QuanLySinhVien/backups/backup-${Date.now()}.db`;
    const backup: BackupRecord = {
      id: `backup-${Date.now()}`,
      filePath,
      createdAt: new Date().toISOString(),
      createdBy: state.user?.fullName ?? "He thong demo",
    };
    writeState({ ...state, backups: [backup, ...state.backups] });
    return { filePath };
  },

  async listUsers() {
    const state = readState();
    if (!state.user) {
      return [];
    }
    return state.users.filter((user) => user.tenantId === state.user?.tenantId);
  },

  async createUser(payload: CreateUserInput) {
    const state = readState();
    const now = new Date().toISOString();
    if (!state.user) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }
    if (state.users.some((user) => user.username === payload.username)) {
      throw new Error("Tên tài khoản đã tồn tại");
    }
    const nextUser: UserAccount = {
      id: `u-${Date.now()}`,
      tenantId: state.user.tenantId,
      username: payload.username,
      fullName: payload.fullName,
      role: payload.role,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    const nextUsers = [nextUser, ...state.users];
    writeState({ ...state, users: nextUsers });
    return nextUser;
  },

  async updateUserRole(userId: string, role: UserRole) {
    const state = readState();
    const now = new Date().toISOString();
    if (!state.user) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }
    const nextUsers = state.users.map((user) => (user.id === userId ? { ...user, role, updatedAt: now } : user));
    const updated = nextUsers.find((user) => user.id === userId);
    if (!updated) {
      throw new Error("Không tìm thấy tài khoản");
    }
    writeState({ ...state, users: nextUsers });
    return updated;
  },

  async updateUserActive(userId: string, isActive: boolean) {
    const state = readState();
    const now = new Date().toISOString();
    if (!state.user) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }
    const nextUsers = state.users.map((user) => (user.id === userId ? { ...user, isActive, updatedAt: now } : user));
    const updated = nextUsers.find((user) => user.id === userId);
    if (!updated) {
      throw new Error("Không tìm thấy tài khoản");
    }
    writeState({ ...state, users: nextUsers });
    return updated;
  },
};

export const desktopApi = window.desktopAPI ?? browserFallbackApi;
