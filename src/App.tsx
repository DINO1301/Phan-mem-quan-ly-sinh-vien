import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import ReportsPage from "@/pages/ReportsPage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import StudentDetailPage from "@/pages/StudentDetailPage";
import StudentsPage from "@/pages/StudentsPage";
import ClassDetailPage from "@/pages/ClassDetailPage";
import CatalogsSettingsPage from "@/pages/CatalogsSettingsPage";
import ImportExportSettingsPage from "@/pages/ImportExportSettingsPage";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import RegisterTeacherPage from "@/pages/RegisterTeacherPage";
import ClassesPage from "@/pages/ClassesPage";

function AppGuard() {
  const { user, ready } = useAppStore();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06101d] text-zinc-100">
        <div className="rounded-[28px] border border-white/10 bg-white/5 px-8 py-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Campus Desk</p>
          <h1 className="mt-4 font-serif text-4xl text-white">Đang khởi tạo dữ liệu</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const { bootstrap } = useAppStore();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterTeacherPage />} />
        <Route element={<AppGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/class/:className" element={<ClassDetailPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/permissions" element={<SearchPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />}>
              <Route path="" element={<Navigate to="/settings/catalogs" replace />} />
              <Route path="catalogs" element={<CatalogsSettingsPage />} />
              <Route path="import-export" element={<ImportExportSettingsPage />} />
              <Route path="admin" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
