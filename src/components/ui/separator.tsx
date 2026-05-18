import { cn } from "@/lib/utils";

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-white/10", className)} />;
}

export { Separator };
