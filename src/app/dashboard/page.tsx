import Link from "next/link";
import { ArrowRight, BookOpenText, Brain, CalendarDays, ClipboardList, Plus, UploadCloud } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, tutorModes } from "@/lib/theme";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModeCard } from "@/components/dashboard/mode-card";
import { requireUser } from "@/lib/auth/require-user";

export default async function DashboardPage() {
  await requireUser("/dashboard");

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-glow sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Study workspace</Badge>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl">
                Continue your learning without losing context.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Pick up a previous study session, start a new one, or jump into an upload or schedule flow from one compact dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/chat">
                  <Plus className="h-4 w-4" />
                  New session
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                <Link href="/chat">
                  <ArrowRight className="h-4 w-4" />
                  Continue learning
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <MetricCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5 text-cyan-300" />
                Continue learning
              </CardTitle>
              <CardDescription>Resume your latest session or start a new learning path in one tap.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Study algebra variables", meta: "Updated 12 minutes ago" },
                { title: "Biology diagram review", meta: "Updated today at 9:12 AM" },
                { title: "Essay revision notes", meta: "Updated yesterday" },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Launch the most common study tasks.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Button asChild variant="outline" className="justify-start border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                  <Link href="/chat"><Plus className="h-4 w-4" />New session</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                  <Link href="/upload"><UploadCloud className="h-4 w-4" />Upload material</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                  <Link href="/chat"><Brain className="h-4 w-4" />AI tutor</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                  <Link href="/schedule"><CalendarDays className="h-4 w-4" />Schedule lesson</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning insights</CardTitle>
                <CardDescription>Your study cadence at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span>Sessions completed</span>
                  <span className="font-medium text-white">18</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span>Topics mastered</span>
                  <span className="font-medium text-white">11</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span>Learning streak</span>
                  <span className="font-medium text-white">7 days</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span>Hours studied</span>
                  <span className="font-medium text-white">24.5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
