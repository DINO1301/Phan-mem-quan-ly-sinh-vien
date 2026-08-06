const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain, protocol, dialog } = require("electron");
const XLSX = require("xlsx");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { createDatabaseManager } = require("./database.cjs");

let mainWindow = null;
let db = null;
let currentUser = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function isDev() {
  return !app.isPackaged;
}

function requireAuth() {
  if (!currentUser) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
  }
  return currentUser;
}

function requireRole(roles) {
  const user = requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Bạn không có quyền thực hiện thao tác này");
  }
  return user;
}

function requireSystemAdmin() {
  return requireRole(["admin"]);
}

function registerAppProtocol() {
  const distRoot = path.join(__dirname, "..", "dist-renderer");
  protocol.registerFileProtocol("app", (request, callback) => {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const relativePath = pathname.replace(/^\/+/, "");
    const resolvedPath = path.normalize(path.join(distRoot, relativePath));
    if (!resolvedPath.startsWith(distRoot)) {
      callback({ error: -6 });
      return;
    }
    callback({ path: resolvedPath });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1540,
    height: 980,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: "#07111f",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadURL("app://-/index.html");
  }

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    dialog.showErrorBox(
      "Không tải được giao diện",
      `Lỗi tải trang (${errorCode}): ${errorDescription}\n${validatedURL}`,
    );
  });
}

