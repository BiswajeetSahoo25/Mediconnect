import { Link } from "react-router-dom";

type FeaturePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: { label: string; to: string };
};

function FeaturePage({ eyebrow, title, description, action }: FeaturePageProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium text-teal-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      {action && <Link to={action.to} className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">{action.label}</Link>}
    </div>
  );
}

export default FeaturePage;
