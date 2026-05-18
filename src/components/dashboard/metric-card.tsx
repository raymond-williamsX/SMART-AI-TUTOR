import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ label, value, delta }: Readonly<{ label: string; value: string; delta: string }>) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="font-heading text-3xl font-semibold text-white">{value}</p>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">{delta}</span>
        </div>
      </CardContent>
    </Card>
  );
}
