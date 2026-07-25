"use client";

import { useState } from "react";
import {
  Activity,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText,
  Target,
  Zap,
  Bug,
  Gauge,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Globe, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_PRODUCTIVITY = [
  { name: "Mon", completed: 0, active: 0, velocity: 0 },
  { name: "Tue", completed: 0, active: 0, velocity: 0 },
  { name: "Wed", completed: 0, active: 0, velocity: 0 },
  { name: "Thu", completed: 0, active: 0, velocity: 0 },
  { name: "Fri", completed: 0, active: 0, velocity: 0 },
  { name: "Sat", completed: 0, active: 0, velocity: 0 },
  { name: "Sun", completed: 0, active: 0, velocity: 0 },
];

const CHART_PRIMARY = "#6366f1";
const CHART_SECONDARY = "#818cf8";
const CHART_AURORA_1 = "#6366f1";
const CHART_AURORA_2 = "#0ea5e9";
const CHART_AURORA_3 = "#10b981";
const CHART_GLOW = "#818cf8";
const CHART_GRID = "rgba(30, 41, 59, 0.4)";
const CHART_TEXT = "#64748b";

const GEO_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

// 2026 Glassmorphism 2.0 Tooltip with aurora glow
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="relative">
      {/* Aurora glow behind tooltip */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl" />
      <div className="relative backdrop-blur-2xl bg-[#0c0f1a]/80 border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] px-4 py-3 min-w-[160px]">
        {label && (
          <p className="text-[10px] font-bold text-white/40 mb-2 tracking-[0.15em] uppercase">
            {label}
          </p>
        )}
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-6 py-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: entry.color || entry.fill, color: entry.color || entry.fill }}
              />
              <span className="text-[13px] text-white/70 font-medium">
                {entry.name}
              </span>
            </div>
            <span className="text-[13px] font-bold text-white tabular-nums">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2026 Sparkline component for KPI cards
function MiniSparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - (v / max) * (height - 4);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} 100,${height}`;
  const gradId = `spark-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UnifiedAnalyticsHub() {
  const { user } = useAuth();
  const { stats, isLoading, refresh } = useAnalytics();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const isAdmin = user?.role === "Admin" || user?.role === "Editor";

  if (isLoading && !stats) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400/30" />
          <div className="absolute inset-0 w-10 h-10 bg-indigo-500/20 rounded-full blur-xl" />
        </div>
        <p className="text-[13px] font-medium text-white/25 animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-24">
      {/* Header - 2026 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <h1 className="type-h2 text-white/90">
            Analytics
          </h1>
          <p className="type-body-sm text-white/35 mt-1">
            {isAdmin
              ? "Overview of projects, revenue, and customer activity."
              : "Your project performance at a glance."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh(timeRange)}
            className="rounded-xl h-9 sm:h-10 border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 gap-2 font-semibold text-xs sm:text-sm transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="rounded-xl h-9 sm:h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-600 hover:to-cyan-600 gap-2 font-semibold text-xs sm:text-sm transition-all duration-300"
            onClick={() => toast.info("Export coming soon")}
          >
            <Download className="w-4 h-4 shrink-0" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        {/* Tab Bar + Time Range - 2026 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <TabsList className="bg-white/[0.03] rounded-xl sm:rounded-2xl h-auto sm:h-12 w-full sm:w-fit border border-white/[0.04] flex flex-wrap gap-1">
            <TabsTrigger
              value="performance"
              className="rounded-lg sm:rounded-xl h-auto gap-2 font-semibold px-4 sm:px-5 text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
            >
              <Gauge className="w-4 h-4 shrink-0" /> Productivity
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger
                  value="live"
                  className="rounded-lg sm:rounded-xl h-auto gap-2 font-semibold px-4 sm:px-5 text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
                >
                  <Globe className="w-4 h-4 shrink-0" /> Visitors
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="rounded-lg sm:rounded-xl h-auto gap-2 font-semibold px-4 sm:px-5 text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
                >
                  <TrendingUp className="w-4 h-4 shrink-0" /> Business
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="rounded-lg sm:rounded-xl h-auto gap-2 font-semibold px-4 sm:px-5 text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
                >
                  <DollarSign className="w-4 h-4 shrink-0" /> Financials
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="flex items-center gap-1 p-1.5 bg-white/[0.03] backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/[0.04]">
            {["day", "week", "month"].map((t) => (
              <Button
                key={t}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeRange(t as "day" | "week" | "month");
                  refresh(t as "day" | "week" | "month");
                }}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 h-8 sm:h-9",
                  timeRange === t
                    ? "bg-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                    : "text-white/25 hover:bg-white/[0.04] hover:text-white/50"
                )}
              >
                {t === "day" ? "Day" : t === "week" ? "Week" : "Month"}
              </Button>
            ))}
          </div>
        </div>

        {/* ─── Productivity Tab ─── */}
        <TabsContent
          value="performance"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-0"
        >
          {/* KPI Cards - 2026 Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Completion Rate",
                value: stats?.performance?.completionRate ?? "0%",
                trend: "+0%",
                icon: CheckCircle2,
                accent: "#10b981",
                sparkData: [3, 5, 4, 7, 6, 8, 9],
              },
              {
                label: "Avg. Turnaround",
                value: stats?.performance?.avgTurnaround ?? "\u2014",
                trend: "\u2014",
                icon: Clock,
                accent: "#0ea5e9",
                sparkData: [8, 6, 7, 5, 6, 4, 5],
              },
              {
                label: "Critical Bugs",
                value: String(stats?.performance?.criticalBugs ?? 0),
                trend: "\u2014",
                icon: Bug,
                accent: "#ef4444",
                sparkData: [2, 1, 3, 1, 0, 1, 0],
              },
              {
                label: "Team Velocity",
                value: `${stats?.performance?.teamVelocity ?? 0} pts`,
                trend: "\u2014",
                icon: Zap,
                accent: "#f59e0b",
                sparkData: [5, 7, 6, 8, 9, 10, 12],
              },
            ].map((stat, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl group-hover:from-white/[0.12] group-hover:to-white/[0.04] transition-all duration-300" />
                <Card className="relative bg-[#0a0d18]/60 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stat.accent}15` }}
                        >
                          <stat.icon className="w-4 h-4" style={{ color: stat.accent }} />
                        </div>
                        <span className="text-[12px] text-white/30 font-medium tracking-wide uppercase">
                          {stat.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white/90 tabular-nums">
                          {stat.value}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trend !== "\u2014" && (
                            <>
                              {stat.trend.startsWith("+") ? (
                                <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 text-red-400 shrink-0" />
                              )}
                            </>
                          )}
                          <span
                            className="text-[11px] font-semibold"
                            style={{
                              color:
                                stat.trend === "\u2014"
                                  ? "rgba(255,255,255,0.2)"
                                  : stat.trend.startsWith("+")
                                  ? "#10b981"
                                  : "#ef4444",
                            }}
                          >
                            {stat.trend}
                          </span>
                          <span className="text-[10px] text-white/20 ml-1">
                            vs prev
                          </span>
                        </div>
                      </div>
                      <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                        <MiniSparkline data={stat.sparkData} color={stat.accent} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Area Chart - 2026 Aurora Gradient */}
            <div className="lg:col-span-8 relative group">
              {/* Gradient border effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/40 via-cyan-500/20 to-emerald-500/30 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative bg-[#0a0d18]/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                {/* Subtle aurora mesh background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
                </div>
                <CardHeader className="relative p-6 border-b border-white/[0.04] flex flex-row items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="type-subheading font-semibold text-white/90">
                      Productivity Flow
                    </CardTitle>
                    <CardDescription className="type-body-sm text-white/40">
                      How much work gets done each day.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 text-white/30 hover:text-white/70 hover:rotate-180 transition-all duration-500"
                    onClick={() => refresh(timeRange)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="relative h-[280px] sm:h-[350px] md:h-[400px] p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        stats?.productivity?.length
                          ? stats.productivity
                          : FALLBACK_PRODUCTIVITY
                      }
                      margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        {/* Aurora gradient - multi-color flowing fill */}
                        <linearGradient id="auroraGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="30%" stopColor="#818cf8" stopOpacity={0.3} />
                          <stop offset="60%" stopColor="#0ea5e9" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                        {/* Vertical aurora for area fill */}
                        <linearGradient id="auroraArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="40%" stopColor="#818cf8" stopOpacity={0.25} />
                          <stop offset="70%" stopColor="#0ea5e9" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        {/* Glow filter for the line */}
                        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feFlood floodColor="#6366f1" floodOpacity="0.6" result="color" />
                          <feComposite in="color" in2="blur" operator="in" result="glow" />
                          <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(99, 102, 241, 0.08)"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 500 }}
                        width={35}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="url(#auroraGrad)"
                        strokeWidth={3}
                        fill="url(#auroraArea)"
                        fillOpacity={1}
                        dot={false}
                        activeDot={{
                          r: 6,
                          strokeWidth: 3,
                          stroke: "#6366f1",
                          fill: "#0a0d18",
                          filter: "url(#lineGlow)",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Donut Chart - 2026 Glowing Rings */}
            <div className="lg:col-span-4 relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative bg-[#0a0d18]/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/15 rounded-full blur-[60px]" />
                </div>
                <CardHeader className="relative p-6 border-b border-white/[0.04]">
                  <CardTitle className="type-subheading font-semibold text-white/90">
                    Project Status
                  </CardTitle>
                  <CardDescription className="type-body-sm text-white/40">
                    Breakdown of projects by their current state.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative p-6">
                  {/* Donut with glow ring */}
                  <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-xl" />
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <filter id="donutGlow" x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="4" result="blur" />
                              <feFlood floodColor="#818cf8" floodOpacity="0.5" result="color" />
                              <feComposite in="color" in2="blur" operator="in" result="glow" />
                              <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <Pie
                            data={
                              stats?.taskDistribution ?? [
                                { name: "No Data", value: 100, color: "#64748b" },
                              ]
                            }
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            filter="url(#donutGlow)"
                            cornerRadius={4}
                          >
                            {(stats?.taskDistribution ?? []).map(
                              (entry: { color: string }, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            content={
                              <ChartTooltip formatter={(v: number) => `${v}%`} />
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Center stat */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="relative">
                        <span className="text-4xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tabular-nums">
                          {stats?.totalTasks ?? 0}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/25 font-semibold tracking-[0.15em] uppercase mt-1">
                        Total Projects
                      </span>
                    </div>
                  </div>
                  {/* Legend with progress bars */}
                  <div className="mt-6 space-y-3">
                    {(stats?.taskDistribution ?? []).map(
                      (
                        item: { name: string; value: number; color: string },
                        i: number
                      ) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: item.color,
                                  boxShadow: `0 0 10px ${item.color}60`,
                                }}
                              />
                              <span className="text-[13px] font-medium text-white/50">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[13px] font-bold text-white/70 tabular-nums">
                              {item.value}%
                            </span>
                          </div>
                          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden ml-[18px]">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${item.value}%`,
                                backgroundColor: item.color,
                                boxShadow: `0 0 8px ${item.color}40`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Visitors Tab ─── */}
        {isAdmin && (
          <TabsContent
            value="live"
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visitor Table - 2026 */}
              <div className="lg:col-span-2 relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative bg-[#0a0d18]/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-15">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
                  </div>
                  <CardHeader className="relative p-6 border-b border-white/[0.04]">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="type-h3 font-semibold text-white/90">
                          Recent Visitors
                        </CardTitle>
                        <CardDescription className="type-body-sm text-white/40">
                          People currently on your site.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot" />
                        <span className="text-[12px] font-semibold text-emerald-400">
                          {stats?.liveTracking?.activeNow || 0} Online
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-white/[0.02] text-white/25 font-semibold text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="p-5">IP Address</th>
                            <th className="p-5">Page</th>
                            <th className="p-5">Browser</th>
                            <th className="p-5">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {(stats?.liveTracking?.recentVisits || []).map(
                            (visit: any, i: number) => (
                              <tr
                                key={i}
                                className="hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="p-5 font-mono text-xs text-white/30">
                                  {visit.ip?.replace(
                                    /(\d+)\.(\d+)\.(\d+)\.(\d+)/,
                                    "$1.***.***.$4"
                                  ) || "0.0.0.0"}
                                </td>
                                <td className="p-5">
                                  <div className="flex items-center gap-2">
                                    <MousePointer2 className="w-3.5 h-3.5 text-cyan-400/40" />
                                    <span className="text-[12px] font-medium text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-md">
                                      {visit.page}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-5 text-[12px] font-medium text-white/30 truncate max-w-[200px]">
                                  {visit.userAgent}
                                </td>
                                <td className="p-5 text-[12px] font-semibold text-white/20 tabular-nums">
                                  {visit.timestamp
                                    ? new Date(visit.timestamp).toLocaleTimeString()
                                    : "\u2014"}
                                </td>
                              </tr>
                            )
                          )}
                          {(!stats?.liveTracking?.recentVisits ||
                            stats.liveTracking.recentVisits.length === 0) && (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-16 text-center text-white/15 font-medium text-[13px]"
                              >
                                No visitors detected yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-6">
                {/* Traffic Sources - 2026 */}
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <Card className="relative bg-[#0a0d18]/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                    <CardContent className="relative p-6">
                      <h3 className="text-[15px] font-semibold text-white/80 mb-5 flex items-center gap-3">
                        <Target className="w-5 h-5 text-indigo-400" /> Traffic Sources
                      </h3>
                      <div className="space-y-5">
                        {(stats?.acquisition ?? [
                          { name: "Direct", value: 100, color: "bg-primary" },
                        ]).map(
                          (
                            item: { name: string; value: number; color: string },
                            idx: number
                          ) => (
                            <div key={item.name} className="space-y-2">
                              <div className="flex justify-between text-[13px] font-medium text-white/40">
                                <span>{item.name}</span>
                                <span className="text-white/70 font-semibold tabular-nums">
                                  {item.value}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${item.value}%`,
                                    backgroundColor: GEO_COLORS[idx % GEO_COLORS.length],
                                    boxShadow: `0 0 12px ${GEO_COLORS[idx % GEO_COLORS.length]}40`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* SEO CTA - 2026 */}
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/40 via-cyan-500/30 to-emerald-500/40 rounded-2xl" />
                  <Card className="relative bg-[#0a0d18]/90 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                    <CardContent className="relative p-6">
                      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                      <h3 className="text-[15px] font-semibold text-white/90 mb-2 z-10 relative">
                        Improve SEO
                      </h3>
                      <p className="text-[13px] text-white/35 mb-5 z-10 relative leading-relaxed">
                        Get more visitors from search engines like Google.
                      </p>
                      <Button
                        className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-600 hover:to-cyan-600 rounded-xl h-11 font-semibold z-10 relative transition-all duration-300"
                        onClick={() => toast.info("SEO tools coming soon")}
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        )}

        {/* ─── Business Tab ─── */}
        {isAdmin && (
          <TabsContent
            value="business"
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-0"
          >
            {/* KPI Cards - 2026 Glassmorphism */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Revenue",
                  value: `$${(stats?.overview?.revenue ?? 0).toLocaleString()}`,
                  growth: stats?.overview?.growthRevenue ?? "\u2014",
                  icon: DollarSign,
                  accent: "#6366f1",
                  sparkData: [20, 25, 30, 28, 35, 40, 45],
                },
                {
                  label: "Total Orders",
                  value: String(stats?.overview?.orders ?? 0),
                  growth: stats?.overview?.growthOrders ?? "\u2014",
                  icon: ShoppingCart,
                  accent: "#0ea5e9",
                  sparkData: [10, 12, 15, 14, 18, 20, 22],
                },
                {
                  label: "Active Customers",
                  value: (stats?.overview?.customers ?? 0).toLocaleString(),
                  growth: "\u2014",
                  icon: Users,
                  accent: "#10b981",
                  sparkData: [5, 8, 7, 10, 12, 11, 14],
                },
                {
                  label: "Conversion Rate",
                  value: stats?.overview?.conversion ?? "0.0%",
                  growth: "\u2014",
                  icon: Activity,
                  accent: "#f59e0b",
                  sparkData: [1.2, 1.5, 1.3, 1.6, 1.8, 1.7, 2.0],
                },
              ].map((kpi) => {
                const g = String(kpi.growth);
                const trend =
                  g === "\u2014" ? "neutral" : g.startsWith("-") ? "down" : "up";
                return (
                  <div key={kpi.label} className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl group-hover:from-white/[0.12] group-hover:to-white/[0.04] transition-all duration-300" />
                    <Card className="relative bg-[#0a0d18]/60 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${kpi.accent}15` }}
                            >
                              <kpi.icon className="w-4 h-4" style={{ color: kpi.accent }} />
                            </div>
                            <span className="text-[12px] text-white/30 font-medium tracking-wide uppercase">
                              {kpi.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-bold text-white/90 tabular-nums">
                              {kpi.value}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              {trend === "up" && (
                                <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" />
                              )}
                              {trend === "down" && (
                                <ArrowDownRight className="w-3 h-3 text-red-400 shrink-0" />
                              )}
                              <span
                                className="text-[11px] font-semibold"
                                style={{
                                  color:
                                    trend === "neutral"
                                      ? "rgba(255,255,255,0.2)"
                                      : trend === "up"
                                      ? "#10b981"
                                      : "#ef4444",
                                }}
                              >
                                {kpi.growth}
                              </span>
                              <span className="text-[10px] text-white/20 ml-1">
                                vs prev
                              </span>
                            </div>
                          </div>
                          <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                            <MiniSparkline data={kpi.sparkData} color={kpi.accent} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Charts Row - 2026 Style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - 2026 Gradient Bars with Glow */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/30 via-indigo-500/20 to-violet-500/30 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative bg-[#0a0d18]/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
                  </div>
                  <CardHeader className="relative p-6 border-b border-white/[0.04]">
                    <CardTitle className="type-subheading font-semibold text-white/90">
                      Revenue by Product
                    </CardTitle>
                    <CardDescription className="type-body-sm text-white/40">
                      Which products generate the most income.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative h-[300px] sm:h-[380px] p-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          stats?.productPerformance?.length
                            ? stats.productPerformance
                            : [{ name: "No data", revenue: 0 }]
                        }
                        margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="barGrad2026" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                          </linearGradient>
                          <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feFlood floodColor="#06b6d4" floodOpacity="0.3" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="glow" />
                            <feMerge>
                              <feMergeNode in="glow" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(6, 182, 212, 0.06)"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 500 }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 500 }}
                          width={45}
                        />
                        <Tooltip
                          content={
                            <ChartTooltip
                              formatter={(v: number) => `$${v.toLocaleString()}`}
                            />
                          }
                        />
                        <Bar
                          dataKey="revenue"
                          fill="url(#barGrad2026)"
                          radius={[8, 8, 2, 2]}
                          barSize={28}
                          filter="url(#barGlow)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Donut Chart - Customers by Region - 2026 Style */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-rose-500/30 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative bg-[#0a0d18]/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/10 rounded-full blur-[80px]" />
                  </div>
                  <CardHeader className="relative p-6 border-b border-white/[0.04]">
                    <CardTitle className="type-subheading font-semibold text-white/90">
                      Customers by Region
                    </CardTitle>
                    <CardDescription className="type-body-sm text-white/40">
                      Where your customers are located.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative h-[300px] sm:h-[380px] p-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <filter id="regionGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feFlood floodColor="#8b5cf6" floodOpacity="0.3" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="glow" />
                            <feMerge>
                              <feMergeNode in="glow" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <Pie
                          data={
                            stats?.customerDemographics?.length
                              ? stats.customerDemographics
                              : [{ name: "No Data", value: 100 }]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          filter="url(#regionGlow)"
                        >
                          {(
                            stats?.customerDemographics?.length
                              ? stats.customerDemographics
                              : [{ name: "No Data", value: 100 }]
                          ).map(
                            (
                              entry: { name: string; value: number },
                              index: number
                            ) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={GEO_COLORS[index % GEO_COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          content={
                            <ChartTooltip formatter={(v: number) => `${v}%`} />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                  <CardFooter className="relative p-5 border-t border-white/[0.04] bg-white/[0.02] grid grid-cols-2 gap-3">
                    {(
                      stats?.customerDemographics?.length
                        ? stats.customerDemographics
                        : [{ name: "No Data", value: 100 }]
                    ).map(
                      (
                        entry: { name: string; value: number },
                        index: number
                      ) => (
                        <div key={entry.name} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] text-white/40 truncate pr-2">
                              {entry.name}
                            </span>
                            <span
                              className="text-[13px] font-bold tabular-nums shrink-0"
                              style={{
                                color: GEO_COLORS[index % GEO_COLORS.length],
                              }}
                            >
                              {entry.value}%
                            </span>
                          </div>
                          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${entry.value}%`,
                                backgroundColor:
                                  GEO_COLORS[index % GEO_COLORS.length],
                                boxShadow: `0 0 8px ${GEO_COLORS[index % GEO_COLORS.length]}40`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                </CardFooter>
              </Card>
            </div>
            </div>
          </TabsContent>
        )}

        {/* ─── Financials Tab ─── */}
        {isAdmin && (
          <TabsContent
            value="financial"
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-0"
          >
            {/* Financial KPI Cards - 2026 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Operating Profit",
                  value: `$${(stats?.financial?.operatingProfit ?? 0).toLocaleString()}`,
                  desc: "Revenue after operating costs.",
                  accent: "#6366f1",
                  icon: TrendingUp,
                  sparkData: [10, 15, 12, 18, 22, 25, 30],
                },
                {
                  label: "Fiscal Reserves",
                  value: `$${(stats?.financial?.fiscalReserves ?? 0).toLocaleString()}`,
                  desc: "Money set aside for future use.",
                  accent: "#10b981",
                  icon: DollarSign,
                  sparkData: [5, 8, 10, 12, 15, 14, 18],
                },
                {
                  label: "Marketing Spend",
                  value: `$${(stats?.financial?.marketingSpend ?? 0).toLocaleString()}`,
                  desc: "Budget spent on advertising.",
                  accent: "#f59e0b",
                  icon: Target,
                  sparkData: [0, 0, 0, 0, 0, 0, 0],
                },
              ].map((card) => (
                <div key={card.label} className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl group-hover:from-white/[0.12] group-hover:to-white/[0.04] transition-all duration-300" />
                  <Card className="relative bg-[#0a0d18]/60 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${card.accent}15` }}
                          >
                            <card.icon className="w-4 h-4" style={{ color: card.accent }} />
                          </div>
                          <span className="text-[12px] text-white/30 font-medium tracking-wide uppercase">
                            {card.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div
                            className="text-2xl font-bold tabular-nums"
                            style={{ color: card.accent }}
                          >
                            {card.value}
                          </div>
                          <p className="text-[12px] text-white/25 mt-2">
                            {card.desc}
                          </p>
                        </div>
                        <div className="w-16 h-7 opacity-50 group-hover:opacity-100 transition-opacity">
                          <MiniSparkline data={card.sparkData} color={card.accent} height={28} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Profit & Loss - 2026 Style */}
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-emerald-500/20 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative bg-[#0a0d18]/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute top-0 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]" />
                </div>
                <CardHeader className="relative p-6 border-b border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="type-h3 font-semibold text-white/90">
                      Profit & Loss
                    </CardTitle>
                    <CardDescription className="type-body-sm text-white/40">
                      Summary of money in and money out.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl sm:rounded-2xl h-10 sm:h-12 px-5 sm:px-7 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold gap-2 shrink-0 hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300"
                    onClick={() => toast.info("PDF export coming soon")}
                  >
                    <FileText className="w-4 h-4 shrink-0" /> Download Report
                  </Button>
                </CardHeader>
              <CardContent className="relative p-0">
                <div className="divide-y divide-white/[0.04]">
                  {(() => {
                    const rev = stats?.overview?.revenue ?? 0;
                    const profit =
                      stats?.financial?.operatingProfit ?? rev;
                    const items =
                      rev > 0
                        ? [
                            {
                              category: "Order Revenue",
                              income: rev,
                              expense: 0,
                              net: rev,
                              color: "#10b981",
                            },
                            {
                              category: "Operating Profit",
                              income: profit,
                              expense: 0,
                              net: profit,
                              color: "#10b981",
                            },
                          ]
                        : [
                            {
                              category: "No revenue data yet",
                              income: 0,
                              expense: 0,
                              net: 0,
                              color: "rgba(255,255,255,0.2)",
                            },
                          ];
                    return items.map((row, i) => (
                      <div
                        key={i}
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <h5 className="font-semibold text-base sm:text-lg text-white/80">
                            {row.category}
                          </h5>
                          <p className="text-[12px] text-white/25">
                            Analytics data
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-6 sm:gap-14 text-right">
                          <div className="hidden md:block space-y-1">
                            <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">
                              Income
                            </p>
                            <p className="font-bold tabular-nums text-white/70">${Number(row.income).toLocaleString()}</p>
                          </div>
                          <div className="hidden md:block space-y-1">
                            <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">
                              Expenses
                            </p>
                            <p className="font-bold tabular-nums text-white/70">${Number(row.expense).toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">
                              Net
                            </p>
                            <p
                              className="font-bold tabular-nums text-base sm:text-lg"
                              style={{ color: row.color }}
                            >
                              {row.net >= 0 ? "+" : ""}$
                              {Number(row.net).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
