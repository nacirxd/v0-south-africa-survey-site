"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, MapPin, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileManagementProps {
  user: any
  profile: any
}

export default function ProfileManagement({ user, profile }: ProfileManagementProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [country, setCountry] = useState(profile?.country || "South Africa")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          country,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      alert("Profile updated successfully!")
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Profile Management</h1>
        <p className="text-blue-100">Manage your account settings and personal information.</p>
      </div>

      {/* Profile Information */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Personal Information</CardTitle>
          <CardDescription className="text-blue-700">
            Update your profile details and account preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Email Address</label>
              <Input defaultValue={user?.email || ""} disabled className="border-blue-200 bg-gray-50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Country</label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Member Since</label>
              <Input
                defaultValue={new Date(profile?.created_at || "").toLocaleDateString()}
                disabled
                className="border-blue-200 bg-gray-50"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Account Statistics</CardTitle>
          <CardDescription className="text-blue-700">Overview of your account activity and earnings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">${(profile?.total_earnings || 0).toFixed(2)}</div>
              <div className="text-sm text-blue-600">Total Earnings</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">${(profile?.available_balance || 0).toFixed(2)}</div>
              <div className="text-sm text-green-600">Available Balance</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">${(profile?.withdrawn_amount || 0).toFixed(2)}</div>
              <div className="text-sm text-orange-600">Total Withdrawn</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
