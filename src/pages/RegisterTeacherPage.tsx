import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus2, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function RegisterTeacherPage() {
  const navigate = useNavigate();
  const { register, loading } = useAppStore();
  const [tenantName, setTenantName] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-[#06101d] px-6 py-8 text-zinc-100">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="inline-flex rounded-2xl bg-cyan-300/10 p-4 text-cyan-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-serif text-4xl text-white">Đăng ký tài khoản giáo viên</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Tạo tài khoản để sử dụng phần mềm. Sau khi đăng ký sẽ tự động đăng nhập.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 transition hover:bg-white/10"
          >
            Quay lại đăng nhập
          </button>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_42%),linear-gradient(135deg,#091627,#050a12)] p-8 shadow-2xl shadow-cyan-950/30">
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              if (password !== passwordConfirm) {
                setError("Mật khẩu xác nhận không khớp");
                return;
              }
              try {
                await register({ tenantName, fullName, username, password });
                navigate("/dashboard");
              } catch (registerError) {
                setError(registerError instanceof Error ? registerError.message : "Đăng ký thất bại");
              }
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Tên đơn vị (tenant)</span>
              <input
                value={tenantName}
                onChange={(event) => setTenantName(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d30] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
                placeholder="Ví dụ: Khoa CNTT - Trường A"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Họ và tên giáo viên</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d30] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Tên đăng nhập</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d30] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Mật khẩu</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d30] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Xác nhận mật khẩu</span>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d30] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus2 className="h-4 w-4" />
              {loading ? "Đang xử lý..." : "Tạo tenant và đăng ký"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
