export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
        <span className="text-sm text-slate-400">불러오는 중...</span>
      </div>
    </div>
  );
}
