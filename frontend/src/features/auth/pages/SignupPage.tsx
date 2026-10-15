import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { signupSchema, type SignupFormData } from "../../../validators/signup.validator";
import { ApiError, createUser } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import AuthShell from "../components/AuthShell";

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<z.input<typeof signupSchema>, undefined, z.output<typeof signupSchema>>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupFormData) {
    try {
      await createUser(data);
      await refreshUser();
      navigate("/onboarding", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const fields = error.details?.fields ?? [];
        for (const field of fields) {
          if (field === "email" || field === "phone" || field === "password") setError(field, { type: "server", message: error.message });
        }
        setError("root", { type: "server", message: error.message });
        return;
      }
      setError("root", { type: "server", message: "We could not create your account. Please try again." });
    }
  }

  return (
    <AuthShell eyebrow="Get started" title="Your care starts here." description="Create an account to make your healthcare easier to manage.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 ${errors.email ? "border-rose-300" : "border-slate-200"}`} />
          {errors.email && <p className="mt-1.5 text-sm text-rose-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">Phone number <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="phone" type="tel" autoComplete="tel" inputMode="numeric" placeholder="10-digit mobile number" {...register("phone")} className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 ${errors.phone ? "border-rose-300" : "border-slate-200"}`} />
          {errors.phone && <p className="mt-1.5 text-sm text-rose-600">{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Create password</label>
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" {...register("password")} className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 ${errors.password ? "border-rose-300" : "border-slate-200"}`} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-4 text-xs font-semibold text-slate-500 hover:text-emerald-700" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {errors.password && <p className="mt-1.5 text-sm text-rose-600">{errors.password.message}</p>}
          <p className="mt-2 text-xs text-slate-400">Use at least 8 characters to keep your account secure.</p>
        </div>
        {errors.root && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"><p className="text-sm text-rose-700">{errors.root.message}</p></div>}
        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? "Creating account..." : <>Create account <span aria-hidden="true">→</span></>}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">Already have an account?{" "}<Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">Sign in</Link></p>
    </AuthShell>
  );
}

export default SignupPage;
