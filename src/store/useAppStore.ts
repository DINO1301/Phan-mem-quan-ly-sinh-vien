import { create } from "zustand";
import { desktopApi } from "@/lib/desktopApi";
import type {
  AppBootstrap,
  AppUser,
  Catalogs,
  DashboardData,
  ReportSummary,
  SearchFilters,
  StudentDetail,
  StudentEventFormInput,
  StudentFormInput,
  StudentSummary,
  CreateUserInput,
  CreateClassInput,
  RegisterTenantInput,
  UserAccount,
  UserRole,
} from "@/types";

interface AppState {
  ready: boolean;
  loading: boolean;
  user: AppUser | null;
  dashboard: DashboardData | null;
  students: StudentSummary[];
  catalogs: Catalogs | null;
  backups: AppBootstrap["backups"];
  reportSummaries: ReportSummary[];
  users: UserAccount[];
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterTenantInput) => Promise<void>;
  logout: () => Promise<void>;
  getStudentById: (studentId: string) => Promise<StudentDetail | null>;
  saveStudent: (payload: StudentFormInput) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  searchStudents: (filters: SearchFilters) => Promise<StudentSummary[]>;
  importStudents: (rows: Partial<StudentFormInput>[]) => Promise<{ added: number; updated: number }>;
  exportReport: (kind: "excel" | "pdf") => Promise<string>;
  createBackup: () => Promise<string>;
  createClass: (payload: CreateClassInput) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  saveStudentEvent: (payload: StudentEventFormInput) => Promise<void>;
  deleteStudentEvent: (eventId: string, studentId: string) => Promise<void>;
  loadUsers: () => Promise<void>;
  createUser: (payload: CreateUserInput) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserActive: (userId: string, isActive: boolean) => Promise<void>;
}

function applyBootstrap(state: AppState, payload: AppBootstrap): Partial<AppState> {
  return {
    ...state,
    ready: true,
    loading: false,
    user: payload.user,
    dashboard: payload.dashboard,
    students: payload.students,
    catalogs: payload.catalogs,
    backups: payload.backups,
    reportSummaries: payload.reportSummaries,
  };
}

export const useAppStore = create<AppState>((set) => ({
  ready: false,
  loading: false,
  user: null,
  dashboard: null,
  students: [],
  catalogs: null,
  backups: [],
  reportSummaries: [],
  users: [],

  bootstrap: async () => {
    set({ loading: true });
    const payload = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, payload));
  },

  login: async (username, password) => {
    set({ loading: true });
    await desktopApi.login(username, password);
    const payload = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, payload));
  },

  register: async (payload) => {
    set({ loading: true });
    await desktopApi.register(payload);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
  },

  logout: async () => {
    await desktopApi.logout();
    const payload = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, payload));
  },

  getStudentById: (studentId) => desktopApi.getStudentById(studentId),

  saveStudent: async (payload) => {
    await desktopApi.saveStudent(payload);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
  },

  deleteStudent: async (studentId) => {
    await desktopApi.deleteStudent(studentId);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
  },

  searchStudents: (filters) => desktopApi.searchStudents(filters),

  importStudents: async (rows) => {
    const result = await desktopApi.importStudents(rows);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
    return result;
  },

  exportReport: async (kind) => {
    const result = await desktopApi.exportReport(kind);
    return result.filePath;
  },

  createBackup: async () => {
    const result = await desktopApi.createBackup();
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
    return result.filePath;
  },

  createClass: async (payload) => {
    await desktopApi.createClass(payload);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
  },

  deleteClass: async (classId) => {
    await desktopApi.deleteClass(classId);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
  },

  saveStudentEvent: async (payload) => {
    await desktopApi.saveStudentEvent(payload);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
  },

  deleteStudentEvent: async (eventId, studentId) => {
    await desktopApi.deleteStudentEvent(eventId, studentId);
    const refreshed = await desktopApi.bootstrap();
    set((state) => applyBootstrap(state, refreshed));
  },

  loadUsers: async () => {
    const users = await desktopApi.listUsers();
    set({ users });
  },

  createUser: async (payload) => {
    await desktopApi.createUser(payload);
    const users = await desktopApi.listUsers();
    set({ users });
  },

  updateUserRole: async (userId, role) => {
    await desktopApi.updateUserRole(userId, role);
    const users = await desktopApi.listUsers();
    set({ users });
  },

  updateUserActive: async (userId, isActive) => {
    await desktopApi.updateUserActive(userId, isActive);
    const users = await desktopApi.listUsers();
    set({ users });
  },
}));
