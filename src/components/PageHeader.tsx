export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
      <div>
        <h1 className="text-display text-ink">{title}</h1>
        {subtitle && <p className="text-[15px] text-ink-soft mt-2">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
