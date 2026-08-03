export default function AcademyProgressBar({ completed, total, label }: { completed: number; total: number; label: string }) {
  const percent=total===0?0:Math.round(completed/total*100);
  return <div className="academy-progress" aria-label={`${label}: ${percent}%`}><div><span>{label}</span><strong>{completed}/{total} · {percent}%</strong></div><progress max={Math.max(total,1)} value={completed}>{percent}%</progress></div>;
}