async function exportExcel() {
  const payload = db.bootstrap(requireAuth().tenantId);
  const sheet = XLSX.utils.json_to_sheet(
    payload.students.map((student) => ({
      MaSV: student.studentCode,
      HoVaTen: student.fullName,
      Lop: student.className,
      Nganh: student.majorName,
      KhoaHoc: student.courseName,
      HeDaoTao: student.trainingSystemName,
      TrangThai: student.status,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "SinhVien");
  const filePath = path.join(app.getPath("downloads"), `bao-cao-sinh-vien-${Date.now()}.xlsx`);
  XLSX.writeFile(workbook, filePath);
  return filePath;
}

async function exportPdf() {
  const payload = db.bootstrap(requireAuth().tenantId);
  const document = await PDFDocument.create();
  const page = document.addPage([842, 595]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  page.drawText("Bao cao quan ly sinh vien", {
    x: 40,
    y: 550,
    size: 22,
    font,
    color: rgb(0.05, 0.19, 0.31),
  });
  page.drawText(`Tong sinh vien: ${payload.students.length}`, { x: 40, y: 510, size: 12, font });
  page.drawText(`Dang hoc: ${payload.students.filter((item) => item.status === "dang_hoc").length}`, { x: 40, y: 490, size: 12, font });
  page.drawText(`Bao luu: ${payload.students.filter((item) => item.status === "bao_luu").length}`, { x: 40, y: 470, size: 12, font });
  page.drawText("Danh sach mau:", { x: 40, y: 440, size: 12, font });

  payload.students.slice(0, 8).forEach((student, index) => {
    page.drawText(`${index + 1}. ${student.studentCode} - ${student.fullName} - ${student.className}`, {
      x: 50,
      y: 415 - index * 22,
      size: 11,
      font,
    });
  });

  const filePath = path.join(app.getPath("downloads"), `bao-cao-sinh-vien-${Date.now()}.pdf`);
  fs.writeFileSync(filePath, await document.save());
  return filePath;
}

function registerIpc() {
  // TODO(security): currentUser chi luu tren RAM main process -> restart app mat session.
  // Nen luu token/session vao secureStorage hoac encrypted file de giu dang nhap.
  ipcMain.handle("app:bootstrap", () => {
    const payload = db.bootstrap(currentUser?.tenantId);
    return { ...payload, user: currentUser };
  });
  ipcMain.handle("auth:login", (_event, username, password) => {
    currentUser = db.login(username, password);
    return currentUser;
  });
  ipcMain.handle("auth:register", (_event, payload) => {
    if (currentUser) {
      throw new Error("Vui lòng đăng xuất trước khi đăng ký tenant mới");
    }
    if (!payload || !payload.tenantName || !payload.username || !payload.password || !payload.fullName) {
      throw new Error("Thông tin đăng ký không hợp lệ");
    }
    currentUser = db.registerTenant(payload);
    return currentUser;
  });
  ipcMain.handle("auth:logout", () => {
    currentUser = null;
  });
  ipcMain.handle("users:list", () => {
    const user = requireRole(["admin"]);
    return db.listUsers(user.tenantId);
  });
  ipcMain.handle("users:create", (_event, payload) => {
    const user = requireRole(["admin"]);
    if (!payload || (payload.role !== "affairs_officer" && payload.role !== "academic_officer")) {
      throw new Error("Quyền không hợp lệ. Chỉ cho phép cấp quyền 'Có thể sửa' hoặc 'Chỉ xem'.");
    }
    return db.createUser(user.tenantId, payload);
  });
  ipcMain.handle("users:updateRole", (_event, userId, role) => {
    const user = requireRole(["admin"]);
    if (role !== "affairs_officer" && role !== "academic_officer") {
      throw new Error("Quyền không hợp lệ. Chỉ cho phép cấp quyền 'Có thể sửa' hoặc 'Chỉ xem'.");
    }
    return db.updateUserRole(user.tenantId, userId, role);
  });
  ipcMain.handle("users:updateActive", (_event, userId, isActive) => {
    const user = requireRole(["admin"]);
    return db.updateUserActive(user.tenantId, userId, isActive);
  });
  ipcMain.handle("students:getById", (_event, studentId) => {
    const user = requireAuth();
    return db.getStudentById(user.tenantId, studentId);
  });
  ipcMain.handle("students:save", (_event, payload) => {
    const user = requireRole(["admin", "affairs_officer"]);
    return db.saveStudent(user.tenantId, payload);
  });
  ipcMain.handle("students:delete", (_event, studentId) => {
    const user = requireRole(["admin", "affairs_officer"]);
    return db.deleteStudent(user.tenantId, studentId);
  });
  ipcMain.handle("students:search", (_event, filters) => {
    const user = requireAuth();
    return db.searchStudents(user.tenantId, filters);
  });
  ipcMain.handle("students:import", (_event, rows) => {
    const user = requireRole(["admin", "affairs_officer"]);
    return db.importStudents(user.tenantId, rows);
  });
  ipcMain.handle("students:saveEvent", (_event, payload) => {
    const user = requireRole(["admin", "affairs_officer"]);
    return db.saveStudentEvent(user.tenantId, payload);
  });
  ipcMain.handle("students:deleteEvent", (_event, eventId, studentId) => {
    const user = requireRole(["admin", "affairs_officer"]);
    return db.deleteStudentEvent(user.tenantId, eventId, studentId);
  });
  ipcMain.handle("backup:create", () => {
    const user = requireSystemAdmin();
    const filePath = db.createBackup(user.tenantId, currentUser?.fullName || "Quan tri he thong");
    return { filePath };
  });
  ipcMain.handle("catalogs:createClass", (_event, payload) => {
    requireSystemAdmin();
    return db.createClass(payload);
  });
  ipcMain.handle("catalogs:deleteClass", (_event, classId) => {
    const user = requireSystemAdmin();
    return db.deleteClass(user.tenantId, classId);
  });
  ipcMain.handle("reports:export", async (_event, kind) => {
    requireAuth();
    const filePath = kind === "excel" ? await exportExcel() : await exportPdf();
    return { filePath };
  });
}

app.whenReady().then(() => {
  try {
    db = createDatabaseManager(app);
  } catch (error) {
    dialog.showErrorBox("Lỗi khởi tạo cơ sở dữ liệu", String(error));
    app.quit();
    return;
  }
  registerIpc();
  registerAppProtocol();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (db) {
    db.closeDatabase();
  }
});
