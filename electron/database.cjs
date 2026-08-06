const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const DEFAULT_TENANT_ID = "t-default";

function hashPassword(password) {
  // TODO(security): Thay SHA256 khong salt bang bcrypt/argon2 de bao mat mat khau hon
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createDatabaseManager(app) {
  const candidates = [
    path.join(app.getPath("userData"), "data"),
    path.join(app.getPath("documents"), "QuanLySinhVien", "data"),
    path.join(app.getPath("temp"), "QuanLySinhVien", "data"),
  ];

  let db = null;
  let dbPath = null;
  let lastError = null;

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      const nextPath = path.join(dir, "student-manager.db");
      const nextDb = new Database(nextPath);
      nextDb.pragma("journal_mode = WAL");
      nextDb.pragma("foreign_keys = ON");
      db = nextDb;
      dbPath = nextPath;
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!db || !dbPath) {
    const details = candidates.map((dir) => `- ${path.join(dir, "student-manager.db")}`).join("\n");
    throw new Error(`Không thể mở CSDL.\nĐã thử:\n${details}\n\nLỗi: ${String(lastError)}`);
  }

  function runMigrations() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
      CREATE TABLE IF NOT EXISTS faculties (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
      CREATE TABLE IF NOT EXISTS majors (id TEXT PRIMARY KEY, faculty_id TEXT NOT NULL, name TEXT NOT NULL, FOREIGN KEY (faculty_id) REFERENCES faculties(id));
      CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, start_year INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY, major_id TEXT NOT NULL, course_id TEXT NOT NULL, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, FOREIGN KEY (major_id) REFERENCES majors(id), FOREIGN KEY (course_id) REFERENCES courses(id));
      CREATE TABLE IF NOT EXISTS training_systems (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
      CREATE TABLE IF NOT EXISTS policy_objects (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        student_code TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        faculty_id TEXT NOT NULL,
        major_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        training_system_id TEXT NOT NULL,
        policy_object_id TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (faculty_id) REFERENCES faculties(id),
        FOREIGN KEY (major_id) REFERENCES majors(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (training_system_id) REFERENCES training_systems(id),
        FOREIGN KEY (policy_object_id) REFERENCES policy_objects(id)
      );
      CREATE TABLE IF NOT EXISTS student_events (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        decision_number TEXT,
        effective_date TEXT,
        note TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (student_id) REFERENCES students(id)
      );
      CREATE TABLE IF NOT EXISTS backups (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
    `);
  }

  function ensureTenantSupport() {
    const now = new Date().toISOString();
    const columnsFor = (table) => db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
    const addColumnIfMissing = (table, column, type) => {
      const columns = columnsFor(table);
      if (columns.includes(column)) {
        return;
      }
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    };

    db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    const defaultTenant = db.prepare("SELECT id FROM tenants WHERE id = ?").get(DEFAULT_TENANT_ID);
    if (!defaultTenant) {
      db.prepare("INSERT INTO tenants (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").run(
        DEFAULT_TENANT_ID,
        "Tenant mac dinh",
        now,
        now,
      );
    }

    ["users", "students", "student_events", "backups"].forEach((table) => {
      addColumnIfMissing(table, "tenant_id", "TEXT");
    });

    db.prepare("UPDATE users SET tenant_id = ? WHERE tenant_id IS NULL OR tenant_id = ''").run(DEFAULT_TENANT_ID);
    db.prepare("UPDATE students SET tenant_id = ? WHERE tenant_id IS NULL OR tenant_id = ''").run(DEFAULT_TENANT_ID);
    db.prepare("UPDATE backups SET tenant_id = ? WHERE tenant_id IS NULL OR tenant_id = ''").run(DEFAULT_TENANT_ID);

    const eventColumns = columnsFor("student_events");
    if (eventColumns.includes("tenant_id")) {
      db.exec(`
        UPDATE student_events
        SET tenant_id = (
          SELECT tenant_id FROM students s WHERE s.id = student_events.student_id
        )
        WHERE tenant_id IS NULL OR tenant_id = '';
      `);
      db.prepare("UPDATE student_events SET tenant_id = ? WHERE tenant_id IS NULL OR tenant_id = ''").run(DEFAULT_TENANT_ID);
    }
  }

  function seedDatabase() {
    const count = db.prepare("SELECT COUNT(*) AS total FROM users").get().total;
    if (count > 0) {
      return;
    }

    const now = new Date().toISOString();
    const insertUser = db.prepare(`
      INSERT INTO users (id, tenant_id, username, password_hash, full_name, role, created_at, updated_at)
      VALUES (@id, @tenant_id, @username, @password_hash, @full_name, @role, @created_at, @updated_at)
    `);
    const insertCatalog = (table, rows) => {
      const statement = db.prepare(`INSERT INTO ${table} (${Object.keys(rows[0]).join(", ")}) VALUES (${Object.keys(rows[0]).map((key) => `@${key}`).join(", ")})`);
      rows.forEach((row) => statement.run(row));
    };

    insertUser.run({
      id: "u1",
      tenant_id: DEFAULT_TENANT_ID,
      username: "admin",
      password_hash: hashPassword("admin123"),
      full_name: "Quan tri he thong",
      role: "admin",
      created_at: now,
      updated_at: now,
    });
    insertUser.run({
      id: "u2",
      tenant_id: DEFAULT_TENANT_ID,
      username: "ctsv",
      password_hash: hashPassword("ctsv123"),
      full_name: "Can bo cong tac sinh vien",
      role: "affairs_officer",
      created_at: now,
      updated_at: now,
    });

    insertCatalog("faculties", [
      { id: "f1", name: "Khoa Cong nghe thong tin" },
      { id: "f2", name: "Khoa Kinh te" },
      { id: "f3", name: "Khoa Ngoai ngu" },
    ]);
    insertCatalog("majors", [
      { id: "m1", faculty_id: "f1", name: "Ky thuat phan mem" },
      { id: "m2", faculty_id: "f1", name: "He thong thong tin" },
      { id: "m3", faculty_id: "f2", name: "Quan tri kinh doanh" },
      { id: "m4", faculty_id: "f3", name: "Ngon ngu Anh" },
    ]);
    insertCatalog("courses", [
      { id: "k1", code: "K22", name: "Khoa 2022", start_year: 2022 },
      { id: "k2", code: "K23", name: "Khoa 2023", start_year: 2023 },
      { id: "k3", code: "K24", name: "Khoa 2024", start_year: 2024 },
    ]);
    insertCatalog("classes", [
      { id: "c1", major_id: "m1", course_id: "k2", code: "KTPM23A", name: "KTPM 2023 A" },
      { id: "c2", major_id: "m2", course_id: "k1", code: "HTTT22B", name: "HTTT 2022 B" },
      { id: "c3", major_id: "m3", course_id: "k2", code: "QTKD23A", name: "QTKD 2023 A" },
      { id: "c4", major_id: "m4", course_id: "k3", code: "NNA24A", name: "NNA 2024 A" },
    ]);
    insertCatalog("training_systems", [
      { id: "t1", name: "Chinh quy" },
      { id: "t2", name: "Chat luong cao" },
    ]);
    insertCatalog("policy_objects", [
      { id: "p1", name: "Doi tuong chinh sach" },
      { id: "p2", name: "Ho ngheo can ngheo" },
      { id: "p3", name: "Sinh vien quoc te" },
    ]);

    const insertStudent = db.prepare(`
      INSERT INTO students (
        id, tenant_id, student_code, full_name, date_of_birth, gender, phone, email, address, faculty_id, major_id, class_id, course_id,
        training_system_id, policy_object_id, status, created_at, updated_at
      ) VALUES (
        @id, @tenant_id, @student_code, @full_name, @date_of_birth, @gender, @phone, @email, @address, @faculty_id, @major_id, @class_id, @course_id,
        @training_system_id, @policy_object_id, @status, @created_at, @updated_at
      )
    `);

    [
      ["s1", "SV23001", "Nguyen Minh Anh", "2005-03-15", "Nam", "0909001001", "minhanh@demo.edu.vn", "Da Nang", "f1", "m1", "c1", "k2", "t1", "p1", "dang_hoc"],
      ["s2", "SV23002", "Tran Hoai Thuong", "2005-07-19", "Nu", "0909001002", "hoaithuong@demo.edu.vn", "Hue", "f1", "m2", "c2", "k1", "t2", null, "dang_hoc"],
      ["s3", "SV23003", "Le Gia Han", "2004-11-08", "Nu", "0909001003", "giahan@demo.edu.vn", "Quang Nam", "f2", "m3", "c3", "k2", "t1", "p2", "bao_luu"],
      ["s4", "SV24001", "Pham Tuan Kiet", "2006-02-12", "Nam", "0909001004", "tuankiet@demo.edu.vn", "Quang Tri", "f3", "m4", "c4", "k3", "t1", "p3", "dang_hoc"],
      ["s5", "SV22011", "Vo Bao Ngoc", "2004-01-28", "Nu", "0909001005", "baongoc@demo.edu.vn", "Gia Lai", "f1", "m1", "c1", "k1", "t1", null, "tot_nghiep"],
    ].forEach((row) => {
      insertStudent.run({
        id: row[0],
        tenant_id: DEFAULT_TENANT_ID,
        student_code: row[1],
        full_name: row[2],
        date_of_birth: row[3],
        gender: row[4],
        phone: row[5],
        email: row[6],
        address: row[7],
        faculty_id: row[8],
        major_id: row[9],
        class_id: row[10],
        course_id: row[11],
        training_system_id: row[12],
        policy_object_id: row[13],
        status: row[14],
        created_at: now,
        updated_at: now,
      });
    });

    const insertEvent = db.prepare(`
      INSERT INTO student_events (id, tenant_id, student_id, type, title, effective_date, created_at, updated_at)
      VALUES (@id, @tenant_id, @student_id, @type, @title, @effective_date, @created_at, @updated_at)
    `);
    [
      ["e1", "s1", "hoc_bong", "Hoc bong khuyen khich hoc tap", "2026-03-20"],
      ["e2", "s1", "ren_luyen", "Diem ren luyen 92", "2026-05-30"],
      ["e3", "s2", "lam_them", "Dang ky lam them tai phong lab", "2026-04-02"],
      ["e4", "s3", "bien_dong", "Bao luu 1 hoc ky", "2026-01-11"],
      ["e5", "s4", "khen_thuong", "Sinh vien quoc te tich cuc", "2026-05-10"],
      ["e6", "s5", "tot_nghiep", "Hoan thanh tot nghiep xep loai Gioi", "2026-06-18"],
    ].forEach((row) => {
      insertEvent.run({
        id: row[0],
        tenant_id: DEFAULT_TENANT_ID,
        student_id: row[1],
        type: row[2],
        title: row[3],
        effective_date: row[4],
        created_at: now,
        updated_at: now,
      });
    });
  }

  function mapStudentRows(query = {}) {
    const whereParts = [];
    const params = { ...(query.params || {}) };
    if (query.tenantId) {
      whereParts.push("s.tenant_id = @tenantId");
      params.tenantId = query.tenantId;
    }
    if (query.where) {
      whereParts.push(query.where);
    }
    const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
    return db
      .prepare(`
        SELECT
          s.id,
          s.student_code AS studentCode,
          s.full_name AS fullName,
          s.date_of_birth AS dateOfBirth,
          s.gender,
          s.phone,
          s.email,
          s.address,
          s.faculty_id AS facultyId,
          f.name AS facultyName,
          s.major_id AS majorId,
          m.name AS majorName,
          s.class_id AS classId,
          c.name AS className,
          s.course_id AS courseId,
          co.name AS courseName,
          s.training_system_id AS trainingSystemId,
          ts.name AS trainingSystemName,
          s.policy_object_id AS policyObjectId,
          po.name AS policyObjectName,
          s.status,
          s.updated_at AS updatedAt
        FROM students s
        JOIN faculties f ON f.id = s.faculty_id
        JOIN majors m ON m.id = s.major_id
        JOIN classes c ON c.id = s.class_id
        JOIN courses co ON co.id = s.course_id
        JOIN training_systems ts ON ts.id = s.training_system_id
        LEFT JOIN policy_objects po ON po.id = s.policy_object_id
        ${whereClause}
        ORDER BY s.updated_at DESC
      `)
      .all(params);
  }

  function listCatalog(table) {
    // TODO(multi-tenant): Danh muc (faculties/majors/classes/courses...) hien tai la toan cuc.
    // Can them cot tenant_id va filter theo user.tenantId neu muon moi don vi co danh muc rieng.
    return db.prepare(`SELECT id, name ${table === "courses" ? ", code" : ""} FROM ${table} ORDER BY name`).all();
  }

  function createClass(payload) {
    if (!payload || !payload.name || !payload.code || !payload.majorId || !payload.courseId) {
      throw new Error("Thông tin lớp không hợp lệ");
    }
    const id = `c-${Date.now()}`;
    db.prepare("INSERT INTO classes (id, major_id, course_id, code, name) VALUES (?, ?, ?, ?, ?)").run(
      id,
      payload.majorId,
      payload.courseId,
      payload.code,
      payload.name,
    );
    return { id, name: payload.name };
  }

  function deleteClass(tenantId, classId) {
    const studentCount = db
      .prepare("SELECT COUNT(*) AS count FROM students WHERE class_id = ? AND tenant_id = ?")
      .get(classId, tenantId).count;
    if (studentCount > 0) {
      throw new Error("Không thể xóa lớp này vì vẫn còn sinh viên trong lớp");
    }
    const info = db.prepare("DELETE FROM classes WHERE id = ?").run(classId);
    if (info.changes === 0) {
      throw new Error("Không tìm thấy lớp để xóa");
    }
  }

  function bootstrap(tenantId) {
    const catalogs = {
      faculties: listCatalog("faculties"),
      majors: listCatalog("majors"),
      classes: listCatalog("classes"),
      courses: listCatalog("courses"),
      trainingSystems: listCatalog("training_systems"),
      policyObjects: listCatalog("policy_objects"),
    };

    if (!tenantId) {
      return {
        user: null,
        students: [],
        catalogs,
        backups: [],
        dashboard: {
          stats: [
            { label: "Tong sinh vien", value: 0, accent: "text-white" },
            { label: "Dang hoc", value: 0, accent: "text-emerald-300" },
            { label: "Ho so can xu ly", value: 0, accent: "text-amber-300" },
            { label: "Bao cao kha dung", value: 2, accent: "text-fuchsia-300" },
          ],
          recentStudents: [],
          alerts: [
            { id: "a1", title: "Dong bo ho so moi", description: "Du lieu cap nhat moi nhat tu SQLite noi bo.", tone: "success" },
            { id: "a2", title: "Sao luu du lieu", description: "Nen tao backup truoc khi import Excel so luong lon.", tone: "info" },
            { id: "a3", title: "Ho so tam dung", description: "0 sinh vien dang bao luu.", tone: "warning" },
          ],
          statusBreakdown: [
            { label: "Dang hoc", value: 0 },
            { label: "Bao luu", value: 0 },
            { label: "Tot nghiep", value: 0 },
          ],
        },
        reportSummaries: [
          { title: "Sinh vien theo khoa", value: 0, subtitle: "Tong hop theo nien khoa va lop hoc" },
          { title: "Sinh vien duoc hoc bong", value: 0, subtitle: "Theo quyet dinh hien hanh" },
          { title: "Ho so tot nghiep", value: 0, subtitle: "San sang doi soat va xuat file" },
        ],
      };
    }

    const students = mapStudentRows({ tenantId });
    const events = db
      .prepare(
        "SELECT id, student_id AS studentId, type, title, decision_number AS decisionNumber, effective_date AS effectiveDate, note, metadata_json AS metadataJson FROM student_events WHERE tenant_id = @tenantId",
      )
      .all({ tenantId });
    const totalActive = students.filter((student) => student.status === "dang_hoc").length;

    const distinctCourses = new Set(students.map((student) => student.courseId)).size;
    const distinctMajors = new Set(students.map((student) => student.majorId)).size;
    const distinctClasses = new Set(students.map((student) => student.classId)).size;
    const hocBongCount = events.filter((event) => event.type === "hoc_bong").length;
    const khenThuongCount = events.filter((event) => event.type === "khen_thuong").length;
    const kyLuatCount = events.filter((event) => event.type === "ky_luat").length;
    const baoLuuCount = students.filter((student) => student.status === "bao_luu").length;
    const tamNgungCount = students.filter((student) => student.status === "tam_ngung").length;
    const totNghiepCount = students.filter((student) => student.status === "tot_nghiep").length;
    const thoiHocCount = students.filter((student) => student.status === "thoi_hoc").length;
    const availableReports =
      (students.length > 0 ? 1 : 0) +
      (distinctCourses > 0 ? 1 : 0) +
      (distinctMajors > 0 ? 1 : 0) +
      (distinctClasses > 0 ? 1 : 0) +
      (hocBongCount > 0 ? 1 : 0) +
      (khenThuongCount > 0 ? 1 : 0) +
      (kyLuatCount > 0 ? 1 : 0) +
      (baoLuuCount > 0 ? 1 : 0) +
      (tamNgungCount > 0 ? 1 : 0) +
      (totNghiepCount > 0 ? 1 : 0) +
      (thoiHocCount > 0 ? 1 : 0) +
      2;

    return {
      user: null,
      students,
      catalogs,
      backups: db
        .prepare(
          "SELECT id, file_path AS filePath, created_at AS createdAt, created_by AS createdBy FROM backups WHERE tenant_id = @tenantId ORDER BY created_at DESC",
        )
        .all({ tenantId }),
      dashboard: {
        stats: [
          { label: "Tong sinh vien", value: students.length, accent: "text-white" },
          { label: "Dang hoc", value: totalActive, accent: "text-emerald-300" },
          { label: "Ho so can xu ly", value: students.filter((student) => student.status === "bao_luu" || student.status === "tam_ngung").length, accent: "text-amber-300" },
          { label: "Bao cao kha dung", value: availableReports, accent: "text-fuchsia-300" },
        ],
        recentStudents: students.slice(0, 4),
        alerts: [
          { id: "a1", title: "Dong bo ho so moi", description: "Du lieu cap nhat moi nhat tu SQLite noi bo.", tone: "success" },
          { id: "a2", title: "Sao luu du lieu", description: "Nen tao backup truoc khi import Excel so luong lon.", tone: "info" },
          { id: "a3", title: "Ho so tam dung", description: `${students.filter((student) => student.status === "bao_luu").length} sinh vien dang bao luu.`, tone: "warning" },
        ],
        statusBreakdown: [
          { label: "Dang hoc", value: students.filter((student) => student.status === "dang_hoc").length },
          { label: "Bao luu", value: students.filter((student) => student.status === "bao_luu").length },
          { label: "Tot nghiep", value: students.filter((student) => student.status === "tot_nghiep").length },
        ],
      },
      reportSummaries: [
        { title: "Sinh vien theo khoa", value: new Set(students.map((student) => student.courseId)).size, subtitle: "Tong hop theo nien khoa va lop hoc" },
        { title: "Sinh vien duoc hoc bong", value: events.filter((event) => event.type === "hoc_bong").length, subtitle: "Theo quyet dinh hien hanh" },
        { title: "Ho so tot nghiep", value: students.filter((student) => student.status === "tot_nghiep").length, subtitle: "San sang doi soat va xuat file" },
      ],
    };
  }

  function login(username, password) {
    const user = db
      .prepare(
        "SELECT id, tenant_id AS tenantId, username, full_name AS fullName, role, password_hash AS passwordHash FROM users WHERE username = ? AND is_active = 1",
      )
      .get(username);

    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error("Sai tai khoan hoac mat khau");
    }

    return { id: user.id, tenantId: user.tenantId, username: user.username, fullName: user.fullName, role: user.role };
  }

  function registerTenant(payload) {
    const now = new Date().toISOString();
    const tenantId = createId("tenant");
    const userId = createId("user");

    db.prepare("INSERT INTO tenants (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").run(
      tenantId,
      payload.tenantName,
      now,
      now,
    );

    const statement = db.prepare(`
      INSERT INTO users (id, tenant_id, username, password_hash, full_name, role, is_active, created_at, updated_at)
      VALUES (@id, @tenant_id, @username, @password_hash, @full_name, @role, @is_active, @created_at, @updated_at)
    `);

    try {
      statement.run({
        id: userId,
        tenant_id: tenantId,
        username: payload.username,
        password_hash: hashPassword(payload.password),
        full_name: payload.fullName,
        role: "admin",
        is_active: 1,
        created_at: now,
        updated_at: now,
      });
    } catch (error) {
      if (String(error).includes("UNIQUE")) {
        throw new Error("Tên tài khoản đã tồn tại");
      }
      throw error;
    }

    return { id: userId, tenantId, username: payload.username, fullName: payload.fullName, role: "admin" };
  }

  function createUser(tenantId, payload) {
    const now = new Date().toISOString();
    const userId = createId("user");
    const statement = db.prepare(`
      INSERT INTO users (id, tenant_id, username, password_hash, full_name, role, is_active, created_at, updated_at)
      VALUES (@id, @tenant_id, @username, @password_hash, @full_name, @role, @is_active, @created_at, @updated_at)
    `);

    try {
      statement.run({
        id: userId,
        tenant_id: tenantId,
        username: payload.username,
        password_hash: hashPassword(payload.password),
        full_name: payload.fullName,
        role: payload.role,
        is_active: payload.isActive ? 1 : 0,
        created_at: now,
        updated_at: now,
      });
    } catch (error) {
      if (String(error).includes("UNIQUE")) {
        throw new Error("Tên tài khoản đã tồn tại");
      }
      throw error;
    }

    return db
      .prepare(
        "SELECT id, tenant_id AS tenantId, username, full_name AS fullName, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? AND tenant_id = ?",
      )
      .get(userId, tenantId);
  }

  function listUsers(tenantId) {
    return db
      .prepare(
        "SELECT id, tenant_id AS tenantId, username, full_name AS fullName, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE tenant_id = ? ORDER BY created_at DESC",
      )
      .all(tenantId);
  }

  function updateUserRole(tenantId, userId, role) {
    const now = new Date().toISOString();
    db.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ? AND tenant_id = ?").run(role, now, userId, tenantId);
    return db
      .prepare(
        "SELECT id, tenant_id AS tenantId, username, full_name AS fullName, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? AND tenant_id = ?",
      )
      .get(userId, tenantId);
  }

  function updateUserActive(tenantId, userId, isActive) {
    const now = new Date().toISOString();
    db.prepare("UPDATE users SET is_active = ?, updated_at = ? WHERE id = ? AND tenant_id = ?").run(
      isActive ? 1 : 0,
      now,
      userId,
      tenantId,
    );
    return db
      .prepare(
        "SELECT id, tenant_id AS tenantId, username, full_name AS fullName, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? AND tenant_id = ?",
      )
      .get(userId, tenantId);
  }

  function getStudentById(tenantId, studentId) {
    const student = mapStudentRows({ tenantId, where: "s.id = @studentId", params: { studentId } })[0];
    if (!student) {
      return null;
    }

    const events = db
      .prepare(
        "SELECT id, student_id AS studentId, type, title, decision_number AS decisionNumber, effective_date AS effectiveDate, note, metadata_json AS metadataJson FROM student_events WHERE student_id = ? AND tenant_id = ? ORDER BY effective_date DESC",
      )
      .all(studentId, tenantId);

    return { ...student, events };
  }

  function saveStudent(tenantId, payload) {
    const now = new Date().toISOString();
    const existing = payload.id
      ? db.prepare("SELECT id FROM students WHERE id = ? AND tenant_id = ?").get(payload.id, tenantId)
      : db.prepare("SELECT id FROM students WHERE student_code = ? AND tenant_id = ?").get(payload.studentCode, tenantId);
    const studentId = existing ? existing.id : createId("student");
    const statement = existing
      ? db.prepare(`
          UPDATE students SET
            student_code = @student_code, full_name = @full_name, date_of_birth = @date_of_birth, gender = @gender, phone = @phone, email = @email,
            address = @address, faculty_id = @faculty_id, major_id = @major_id, class_id = @class_id, course_id = @course_id,
            training_system_id = @training_system_id, policy_object_id = @policy_object_id, status = @status, updated_at = @updated_at
          WHERE id = @id AND tenant_id = @tenant_id
        `)
      : db.prepare(`
          INSERT INTO students (
            id, tenant_id, student_code, full_name, date_of_birth, gender, phone, email, address, faculty_id, major_id, class_id, course_id,
            training_system_id, policy_object_id, status, created_at, updated_at
          ) VALUES (
            @id, @tenant_id, @student_code, @full_name, @date_of_birth, @gender, @phone, @email, @address, @faculty_id, @major_id, @class_id, @course_id,
            @training_system_id, @policy_object_id, @status, @created_at, @updated_at
          )
        `);

    statement.run({
      id: studentId,
      tenant_id: tenantId,
      student_code: payload.studentCode,
      full_name: payload.fullName,
      date_of_birth: payload.dateOfBirth || null,
      gender: payload.gender || null,
      phone: payload.phone || null,
      email: payload.email || null,
      address: payload.address || null,
      faculty_id: payload.facultyId,
      major_id: payload.majorId,
      class_id: payload.classId,
      course_id: payload.courseId,
      training_system_id: payload.trainingSystemId,
      policy_object_id: payload.policyObjectId || null,
      status: payload.status,
      created_at: now,
      updated_at: now,
    });

    return getStudentById(tenantId, studentId);
  }

  function searchStudents(tenantId, filters) {
    const where = [];
    const params = {};

    if (filters.keyword) {
      where.push("(LOWER(s.student_code) LIKE @keyword OR LOWER(s.full_name) LIKE @keyword OR LOWER(c.name) LIKE @keyword OR LOWER(m.name) LIKE @keyword)");
      params.keyword = `%${filters.keyword.toLowerCase()}%`;
    }
    ["classId", "courseId", "majorId", "trainingSystemId", "policyObjectId", "status"].forEach((field) => {
      if (filters[field]) {
        const columnMap = {
          classId: "s.class_id",
          courseId: "s.course_id",
          majorId: "s.major_id",
          trainingSystemId: "s.training_system_id",
          policyObjectId: "s.policy_object_id",
          status: "s.status",
        };
        where.push(`${columnMap[field]} = @${field}`);
        params[field] = filters[field];
      }
    });
    if (filters.eventType) {
      where.push("EXISTS (SELECT 1 FROM student_events se WHERE se.student_id = s.id AND se.type = @eventType AND se.tenant_id = @tenantId)");
      params.eventType = filters.eventType;
    }

    return mapStudentRows({ tenantId, where: where.join(" AND "), params });
  }

  function importStudents(tenantId, rows) {
    let added = 0;
    let updated = 0;
    rows.forEach((row) => {
      if (!row.studentCode || !row.fullName) {
        return;
      }
      const exists = db.prepare("SELECT id FROM students WHERE student_code = ? AND tenant_id = ?").get(row.studentCode, tenantId);
      saveStudent(tenantId, {
        id: exists ? exists.id : undefined,
        studentCode: row.studentCode,
        fullName: row.fullName,
        dateOfBirth: row.dateOfBirth,
        gender: row.gender,
        phone: row.phone,
        email: row.email,
        address: row.address,
        facultyId: row.facultyId || "f1",
        majorId: row.majorId || "m1",
        classId: row.classId || "c1",
        courseId: row.courseId || "k2",
        trainingSystemId: row.trainingSystemId || "t1",
        policyObjectId: row.policyObjectId,
        status: row.status || "dang_hoc",
      });
      if (exists) {
        updated += 1;
      } else {
        added += 1;
      }
    });
    return { added, updated };
  }

  function createBackup(tenantId, createdBy) {
    const backupDir = path.join(app.getPath("documents"), "QuanLySinhVien", "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `backup-${tenantId}-${Date.now()}.db`);
    fs.copyFileSync(dbPath, backupPath);
    db.prepare("INSERT INTO backups (id, tenant_id, file_path, created_by, created_at) VALUES (?, ?, ?, ?, ?)").run(
      createId("backup"),
      tenantId,
      backupPath,
      createdBy,
      new Date().toISOString(),
    );
    return backupPath;
  }

  function deleteStudent(tenantId, studentId) {
    db.prepare("DELETE FROM student_events WHERE student_id = ? AND tenant_id = ?").run(studentId, tenantId);
    db.prepare("DELETE FROM students WHERE id = ? AND tenant_id = ?").run(studentId, tenantId);
  }

  function saveStudentEvent(tenantId, payload) {
    const now = new Date().toISOString();
    const student = db.prepare("SELECT id FROM students WHERE id = ? AND tenant_id = ?").get(payload.studentId, tenantId);
    if (!student) {
      throw new Error("Không tìm thấy sinh viên");
    }

    const existing = payload.id
      ? db.prepare("SELECT id FROM student_events WHERE id = ? AND tenant_id = ?").get(payload.id, tenantId)
      : null;
    const eventId = existing ? existing.id : createId("event");
    const statement = existing
      ? db.prepare(`
          UPDATE student_events SET
            type = ?, title = ?, decision_number = ?, effective_date = ?,
            note = ?, metadata_json = ?, updated_at = ?
          WHERE id = ? AND tenant_id = ?
        `)
      : db.prepare(`
          INSERT INTO student_events (id, tenant_id, student_id, type, title, decision_number, effective_date, note, metadata_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

    if (existing) {
      statement.run(
        payload.type,
        payload.title,
        payload.decisionNumber || null,
        payload.effectiveDate || null,
        payload.note || null,
        payload.metadataJson || null,
        now,
        eventId,
        tenantId,
      );
    } else {
      statement.run(
        eventId,
        tenantId,
        payload.studentId,
        payload.type,
        payload.title,
        payload.decisionNumber || null,
        payload.effectiveDate || null,
        payload.note || null,
        payload.metadataJson || null,
        now,
        now,
      );
    }

    return getStudentById(tenantId, payload.studentId).events.find((event) => event.id === eventId);
  }

  function deleteStudentEvent(tenantId, eventId, studentId) {
    void studentId;
    db.prepare("DELETE FROM student_events WHERE id = ? AND tenant_id = ?").run(eventId, tenantId);
  }

  function closeDatabase() {
    if (db) {
      db.close();
    }
  }

  runMigrations();
  ensureTenantSupport();
  seedDatabase();

  return {
    bootstrap,
    login,
    registerTenant,
    createUser,
    listUsers,
    updateUserRole,
    updateUserActive,
    createClass,
    deleteClass,
    getStudentById,
    saveStudent,
    deleteStudent,
    searchStudents,
    importStudents,
    createBackup,
    closeDatabase,
    saveStudentEvent,
    deleteStudentEvent,
  };
}

module.exports = {
  createDatabaseManager,
};
