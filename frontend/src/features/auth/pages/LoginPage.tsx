import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import {
  loginSchema,
  type LoginFormData,
} from "../../../validators/login.validator";
import { ApiError, loginUser } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import AuthShell from "../components/AuthShell";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<
    z.input<typeof loginSchema>,
    undefined,
    z.output<typeof loginSchema>
  >({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const result = await loginUser(data.email, data.password);

      await refreshUser();

      navigate(
        result.data.user.onboardingCompletedAt
          ? result.data.user.role === "ADMIN"
            ? "/admin/doctor-applications"
            : result.data.user.role === "DOCTOR"
              ? "/doctor-dashboard"
              : "/dashboard"
          : "/onboarding",
        { replace: true },
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError("root", {
          type: "server",
          message: error.message,
        });

        return;
      }

      setError("root", {
        type: "server",
        message: "We could not sign you in. Please try again.",
      });
    }
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Good to see you again." description="Sign in to pick up where you left off with your care.">
          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 ${errors.email ? "border-rose-300" : "border-slate-200"}`}
              />

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <span className="text-xs text-slate-400">
                  Keep your account secure
                </span>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 ${errors.password ? "border-rose-300" : "border-slate-200"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-4 text-xs font-semibold text-slate-500 hover:text-emerald-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {errors.root && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm text-rose-700">
                  {errors.root.message}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Signing in…" : <>Sign in <span aria-hidden="true">→</span></>}
            </button>
          </form>

          {/* Signup */}
          <p className="mt-7 text-center text-sm text-slate-500">
            New to MediConnect?{" "}
            <Link
              to="/signup"
              className="font-bold text-emerald-700 hover:text-emerald-800"
            >
              Create one
            </Link>
          </p>
    </AuthShell>
  );
}

export default LoginPage;
