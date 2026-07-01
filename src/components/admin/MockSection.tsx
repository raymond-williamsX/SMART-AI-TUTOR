"use client";

import { Bell, HelpCircle, MessageSquare, Save, Settings, ShieldAlert, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MockSection({ title, type }: { title: string; type: "feedback" | "announcements" | "settings" }) {
  if (type === "feedback") {
    const feedbackItems = [
      { id: 1, user: "Sarah Jenkins", email: "sarah.j@university.edu", rating: 5, comment: "EduAgent helped me score an A on my cellular biology midterm! The PDF scanner is amazing.", date: "Today, 10:15 AM" },
      { id: 2, user: "Alex Rivera", email: "arivera@gmail.com", rating: 4, comment: "Super fast explanations. I wish the voice reader had a few more accents, but otherwise perfect.", date: "Yesterday, 4:32 PM" },
      { id: 3, user: "Dr. Marcus Chen", email: "mchen@college.ca", rating: 5, comment: "I recommended this tutor tool to my entire undergraduate computer science cohort. Exceptional RAG accuracy.", date: "June 28, 2026" },
      { id: 4, user: "Emma Watson", email: "emma.w@school.uk", rating: 3, comment: "Good response format. Sometimes the quiz generator repeats questions if the PDF is too short.", date: "June 25, 2026" }
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
          <p className="text-slate-400 text-xs mt-1">Review live student feedback submissions and application reviews.</p>
        </div>

        <div className="grid gap-4">
          {feedbackItems.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl border border-white/5 bg-[#141414]/60 backdrop-blur-md hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{item.user}</span>
                    <span className="text-slate-500 text-xs">({item.email})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-400 py-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < item.rating ? "text-cyan-400" : "text-slate-700"}`}>★</span>
                    ))}
                    <span className="text-xs text-slate-400 ml-1.5 font-medium">{item.rating}/5 rating</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed pt-1.5">{item.comment}</p>
                </div>
                <span className="text-slate-500 text-xs shrink-0 whitespace-nowrap">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "announcements") {
    const announcements = [
      { id: 1, title: "System Maintenance: Database Upgrade", target: "All Users", date: "Scheduled: July 5, 2026", status: "Scheduled", content: "Upgrading database cluster for improved query latencies during peak study seasons." },
      { id: 2, title: "New Feature Alert: Image Scopes Integration", target: "Premium Tier", date: "Sent: June 24, 2026", status: "Published", content: "EduAgent now parses complex diagrams and equations directly in uploaded lecture slides." }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
            <p className="text-slate-400 text-xs mt-1">Broadcast system-wide notices or customized push notifications to groups.</p>
          </div>
          <Button className="h-9 px-4 text-xs font-semibold bg-cyan-500 hover:bg-cyan-600 text-black">
            Create Announcement
          </Button>
        </div>

        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-5 rounded-2xl border border-white/5 bg-[#141414]/60 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">{ann.title}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                  ann.status === "Published" ? "bg-cyan-500/10 text-cyan-400" : "bg-yellow-500/10 text-yellow-400"
                }`}>{ann.status}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{ann.content}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
                <span>Audience: <strong>{ann.target}</strong></span>
                <span>{ann.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
        <p className="text-slate-400 text-xs mt-1">Modify core application configurations and control environment flags.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/60 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <Settings className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">General Platform Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Disable Guest Demo Chat</label>
                <p className="text-[11px] text-slate-500 mt-0.5">Restrict sandbox test queries to logged-in profiles only.</p>
              </div>
              <input type="checkbox" className="h-4.5 w-4.5 rounded border-white/10 bg-[#0a0a0a] text-cyan-500 accent-cyan-500" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Enable Maintenance Mode</label>
                <p className="text-[11px] text-slate-500 mt-0.5">Lock application and display a scheduled updates screen.</p>
              </div>
              <input type="checkbox" className="h-4.5 w-4.5 rounded border-white/10 bg-[#0a0a0a] text-cyan-500 accent-cyan-500" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/60 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Gemini API Rate Limiting</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Max Free Requests Per User / Day</span>
                <span className="text-cyan-400 font-bold">50 requests</span>
              </div>
              <input type="range" min="10" max="200" defaultValue="50" className="w-full h-1 bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Max PDF Upload Count per User</span>
                <span className="text-cyan-400 font-bold">10 documents</span>
              </div>
              <input type="range" min="3" max="50" defaultValue="10" className="w-full h-1 bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" className="h-10 px-5 text-xs text-slate-400 hover:text-slate-200">Reset</Button>
          <Button className="h-10 px-5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-600 text-black flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
