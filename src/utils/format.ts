import type { StudentStatus } from "@/types";

export function formatDate(value?: string) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export function formatStatus(status: StudentStatus) {
  const map: Record<StudentStatus, string> = {
    dang_hoc: "Đang học",
    bao_luu: "Bảo lưu",
    tam_ngung: "Tạm ngừng",
    tot_nghiep: "Tốt nghiệp",
    thoi_hoc: "Thôi học",
  };

  return map[status];
}

export function getStatusClasses(status: StudentStatus) {
  const map: Record<StudentStatus, string> = {
    dang_hoc: "bg-emerald-100 text-emerald-800",
    bao_luu: "bg-amber-100 text-amber-800",
    tam_ngung: "bg-red-100 text-red-800",
    tot_nghiep: "bg-cyan-100 text-cyan-800",
    thoi_hoc: "bg-slate-200 text-slate-700",
  };

  return map[status];
}

export function statusTone(status: StudentStatus) {
  const map: Record<StudentStatus, string> = {
    dang_hoc: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
    bao_luu: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
    tam_ngung: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
    tot_nghiep: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/30",
    thoi_hoc: "bg-zinc-500/15 text-zinc-200 ring-zinc-400/30",
  };

  return map[status];
}

export function compactPath(filePath: string) {
  return filePath.split("\\").join("/");
}
