"use client";

import { useState } from "react";
import {
  Package,
  FileText,
  Settings,
  ListOrdered,
  Layers,
  Cpu,
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
  Database,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useServicesContentStore } from "@/lib/store/services-content";
import { useServicesContent } from "@/hooks/useServicesContent";
import { RoleGuard } from "@/components/auth/role-guard";
import OffersTab from "./_components/offers-tab";
import ComparisonTab from "./_components/comparison-tab";
import PackagesTab from "./_components/packages-tab";
import SettingsTab from "./_components/settings-tab";

const STATS_KEYS = [
  { key: "offers", label: "Service Offers", icon: Package, color: "text-blue-500" },
  { key: "packages", label: "Packages", icon: Layers, color: "text-purple-500" },
  { key: "comparison", label: "Compare Tiers", icon: ListOrdered, color: "text-orange-500" },
  { key: "faqs", label: "FAQs", icon: FileText, color: "text-green-500" },
  { key: "process", label: "Process Steps", icon: Settings, color: "text-pink-500" },
  { key: "techStack", label: "Tech Stack", icon: Cpu, color: "text-cyan-500" },
];

export default function ServicesManagePage() {
  const { content, resetToDefaults } = useServicesContentStore();
  const { isLoading, isSaving, saveToDatabase } = useServicesContent();
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = content
    ? [
        content.offers.length,
        content.packages.length,
        content.comparison.tiers.length,
        content.faqs.length,
        content.process.length,
        content.techStack.length,
      ]
    : [0, 0, 0, 0, 0, 0];

  return (
    <RoleGuard allowedRoles={["Admin", "SuperAdmin"]}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Services Content Manager</h1>
            <p className="text-muted-foreground">
              Manage service offers, pricing, packages, and all services page content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : content?.lastUpdated ? `DB: ${new Date(content.lastUpdated).toLocaleString()}` : "Not saved yet"}
            </div>
            <Button
              onClick={saveToDatabase}
              disabled={isSaving || isLoading}
              className="gap-2 rounded-xl shadow-lg shadow-primary/20"
              size="sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save to DB"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATS_KEYS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setActiveTab(s.key === "offers" ? "offers" : s.key === "packages" ? "packages" : s.key === "comparison" ? "comparison" : "settings")}
                className="text-left"
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all cursor-pointer h-full">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-2xl font-bold">{stats[i]}</div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto w-fit border border-border flex-wrap">
            <TabsTrigger value="dashboard" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2.5">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2.5">
              <Package className="w-4 h-4" />
              Offers
            </TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2.5">
              <ListOrdered className="w-4 h-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2.5">
              <Layers className="w-4 h-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2.5">
              <Settings className="w-4 h-4" />
              More Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Manage Service Offers", desc: "Add, edit or delete service listings with pricing and tiers", tab: "offers", icon: Package },
                  { label: "Compare Plans", desc: "Update comparison tiers and features table", tab: "comparison", icon: ListOrdered },
                  { label: "Pricing Packages", desc: "Manage bundled service packages", tab: "packages", icon: Layers },
                  { label: "FAQs & Process", desc: "Edit FAQ questions, process steps, and tech stack", tab: "settings", icon: FileText },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.tab}
                      onClick={() => setActiveTab(action.tab)}
                      className="p-5 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold mb-1">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Reset to defaults - Admin only */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <CardTitle className="text-red-500">Reset to Defaults</CardTitle>
                    <p className="text-sm text-muted-foreground">This will restore all services content to factory defaults. Cannot be undone.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset all services content to defaults? This cannot be undone.")) {
                      resetToDefaults();
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-bold"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset All
                </button>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <OffersTab />
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonTab />
          </TabsContent>

          <TabsContent value="packages">
            <PackagesTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
