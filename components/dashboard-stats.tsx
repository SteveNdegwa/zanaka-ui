import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Clock,
  Building,
  Receipt,
  CreditCard,
} from "lucide-react"
import { StatsCard } from "./stats-card"
import { BranchSelector } from "./branch-selector"

export function DashboardStats() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">School Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Key metrics across all campuses</p>
        </div>
        <BranchSelector className="w-full sm:w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="3,210"
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          description="Across all 4 active branches"
        />
        <StatsCard
          title="Monthly Revenue"
          value="$125,431"
          change="+8% from last month"
          changeType="positive"
          icon={DollarSign}
          description="Tuition and fees collected"
        />
        <StatsCard
          title="Attendance Rate"
          value="94.2%"
          change="+2.1% from last week"
          changeType="positive"
          icon={TrendingUp}
          description="Average across all branches"
        />
        <StatsCard
          title="Overdue Payments"
          value="47"
          change="-8 from last week"
          changeType="positive"
          icon={AlertTriangle}
          description="Students with pending fees"
        />
        <StatsCard
          title="Monthly Expenses"
          value="$45,600"
          change="+12% from last month"
          changeType="negative"
          icon={Receipt}
          description="Operational costs this month"
        />
        <StatsCard
          title="Pending Invoices"
          value="23"
          change="5 due this week"
          changeType="negative"
          icon={CreditCard}
          description="Unpaid student invoices"
        />
        <StatsCard
          title="Active Branches"
          value="4"
          change="1 under construction"
          changeType="neutral"
          icon={Building}
          description="Operational campuses"
        />
        <StatsCard
          title="Total Classes"
          value="300"
          change="15 new classes added"
          changeType="positive"
          icon={BookOpen}
          description="Currently running classes"
        />
        <StatsCard
          title="Faculty Members"
          value="220"
          change="+8 new hires"
          changeType="positive"
          icon={GraduationCap}
          description="Active teaching staff"
        />
        <StatsCard
          title="Pending Tasks"
          value="18"
          change="5 high priority"
          changeType="negative"
          icon={Clock}
          description="Administrative tasks"
        />
      </div>
    </div>
  )
}
