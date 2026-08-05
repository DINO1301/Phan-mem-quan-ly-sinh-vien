export type UserRole = "admin" | "affairs_officer" | "academic_officer";

export type StudentStatus =
  | "dang_hoc"
  | "bao_luu"
  | "tam_ngung"
  | "tot_nghiep"
  | "thoi_hoc";

export type StudentEventType =
  | "hoc_bong"
  | "khen_thuong"
  | "ky_luat"
  | "vay_von"
  | "bien_dong"
  | "noi_ngoai_tru"
  | "lam_them"
  | "hoc_tap"
  | "ren_luyen"
  | "tot_nghiep";

export interface AppUser {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface UserAccount {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  isActive?: boolean;
}

export interface RegisterTenantInput {
  tenantName: string;
  username: string;
  password: string;
  fullName: string;
}

export interface CreateClassInput {
  name: string;
  code: string;
  majorId: string;
  courseId: string;
}

export interface CatalogOption {
  id: string;
  name: string;
  code?: string;
}

export interface Catalogs {
  faculties: CatalogOption[];
  majors: CatalogOption[];
  classes: CatalogOption[];
  courses: CatalogOption[];
  trainingSystems: CatalogOption[];
  policyObjects: CatalogOption[];
}

export interface StudentSummary {
  id: string;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  facultyId: string;
  facultyName: string;
  majorId: string;
  majorName: string;
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  trainingSystemId: string;
  trainingSystemName: string;
  policyObjectId?: string;
  policyObjectName?: string;
  status: StudentStatus;
  updatedAt: string;
}

export interface StudentEvent {
  id: string;
  studentId: string;
  type: StudentEventType;
  title: string;
  decisionNumber?: string;
  effectiveDate?: string;
  note?: string;
  metadataJson?: string;
}

export interface StudentDetail extends StudentSummary {
  events: StudentEvent[];
}

export interface DashboardStat {
  label: string;
  value: number;
  accent: string;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  tone: "info" | "warning" | "success";
}

export interface DashboardData {
  stats: DashboardStat[];
  recentStudents: StudentSummary[];
  alerts: DashboardAlert[];
  statusBreakdown: Array<{ label: string; value: number }>;
}

export interface ReportSummary {
  title: string;
  value: number;
  subtitle: string;
}

export interface BackupRecord {
  id: string;
  filePath: string;
  createdAt: string;
  createdBy: string;
}

export interface SearchFilters {
  keyword?: string;
  classId?: string;
  courseId?: string;
  majorId?: string;
  trainingSystemId?: string;
  status?: StudentStatus | "";
  policyObjectId?: string;
  eventType?: StudentEventType | "";
}

export interface StudentFormInput {
  id?: string;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  facultyId: string;
  majorId: string;
  classId: string;
  courseId: string;
  trainingSystemId: string;
  policyObjectId?: string;
  status: StudentStatus;
}

export interface AppBootstrap {
  user: AppUser | null;
  dashboard: DashboardData;
  students: StudentSummary[];
  catalogs: Catalogs;
  backups: BackupRecord[];
  reportSummaries: ReportSummary[];
}

export interface ImportResult {
  added: number;
  updated: number;
}

export interface StudentEventFormInput {
  id?: string;
  studentId: string;
  type: StudentEventType;
  title: string;
  decisionNumber?: string;
  effectiveDate?: string;
  note?: string;
  metadataJson?: string;
}

export interface DesktopApi {
  bootstrap: () => Promise<AppBootstrap>;
  login: (username: string, password: string) => Promise<AppUser>;
  register: (payload: RegisterTenantInput) => Promise<AppUser>;
  logout: () => Promise<void>;
  createClass: (payload: CreateClassInput) => Promise<CatalogOption>;
  getStudentById: (studentId: string) => Promise<StudentDetail | null>;
  saveStudent: (payload: StudentFormInput) => Promise<StudentDetail>;
  deleteStudent: (studentId: string) => Promise<void>;
  searchStudents: (filters: SearchFilters) => Promise<StudentSummary[]>;
  exportReport: (kind: "excel" | "pdf") => Promise<{ filePath: string }>;
  importStudents: (rows: Partial<StudentFormInput>[]) => Promise<ImportResult>;
  createBackup: () => Promise<{ filePath: string }>;
  saveStudentEvent: (payload: StudentEventFormInput) => Promise<StudentEvent>;
  deleteStudentEvent: (eventId: string, studentId: string) => Promise<void>;
  listUsers: () => Promise<UserAccount[]>;
  createUser: (payload: CreateUserInput) => Promise<UserAccount>;
  updateUserRole: (userId: string, role: UserRole) => Promise<UserAccount>;
  updateUserActive: (userId: string, isActive: boolean) => Promise<UserAccount>;
}
