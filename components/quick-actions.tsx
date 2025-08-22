import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText, Calendar, DollarSign, BookOpen, MessageSquare } from "lucide-react"

const actions = [
  {
    title: "Add Student",
    description: "Register new student",
    icon: UserPlus,
    color: "bg-primary",
  },
  {
    title: "Generate Report",
    description: "Create academic report",
    icon: FileText,
    color: "bg-secondary",
  },
  {
    title: "Schedule Event",
    description: "Add to calendar",
    icon: Calendar,
    color: "bg-accent",
  },
  {
    title: "Process Payment",
    description: "Handle fee collection",
    icon: DollarSign,
    color: "bg-chart-1",
  },
  {
    title: "Manage Courses",
    description: "Update curriculum",
    icon: BookOpen,
    color: "bg-chart-2",
  },
  {
    title: "Send Notice",
    description: "Broadcast message",
    icon: MessageSquare,
    color: "bg-chart-3",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50 bg-transparent"
            >
              <div className={`p-2 rounded-lg ${action.color} text-white`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
