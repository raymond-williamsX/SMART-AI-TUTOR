"use client";

import { useState } from "react";
import { Activity, Clock, Cpu, Server } from "lucide-react";

export function AnalyticsTab() {
  const [latencyData, setLatencyData] = useState({
    apiGateway: 45,
    geminiResponse: 850,
    searchRetrieval: 120,
    pdfProcessing: 1450,
  });

  const [recentEvents, setRecentEvents] = useState([
    { id: 1, event: "user_login", properties: { provider: "google" }, timestamp: "Just now" },
    { id: 2, event: "pdf_uploaded", properties: { size_kb: 1420 }, timestamp: "2 mins ago" },
    { id: 3, event: "quiz_completed", properties: { accuracy: 0.8 }, timestamp: "5 mins ago" },
    { id: 4, event: "ai_chat_completed", properties: { prompt_tokens: 152, completion_tokens: 284 }, timestamp: "8 mins ago" },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Platform System Performance</h2>
        <p className="text-slate-400 text-xs mt-1">
          Monitor API endpoint response latencies and audit live application event telemetry streams.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* KPI latency cards */}
        <div className="p-5 rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-md flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">API Gateway</span>
            <div className="text-xl font-bold text-white mt-1">{latencyData.apiGateway}ms</div>
          </div>
          <Server className="h-5 w-5 text-cyan-400" />
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-md flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Gemini API</span>
            <div className="text-xl font-bold text-white mt-1">{latencyData.geminiResponse}ms</div>
          </div>
          <Cpu className="h-5 w-5 text-cyan-400" />
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-md flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">RAG Retrieval</span>
            <div className="text-xl font-bold text-white mt-1">{latencyData.searchRetrieval}ms</div>
          </div>
          <Clock className="h-5 w-5 text-cyan-400" />
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-md flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">PDF Parse</span>
            <div className="text-xl font-bold text-white mt-1">{latencyData.pdfProcessing}ms</div>
          </div>
          <Activity className="h-5 w-5 text-cyan-400" />
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Live Event Stream</h3>
        </div>

        <div className="space-y-3">
          {recentEvents.map((evt) => (
            <div key={evt.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0a0a]/50 border border-white/5 hover:bg-[#0a0a0a]/80 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-cyan-400 font-semibold">{evt.event}</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-md">
                  {JSON.stringify(evt.properties)}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0 font-medium">{evt.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
