import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, CheckSquare, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

interface DashboardOverviewProps {
  stats: {
    totalEarnings: number
    availableBalance: number
    todayTasksCompleted: number
    availableTasks: number
  }
}

export default function DashboardOverview({ stats }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-blue-100">
          Track your earnings and complete daily tasks to maximize your income from South African surveys.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-blue-600 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${stats.availableBalance.toFixed(2)}</div>
            <p className="text-xs text-blue-600 mt-1">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Today's Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.todayTasksCompleted}</div>
            <p className="text-xs text-blue-600 mt-1">Completed today</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Available Tasks</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.availableTasks}</div>
            <p className="text-xs text-blue-600 mt-1">Ready to complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Quick Actions</CardTitle>
            <CardDescription className="text-blue-700">Get started with your daily earning activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/tasks">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <CheckSquare className="w-4 h-4 mr-2" />
                View Available Tasks
              </Button>
            </Link>
            <Link href="/dashboard/history">
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Request Withdrawal
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Earning Potential</CardTitle>
            <CardDescription className="text-blue-700">Your daily earning opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Per Task Range:</span>
              <span className="font-bold text-green-600">$0.60 - $1.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Daily Potential:</span>
              <span className="font-bold text-green-600">$8.00 - $12.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Available Tasks:</span>
              <span className="font-bold text-blue-900">{stats.availableTasks}</span>
            </div>
            <div className="pt-2 border-t border-blue-100">
              <p className="text-xs text-blue-600">
                Complete surveys about South African culture, economy, and lifestyle to earn USD.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Recent Activity</CardTitle>
          <CardDescription className="text-blue-700">Your latest survey completions and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-blue-600">
            <Clock className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <p className="text-sm">Complete your first task to see activity here</p>
            <Link href="/dashboard/tasks">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Start Earning Now</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
