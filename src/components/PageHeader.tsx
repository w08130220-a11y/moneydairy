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
    <div className="flex items-end justify-between mb-8 md:mb-10 gap-4 md:gap-6 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-display md:text-display-lg text-ink">{title}</h1>
        {subtitle && <p className="text-[14px] md:text-[15px] text-ink-soft mt-2">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
