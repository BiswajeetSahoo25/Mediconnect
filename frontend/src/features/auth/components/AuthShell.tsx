import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-900 lg:grid lg:grid-cols-[1fr_0.92fr]">
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-[440px]">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2.5"
            aria-label="MediConnect home"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-900/15">
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-[19px] font-bold tracking-tight">
              Medi<span className="text-blue-700">Connect</span>
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              {eyebrow}
            </p>
            <h1 className="font-[Outfit] text-3xl font-bold tracking-tight text-slate-950 sm:text-[38px]">
              {title}
            </h1>
            <p className="mt-3 max-w-sm text-[15px] leading-6 text-slate-500">
              {description}
            </p>
          </div>

          {children}
          {footer}
          <p className="mt-8 text-center text-xs text-slate-400">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-[#102d4f] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 -top-28 size-[520px] rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-8 size-[340px] rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-32 size-[440px] rounded-full bg-blue-400/15 blur-3xl" />
        <div className="relative z-10 flex justify-end">
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-blue-50">
            Care that feels connected
          </span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-lg py-14">
          <div className="mb-8 grid size-16 place-items-center rounded-[22px] border border-white/15 bg-white/10 text-blue-200 shadow-2xl shadow-black/10">
            <svg
              viewBox="0 0 32 32"
              className="size-9"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 27s-10-5.8-10-13a5.7 5.7 0 0 1 10-3.7A5.7 5.7 0 0 1 26 14c0 7.2-10 13-10 13Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 12v8m-4-4h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            Your health, in good hands
          </p>
          <h2 className="font-[Outfit] text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
            A better way to take care of{" "}
            <span className="text-blue-200">you.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-blue-50/75">
            Find trusted doctors, manage appointments, and keep your care
            journey moving forward—all in one place.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["01", "Find care"],
              ["02", "Book visits"],
              ["03", "Stay on track"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm"
              >
                <span className="text-xs font-semibold tracking-widest text-blue-200">
                  {number}
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-blue-100/65">
          <span>Healthcare, made simpler.</span>
          <span>Care that moves with you</span>
        </div>
      </aside>
    </div>
  );
}

export default AuthShell;
