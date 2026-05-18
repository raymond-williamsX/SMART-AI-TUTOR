import { MessageSquareText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <Card className="bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-cyan-300" />
          AI tutoring chat
        </CardTitle>
        <CardDescription>
          Conversational tutoring, deep explanations, and adaptive responses will connect in later phases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-950/40 text-sm text-slate-400">
          Chat workspace coming soon.
        </div>
      </CardContent>
    </Card>
  );
}
