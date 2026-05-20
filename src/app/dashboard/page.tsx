import { ArrowRight, BookOpenText, Brain, ClipboardList, UploadCloud } from "lucide-react";

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
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-glow sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Premium AI tutoring shell</Badge>
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                Your personalized AI tutor — study smarter, not harder.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Upload course materials, ask targeted questions, and let EduAgent generate step-by-step explanations, summaries, and study plans tailored to your needs.
              </p>
            </div>
            <Button className="w-fit">
              Open tutor mode
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <MetricCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5 text-cyan-300" />
                Learning workspace
              </CardTitle>
              <CardDescription>
                Upload documents, tutor topics, and prepare structured learning sessions from one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Recent uploads", desc: "Drag PDFs into the upload pipeline in Phase 5.", icon: UploadCloud },
                { title: "Adaptive study", desc: "Future Gemini tutoring sessions will personalize explanations.", icon: Brain },
                { title: "Practice quizzes", desc: "Generate MCQs and revision checks from source material.", icon: ClipboardList },
                { title: "Session history", desc: "Track mastery, weak topics, and scheduled lessons.", icon: BookOpenText },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tutor modes</CardTitle>
              <CardDescription>Two AI tutoring paths, plus generated notes and quiz layers later in the roadmap.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tutorModes.map((mode) => (
                <ModeCard key={mode.title} {...mode} />
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
