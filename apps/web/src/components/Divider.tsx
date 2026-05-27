type Props = { label?: string };

export function Divider({ label }: Props) {
  if (!label) {
    return <hr className="border-slate-200" />;
  }
  return (
    <div className="flex items-center gap-3 text-xs text-slate-400">
      <span className="h-px flex-1 bg-slate-200" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
