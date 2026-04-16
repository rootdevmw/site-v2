export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">Overview of church activities</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-4">
          <p className="text-sm text-[var(--text-secondary)]">Members</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">--</h2>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-4">
          <p className="text-sm text-[var(--text-secondary)]">Ministries</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">--</h2>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-4">
          <p className="text-sm text-[var(--text-secondary)]">Upcoming Events</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">--</h2>
        </div>
      </div>

      {/* Placeholder Section */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Welcome to the Church Management System.
        </p>
      </div>
    </div>
  );
}
