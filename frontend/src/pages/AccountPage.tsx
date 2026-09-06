import { useEffect, useState, type FormEvent } from "react";

import { ApiError, updateCurrentUser } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function AccountPage() {
  const { user, refreshUser, logout } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Account settings | MediConnect";
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    try {
      await updateCurrentUser({
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? "") || null,
      });
      await refreshUser();
      setMessage("Account details saved.");
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Could not update your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-slate-500">Account</p>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Account settings</h2>
      <p className="mt-2 text-sm text-slate-600">Manage the contact details connected to your MediConnect account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">Email address
          <input required name="email" type="email" defaultValue={user?.email} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Phone number
          <input name="phone" type="tel" defaultValue={user?.phone ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
        </label>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Account type: <span className="font-semibold text-slate-900">{user?.role}</span></div>
        {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-1">
          <button disabled={isSubmitting} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{isSubmitting ? "Saving..." : "Save changes"}</button>
          <button type="button" onClick={() => void logout()} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Log out</button>
        </div>
      </form>
    </div>
  );
}

export default AccountPage;
