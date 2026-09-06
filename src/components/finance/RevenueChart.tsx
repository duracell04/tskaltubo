const euros = (n: number) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
export function RevenueChart({
  longRevenue,
  rehabRevenue,
  cash,
}: {
  longRevenue: number;
  rehabRevenue: number;
  cash: number;
}) {
  const rows = [
    ["Long-term care", longRevenue],
    ["Rehabilitation", rehabRevenue],
    ["Cash before debt & tax", cash],
  ] as const;
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return (
    <figure className="revenue-chart">
      <figcaption>Annual revenue components and operating cash</figcaption>
      {rows.map(([name, value]) => (
        <div className="chart-row" key={name}>
          <div>
            <span>{name}</span>
            <strong>{euros(value)}</strong>
          </div>
          <div className="chart-track" aria-hidden="true">
            <span style={{ width: `${Math.max(0, value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </figure>
  );
}
