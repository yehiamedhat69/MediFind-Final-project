export default function StatsCards({ stats }) {
  return (
    <section className="stats-row">
      {stats.map((stat) => (
        <div key={stat.id} className={`stat-card stat-${stat.tone}`}>
          <span className="stat-number">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
