"use client"
import { AnimatedDiv } from "@/lib/animated";

import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  RefreshCw,
  ShoppingCart,
  Briefcase,
  CreditCard,
  MessageSquare,
  Package,
  Users,
  FolderKanban,
  FileText,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Shield,
  UserCheck,
  BarChart3,
  Headphones,
  LifeBuoy,
  Inbox,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useState, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useProjects } from "@/hooks/useProjects";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsers } from "@/hooks/useUsers";
import { useFinance } from "@/hooks/useFinance";
import { useTickets } from "@/hooks/useTickets";

// ============================================
// UTILITY FUNCTIONS
// ============================================

function deriveChartDataFromOrders(orders: { total?: number; createdAt?: string }[]): { name: string; visits: number; pv: number }[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    const dayOrders = (orders || []).filter((o) => {
      const created = new Date(o.createdAt || 0);
      return created >= dayStart && created <= dayEnd;
    });
    const total = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    return { name: dayNames[d.getDay()], visits: dayOrders.length, pv: Math.round(total) };
  });
}

// ============================================
// ROLE DEFINITIONS
// ============================================
export const ROLES = {
  VIEWER: 'Viewer',
  EDITOR: 'Editor',
  SUPPORT: 'Support',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin',
} as const;

type UserRole = typeof ROLES[keyof typeof ROLES];

// ============================================
// UTILITY COMPONENTS
// ============================================

