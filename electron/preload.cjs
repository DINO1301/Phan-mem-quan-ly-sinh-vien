const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  bootstrap: () => ipcRenderer.invoke("app:bootstrap"),
  login: (username, password) => ipcRenderer.invoke("auth:login", username, password),
  register: (payload) => ipcRenderer.invoke("auth:register", payload),
  logout: () => ipcRenderer.invoke("auth:logout"),
  listUsers: () => ipcRenderer.invoke("users:list"),
  createUser: (payload) => ipcRenderer.invoke("users:create", payload),
  updateUserRole: (userId, role) => ipcRenderer.invoke("users:updateRole", userId, role),
  updateUserActive: (userId, isActive) => ipcRenderer.invoke("users:updateActive", userId, isActive),
  getStudentById: (studentId) => ipcRenderer.invoke("students:getById", studentId),
  saveStudent: (payload) => ipcRenderer.invoke("students:save", payload),
  deleteStudent: (studentId) => ipcRenderer.invoke("students:delete", studentId),
  searchStudents: (filters) => ipcRenderer.invoke("students:search", filters),
  exportReport: (kind) => ipcRenderer.invoke("reports:export", kind),
  importStudents: (rows) => ipcRenderer.invoke("students:import", rows),
  createBackup: () => ipcRenderer.invoke("backup:create"),
  createClass: (payload) => ipcRenderer.invoke("catalogs:createClass", payload),
  deleteClass: (classId) => ipcRenderer.invoke("catalogs:deleteClass", classId),
  saveStudentEvent: (payload) => ipcRenderer.invoke("students:saveEvent", payload),
  deleteStudentEvent: (eventId, studentId) => ipcRenderer.invoke("students:deleteEvent", eventId, studentId),
});
