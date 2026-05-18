import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ModeCard({ title, description, status }: Readonly<{ title: string; description: string; status: string }>) {
  return (
    <Card className="transition-transform duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge className="whitespace-nowrap border-white/10 bg-white/5 text-slate-200">{status}</Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