const StatCard = ({
  title,
  value,
  change,
  trend,
  href,
  icon: Icon,
  color = "primary",
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  href: string;
  icon: React.ElementType;
  color?: "primary" | "success" | "warning" | "destructive";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    destructive: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Link href={href}>
      <AnimatedDiv whileHover={{ y: -4, scale: 1.01 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group h-full"
      >
        <div className="flex justify-between items-start mb-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
          {trend !== "neutral" && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              trend === "up" ? "text-green-600" : "text-red-600"
            )}>
              {trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {change}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-1">{value}</h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      </AnimatedDiv>
    </Link>
  );
};

const QuickAction = ({ icon: Icon, label, href, color = "primary" }: { icon: React.ElementType; label: string; href: string; color?: string }) => (
  <Link href={href}>
    <AnimatedDiv whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 transition-all cursor-pointer group"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        color === "primary" && "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
        color === "success" && "bg-green-500/10 text-green-600 group-hover:bg-green-500 group-hover:text-white",
        color === "warning" && "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
        color === "destructive" && "bg-red-500/10 text-red-600 group-hover:bg-red-500 group-hover:text-white",
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-semibold text-center">{label}</span>
    </AnimatedDiv>
  </Link>
);

const ActivityItem = ({ icon: Icon, title, description, time, status }: { icon: React.ElementType; title: string; description: string; time: string; status?: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-sm truncate">{title}</p>
        {status && (
          <Badge variant={status === 'completed' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'} className="text-sm">
            {status}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
      <p className="text-xs text-muted-foreground mt-1">{time}</p>
    </div>
  </div>
);

// ============================================
// VIEWER/USER DASHBOARD
// ============================================

function UserDashboard() {
  const { user } = useAuth();
  const { orders = [] } = useOrders();
  const { projects = [] } = useProjects();
  const { subscription } = useSubscription();

  const firstName = user?.name?.split(' ')[0] || 'there';
  const activeOrders = orders.filter(o => o.status !== 'completed').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 border border-primary/20">
        <div className="relative z-10">
          <AnimatedDiv initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Here's what's happening with your account today.
            </p>
          </AnimatedDiv>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Orders"
          value={String(activeOrders)}
          change="Active"
          trend="neutral"
          href="/dashboard/orders"
          icon={ShoppingCart}
          color="primary"
        />
        <StatCard title="Active Services"
          value={String(projects.filter(p => p.status === 'In Progress').length)}
          change="In Progress"
          trend="neutral"
          href="/dashboard/projects"
          icon={Briefcase}
          color="success"
        />
        <StatCard title="Subscription"
          value={subscription?.plan || "Free"}
          change={subscription?.status === 'active' ? 'Active' : 'Inactive'}
          trend={subscription?.status === 'active' ? 'up' : 'down'}
          href="/dashboard/settings/billing"
          icon={CreditCard}
          color="warning"
        />
        <StatCard title="Completed"
          value={String(completedOrders)}
          change="Orders"
          trend="up"
          href="/dashboard/orders"
          icon={CheckCircle2}
          color="success"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Get things done faster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction icon={ShoppingCart} label="Browse Products" href="/shop" color="primary" />
              <QuickAction icon={Briefcase} label="Hire Service" href="/services" color="success" />
              <QuickAction icon={FileText} label="View Invoices" href="/dashboard/orders" color="warning" />
              <QuickAction icon={HelpCircle} label="Get Support" href="/dashboard/support" color="destructive" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.slice(0, 3).map((order, i) => (
              <ActivityItem key={order.id || i}
                icon={ShoppingCart}
                title={`Order #${order.id?.slice(-6) || i + 1}`}
                description={`$${order.total} - ${order.status}`}
                time={order.createdAt ? format(new Date(order.createdAt), 'MMM d, h:mm a') : 'Recently'}
                status={order.status}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// SUPPORT DASHBOARD
// ============================================

function SupportDashboard() {
  const { user } = useAuth();
  const { tickets = [], stats: ticketStats } = useTickets();
  const { orders = [] } = useOrders();

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const resolvedToday = tickets.filter(t => {
    if (t.status !== 'resolved') return false;
    const today = new Date();
    const resolved = new Date(t.resolvedAt || t.updatedAt);
    return resolved.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-8">
      {/* Support Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-background p-8 border border-blue-500/20">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500 text-white">
                <Headphones className="w-3 h-3 mr-1" />
                Support Portal
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">
              Support Dashboard
            </h1>
            <p className="text-muted-foreground max-w-xl mt-1">
              Manage tickets, assist customers, and resolve issues efficiently.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Agent</p>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <Avatar className="w-12 h-12 border-2 border-blue-500/30">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-blue-500 text-white">{user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Tickets"
          value={String(openTickets)}
          change={`${pendingTickets} pending`}
          trend={openTickets > 5 ? "up" : "neutral"}
          href="/dashboard/support"
          icon={Inbox}
          color="primary"
        />
        <StatCard title="Resolved Today"
          value={String(resolvedToday)}
          change="Tickets"
          trend="up"
          href="/dashboard/support"
          icon={CheckCircle2}
          color="success"
        />
        <StatCard title="Avg Response"
          value="2.5h"
          change="Target: 2h"
          trend="neutral"
          href="/dashboard/support/analytics"
          icon={Clock}
          color="warning"
        />
        <StatCard title="Satisfaction"
          value="94%"
          change="+2%"
          trend="up"
          href="/dashboard/reviews"
          icon={UserCheck}
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Priority Tickets
              </CardTitle>
              <CardDescription>High priority tickets requiring immediate attention</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/support/tickets">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets
                .filter(t => t.priority === 'high' || t.status === 'open')
                .slice(0, 5)
                .map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        ticket.priority === 'high' ? "bg-red-500" :
                        ticket.priority === 'medium' ? "bg-amber-500" : "bg-green-500"
                      )} />
                      <div>
                        <p className="font-semibold text-sm">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.customer?.name || 'Unknown'} • {ticket.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ticket.status === 'open' ? 'destructive' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                      <Button size="sm" asChild>
                        <Link href="/dashboard/support">
                          Respond
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              {tickets.filter(t => t.priority === 'high' || t.status === 'open').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All caught up! No priority tickets.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/support">
                <Ticket className="w-4 h-4 mr-2" />
                Open Support
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/users">
                <Users className="w-4 h-4 mr-2" />
                Find Customer
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/support">
                <FileText className="w-4 h-4 mr-2" />
                Knowledge Base
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// EDITOR/STAFF DASHBOARD
// ============================================

function StaffDashboard() {
  const { user } = useAuth();
  const { orders = [] } = useOrders();
  const { projects = [] } = useProjects();
  const { users = [] } = useUsers();
  
  const myProjects = projects.filter(p => p.userId === user?.id);
  const pendingApprovals = projects.filter(p => p.status === 'pending_review').length;
  const contentUpdates = myProjects.length;

  return (
    <div className="space-y-8">
      {/* Staff Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-background p-8 border border-purple-500/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-purple-500 text-white">
              <Edit3 className="w-3 h-3 mr-1" />
              Staff Portal
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold">
            Staff Dashboard
          </h1>
          <p className="text-muted-foreground max-w-xl mt-1">
            Manage content, projects, and collaborate with the team.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Projects"
          value={String(myProjects.length)}
          change="Assigned"
          trend="neutral"
          href="/dashboard/projects"
          icon={FolderKanban}
          color="primary"
        />
        <StatCard title="Pending Review"
          value={String(pendingApprovals)}
          change="Needs approval"
          trend={pendingApprovals > 0 ? "up" : "neutral"}
          href="/dashboard/projects"
          icon={FileText}
          color="warning"
        />
        <StatCard title="Content Updates"
          value={String(contentUpdates)}
          change="This week"
          trend="up"
          href="/dashboard/posts"
          icon={Edit3}
          color="success"
        />
        <StatCard title="Active Users"
          value={String(users.filter(u => u.isActive).length)}
          change="Total"
          trend="neutral"
          href="/dashboard/users"
          icon={Users}
          color="primary"
        />
      </div>

      {/* Content Management & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
              <CardDescription>Latest customer orders requiring attention</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/orders">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Order #{order.id?.slice(-6)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.name || 'Guest'} • ${Number(order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Staff Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/posts">
                <FileText className="w-4 h-4 mr-2" />
                Manage Pages
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/products">
                <Package className="w-4 h-4 mr-2" />
                Edit Products
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/projects">
                <FolderKanban className="w-4 h-4 mr-2" />
                View Projects
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/users">
                <Users className="w-4 h-4 mr-2" />
                Customer Lookup
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// ADMIN DASHBOARD
// ============================================

function AdminDashboard() {
  const { orders = [] } = useOrders();
  const { projects = [] } = useProjects();
  const { users = [] } = useUsers();
  const { stats: financeStats } = useFinance();
  const { tickets = [] } = useTickets();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = deriveChartDataFromOrders(orders);

  return (
    <div className="space-y-8">
      {/* Admin Header with Typewriter */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 border border-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary text-white">
              <Shield className="w-3 h-3 mr-1" />
              Admin Portal
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              {mounted && (
                <TypeAnimation sequence={[
                    "Welcome to Admin Control Center",
                    2000,
                    "Monitor system health",
                    2000,
                    "Manage users and content",
                    2000,
                    "Analyze performance metrics",
                    2000,
                  ]}
                  wrapper="h1"
                  className="text-3xl sm:text-3xl font-semibold"
                  repeat={Infinity}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"
          value={`$${financeStats?.totalRevenue?.toLocaleString() || '0'}`}
          change="+12%"
          trend="up"
          href="/dashboard/finance"
          icon={TrendingUp}
          color="success"
        />
        <StatCard title="Active Projects"
          value={String(projects.filter(p => p.status === 'In Progress').length)}
          change="On Track"
          trend="up"
          href="/dashboard/projects"
          icon={FolderKanban}
          color="primary"
        />
        <StatCard title="Total Orders"
          value={String(orders.length)}
          change="This month"
          trend="up"
          href="/dashboard/orders"
          icon={ShoppingCart}
          color="warning"
        />
        <StatCard title="Users"
          value={String(users.length)}
          change="+5 new"
          trend="up"
          href="/dashboard/users"
          icon={Users}
          color="primary"
        />
      </div>

      {/* Revenue Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
            <CardDescription>Last 7 days revenue and orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone"
                    dataKey="pv"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Admin Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/dashboard/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/settings/system">
                <Shield className="w-4 h-4 mr-2" />
                System Settings
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/finance">
                <DollarSign className="w-4 h-4 mr-2" />
                Finance Overview
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/content">
                <FileText className="w-4 h-4 mr-2" />
                Content Management
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// MAIN ENTRY POINT
// ============================================

export default function DashboardHome() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const role = user?.role;

  // Route to appropriate dashboard based on role
  switch (role) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.EDITOR:
      return <StaffDashboard />;
    case ROLES.SUPPORT:
      return <SupportDashboard />;
    case ROLES.VIEWER:
    default:
      return <UserDashboard />;
  }
}
