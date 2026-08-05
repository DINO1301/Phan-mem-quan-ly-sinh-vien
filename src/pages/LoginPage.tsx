import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-[#06101d] px-6 py-8 text-zinc-100">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_38%),linear-gradient(135deg,#091627,#050a12)] p-8 shadow-2xl shadow-cyan-950/30">
          <p className="text-sm uppercase tracking-[0.38em] text-cyan-200/70">Desktop Student Manager</p>
          <h1 className="mt-6 max-w-3xl font-serif text-6xl leading-[1.05] text-white">
            Quản lý hồ sơ sinh viên với giao diện hiện đại, tra cứu nhanh và sao lưu an toàn.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300">
            Phần mềm được thiết kế để cài đặt trên Windows, giúp phòng công tác sinh viên xử lý hồ sơ, học bổng, kỷ luật,
            biến động và báo cáo từ một trung tâm dữ liệu duy nhất.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ["Vận hành offline", "Electron + SQLite giúp dữ liệu lưu cục bộ và mở rộng để đồng bộ sau."],
              ["Nhập xuất dữ liệu", "Hỗ trợ import Excel, xuất báo cáo và tạo backup chỉ với vài thao tác."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="inline-flex rounded-2xl bg-cyan-300/10 p-4 text-cyan-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-5 font-serif text-4xl text-white">Đăng nhập hệ thống</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Nhập tên đăng nhập và mật khẩu của bạn để tiếp tục.</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              try {
                await login(username, password);
                navigate("/dashboard");
              } catch (loginError) {
                setError(loginError instanceof Error ? loginError.message : "Đăng nhập thất bại");
              }
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Tên đăng nhập</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d30] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Mật khẩu</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d30] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {loading ? "Đang xử lý..." : "Đăng nhập vào ứng dụng"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
            >
              Đăng ký tài khoản giáo viên
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
