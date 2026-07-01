"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  UploadCloud, 
  Cpu, 
  Coins, 
  TrendingUp, 
  Calendar,
  Image as ImageIcon
} from "lucide-react";

type KpiStats = {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  mau: number;
  totalSessions: number;
  totalMessages: number;
  totalDocs: number;
  totalImages: number;
  aiRequests: number;
  aiCost: number;
  revenue: number;
  premiumUsers: number;
};

export function OverviewTab() {
  const [stats, setStats] = useState<KpiStats>({
    totalUsers: 24,
    newUsersToday: 3,
    activeUsersToday: 8,
    mau: 14,
    totalSessions: 45,
    totalMessages: 284,
    totalDocs: 18,
    totalImages: 4,
    aiRequests: 320,
    aiCost: 0.045,
    revenue: 0,
    premiumUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        if (json.success && json.data) {
          const s = json.data;
          setStats({
            totalUsers: s.total_users || 0,
            newUsersToday: s.new_users_today || 0,
            activeUsersToday: s.active_users_today || 0,
            mau: s.mau || 0,
            totalSessions: s.total_sessions || 0,
            totalMessages: s.total_messages || 0,
            totalDocs: s.total_docs || 0,
            totalImages: s.total_images || 0,
            aiRequests: s.ai_requests || 0,
            aiCost: s.ai_cost || 0,
            revenue: 0, // Placeholder
            premiumUsers: 0, // Placeholder
          });
        }
      } catch (err) {
        console.warn("[overview] Failed to fetch live KPI stats, using mockup defaults:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = [
    { name: "Total Users", value: stats.totalUsers, icon: Users, desc: "Total database accounts" },
    { name: "New Today", value: stats.newUsersToday, icon: Calendar, desc: "Created last 24h" },
    { name: "Active Today", value: stats.activeUsersToday, icon: Users, desc: "Last active 24h" },
    { name: "Monthly Active", value: stats.mau, icon: Users, desc: "Last active 30d" },
    
    { name: "Study Sessions", value: stats.totalSessions, icon: BookOpen, desc: "Total study workspaces" },
    { name: "Total Chats", value: stats.totalMessages, icon: MessageSquare, desc: "Total messages logged" },
    { name: "Uploaded Docs", value: stats.totalDocs, icon: UploadCloud, desc: "Uploaded study materials" },
    { name: "Uploaded Images", value: stats.totalImages, icon: ImageIcon, desc: "OCR uploaded images" },
    
    { name: "AI Requests", value: stats.aiRequests, icon: Cpu, desc: "Total Gemini calls" },
    { name: "Estimated AI Cost", value: `$${stats.aiCost.toFixed(4)}`, icon: Coins, desc: "USD equivalent token cost" },
    { name: "Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: Coins, desc: "Subscription earnings (Placeholder)", highlight: true },
    { name: "Premium Users", value: stats.premiumUsers, icon: Users, desc: "Paid accounts (Placeholder)", highlight: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">System Performance & KPIs</h2>
        <p className="text-slate-400 text-xs mt-1">Aggregated statistics and usage metrics across core microservices.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border transition-all bg-[#141414]/50 backdrop-blur-md hover:border-white/10 ${
                kpi.highlight ? "border-cyan-500/20" : "border-white/5"
              }`}
            >
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold">{kpi.name}</span>
                <Icon className={`h-4.5 w-4.5 ${kpi.highlight ? "text-cyan-400" : "text-slate-500"}`} />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {loading ? "..." : kpi.value}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{kpi.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Trends visual dashboard */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Daily Traffic growth</h3>
          </div>
          
          {/* Custom SVG line graph showing traffic */}
          <div className="relative pt-6 pb-2">
            <svg viewBox="0 0 400 120" className="w-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
              
              {/* Chart Line Path */}
              <path
                d="M 0,110 C 50,85 100,95 150,55 C 200,65 250,30 300,45 C 350,15 400,10 400,10"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,110 C 50,85 100,95 150,55 C 200,65 250,30 300,45 C 350,15 400,10 400,10 L 400,120 L 0,120 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Dots */}
              <circle cx="150" cy="55" r="3" fill="#0a0a0a" stroke="#06b6d4" strokeWidth="1.5" />
              <circle cx="300" cy="45" r="3" fill="#0a0a0a" stroke="#06b6d4" strokeWidth="1.5" />
              <circle cx="400" cy="10" r="3" fill="#0a0a0a" stroke="#06b6d4" strokeWidth="1.5" />
            </svg>
            <div className="flex justify-between text-[9px] text-slate-500 pt-2 font-medium">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Hourly chat activity</h3>
          </div>
          
          {/* Custom SVG line graph showing chat activity */}
          <div className="relative pt-6 pb-2">
            <svg viewBox="0 0 400 120" className="w-full overflow-visible">
              <defs>
                <linearGradient id="chatChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="400" y2="20" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
              
              <path
                d="M 0,90 C 50,70 100,105 150,70 C 200,45 250,55 300,15 C 350,30 400,20 400,20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,90 C 50,70 100,105 150,70 C 200,45 250,55 300,15 C 350,30 400,20 400,20 L 400,120 L 0,120 Z"
                fill="url(#chatChartGradient)"
              />
              
              <circle cx="150" cy="70" r="3" fill="#0a0a0a" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="300" cy="15" r="3" fill="#0a0a0a" stroke="#10b981" strokeWidth="1.5" />
            </svg>
            <div className="flex justify-between text-[9px] text-slate-500 pt-2 font-medium">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
