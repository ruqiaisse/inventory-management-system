// ReportsPage does not require default React import
import PageHeader from "../components/ui/PageHeader";

function ReportsPage() {
	return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="View and export reports" />
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300">
        This is a placeholder for the Reports page.
      </div>
    </div>
  );
}

export default ReportsPage;
