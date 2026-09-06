import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
      <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-[#087ca3]">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">This page isn&apos;t available</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">The link may be incorrect or the page may have moved.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-[#14bef0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0daedc]">Back to home</Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
