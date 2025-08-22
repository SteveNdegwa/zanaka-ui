import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { MainContent } from "@/components/main-content"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <MainContent>
        <DashboardHeader />

        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening at your school today.</p>
          </div>

          <div className="space-y-8">
            <DashboardStats />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  )
}
