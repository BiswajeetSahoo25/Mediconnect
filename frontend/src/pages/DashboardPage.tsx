import { useAuth } from "../hooks/useAuth";

function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: "Total Appointments",
      value: "0",
      description: "All appointments",
    },
    {
      label: "Upcoming",
      value: "0",
      description: "Scheduled appointments",
    },
    {
      label: "Prescriptions",
      value: "0",
      description: "Active prescriptions",
    },
    {
      label: "Lab Reports",
      value: "0",
      description: "Available reports",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Patient dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back 👋
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your healthcare and keep track of your appointments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-600">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {user?.email ?? "Patient"}
              </p>

              <p className="text-xs text-slate-500">Patient account</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>

          <p className="mt-1 text-sm text-slate-500">
            A quick look at your healthcare activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-400">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Upcoming appointments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your next scheduled appointments will appear here.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              0 upcoming
            </span>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-xl">
              📅
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No upcoming appointments
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Your upcoming doctor appointments will appear here once you book
              one.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent appointments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your recent healthcare visits.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-xl">
              🩺
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No appointment history
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Completed and cancelled appointments will appear here.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent medical records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest medical documents and records.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-xl">
              📄
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No medical records yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Medical records will appear here when they become available.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Active prescriptions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Keep track of your current medications.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-xl">
              💊
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No active prescriptions
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Prescriptions from your healthcare providers will appear here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
