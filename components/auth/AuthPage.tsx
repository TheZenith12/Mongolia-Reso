"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Leaf, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "react-hot-toast";

type Mode = "login" | "register";

export default function AuthPage({ mode = "login" }: { mode?: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Амжилттай нэвтэрлээ!");
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.session.user.id)
              .maybeSingle();
            const role = (profile as any)?.role;
            if (role === "super_admin" || role === "manager") {
              window.location.href = "/admin";
            } else {
              window.location.href = "/";
            }
          } catch {
            window.location.href = "/";
          }
        }
      } else {
        if (password.length < 6) {
          toast.error("Нууц үг 6 тэмдэгтээс дээш байх ёстой");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Бүртгэл амжилттай!");
        window.location.href = "/auth/login";
      }
    } catch (err: any) {
      toast.error(err.message ?? "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Image */}
      <div className="hidden lg:block relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950/80 to-forest-800/60" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-forest-700/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Leaf size={18} className="text-amber-300" />
            </div>
            <span className="font-display text-xl text-white font-semibold">
              Монгол Нутаг
            </span>
          </Link>
          <div>
            <h2 className="font-display text-5xl text-white font-semibold leading-tight mb-4">
              Байгалийн гоо <br /> үзэсгэлэнг <br />
              <span className="text-amber-300 italic">мэдрээрэй</span>
            </h2>
            <p className="text-forest-300 text-lg">
              1000+ амралтын газар, байгалийн үзэсгэлэнт газрыг нэг дороос
              захиалаарай
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
              <Leaf size={18} className="text-amber-300" />
            </div>
            <span className="font-display text-xl text-forest-900 font-semibold">
              Монгол Нутаг
            </span>
          </Link>

          <h1 className="font-display text-4xl font-semibold text-forest-900 mb-2">
            {mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
          </h1>
          <p className="text-forest-500 mb-8">
            {mode === "login"
              ? "Захиалга, хадгалсан газруудаа удирдаарай"
              : "Шинэ бүртгэл үүсгэж эхэлнэ үү"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">
                  Нэр
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none"
                  />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Таны нэр"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">
                И-мэйл
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="taний@email.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">
                Нууц үг
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Нууц үгээ оруулна уу"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base"
            >
              {loading
                ? "Уншиж байна..."
                : mode === "login"
                  ? "Нэвтрэх"
                  : "Бүртгүүлэх"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-forest-500">
            {mode === "login" ? (
              <>
                Бүртгэл байхгүй юу?{" "}
                <Link
                  href="/auth/register"
                  className="text-forest-700 font-semibold hover:underline"
                >
                  Бүртгүүлэх
                </Link>
              </>
            ) : (
              <>
                Аль хэдийн бүртгэлтэй юу?{" "}
                <Link
                  href="/auth/login"
                  className="text-forest-700 font-semibold hover:underline"
                >
                  Нэвтрэх
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
