"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError("");
      await login(data);
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--rt-gradient)" }}
            >
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-slate-900">
              Relay<span className="text-blue-600">Trace</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-6 border border-slate-200"
          style={{ boxShadow: "var(--rt-shadow)" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                style={{ focusRingColor: "rgb(37 99 235 / .3)" }}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:border-blue-500 placeholder:text-slate-400 transition-all"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="px-3.5 py-3 rounded-xl text-xs text-red-600 bg-red-50 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{
                background: "var(--rt-gradient)",
                boxShadow: "0 1px 3px rgb(37 99 235 / .4)",
              }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          RelayTrace OS · Fleet Tracking Platform
        </p>
      </div>
    </div>
  );
}
