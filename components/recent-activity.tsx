import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    user: "Sarah Johnson",
    action: "submitted assignment",
    subject: "Mathematics",
    time: "2 minutes ago",
    avatar: "/student-sarah.png",
    type: "assignment",
  },
  {
    id: 2,
    user: "Michael Chen",
    action: "marked attendance",
    subject: "Physics Class",
    time: "15 minutes ago",
    avatar: "/teacher-michael.png",
    type: "attendance",
  },
  {
    id: 3,
    user: "Emma Davis",
    action: "paid tuition fee",
    subject: "$1,200",
    time: "1 hour ago",
    avatar: "/student-emma.png",
    type: "payment",
  },
  {
    id: 4,
    user: "David Wilson",
    action: "scheduled parent meeting",
    subject: "Grade 10A",
    time: "2 hours ago",
    avatar: "/teacher-david.png",
    type: "meeting",
  },
  {
    id: 5,
    user: "Lisa Brown",
    action: "updated course material",
    subject: "Chemistry",
    time: "3 hours ago",
    avatar: "/friendly-teacher.png",
    type: "course",
  },
]

const getBadgeVariant = (type: string) => {
  switch (type) {
    case "assignment":
      return "default"
    case "attendance":
      return "secondary"
    case "payment":
      return "outline"
    case "meeting":
      return "destructive"
    case "course":
      return "secondary"
    default:
      return "default"
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                <AvatarFallback>
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{activity.user}</p>
                  <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action} • {activity.subject}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
