import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { ChatContainer } from "../../components/chat/ChatContainer";
import { requireUser } from "@/lib/auth/require-user";

export default async function ChatPage() {
  await requireUser("/chat");

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 shadow-glow sm:p-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">AI Chat</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl">
              Learn through conversation, examples, and step-by-step explanations.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Ask questions, paste notes, or request worked examples. Responses now render markdown, code blocks, and structured learning guidance cleanly.
            </p>
          </div>
        </section>

        <Card className="overflow-hidden border-white/10 bg-white/[0.03]">
          <CardHeader className="border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>AI Tutoring Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ChatContainer />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
