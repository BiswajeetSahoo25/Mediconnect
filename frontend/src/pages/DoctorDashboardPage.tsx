import { Link } from "react-router-dom";

function DoctorDashboardPage() {
  return (
    <div>
      <p className="text-sm font-medium text-teal-700">For clinicians</p>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Doctor dashboard</h2>
      <p className="mt-2 text-sm text-slate-600">A focused workspace for your schedule, patients and clinical activity.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Today’s appointments", "0", "Your daily schedule will appear here."],
          ["Patient requests", "0", "Review appointment and care requests."],
          ["Profile status", "Not active", "Complete an application to activate a clinician profile."],
        ].map(([label, value, detail]) => (
          <section key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p>
          </section>
        ))}
      </div>
      <Link to="/apply-as-doctor" className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Apply as a doctor</Link>
    </div>
  );
}

export default DoctorDashboardPage;
