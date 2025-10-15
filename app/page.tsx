import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Globe, Shield } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-blue-900">Global Survey Rewards</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>Worldwide Platform</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            Share Your <span className="text-blue-600">Global</span> Insights
          </h1>
          <p className="text-xl text-blue-700 mb-8 max-w-2xl mx-auto">
            Contribute to meaningful research about global culture, economy, and lifestyle. Join our professional survey
            platform and get rewarded for your valuable insights from anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Sign Up
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Why Choose Global Survey Rewards?</h2>
            <p className="text-lg text-blue-700">
              Professional platform designed for global insights from participants worldwide
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-blue-900">Rewarding Experience</CardTitle>
                <CardDescription className="text-blue-700">
                  Get fairly compensated for your time and valuable insights with our transparent reward system
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-blue-900">Global Reach</CardTitle>
                <CardDescription className="text-blue-700">
                  Surveys about global culture, trends, and lifestyle from participants around the world
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-blue-900">Secure Platform</CardTitle>
                <CardDescription className="text-blue-700">
                  Professional, secure platform with reliable USD payments
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Platform Excellence</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-100 mb-2">Professional</div>
              <div className="text-blue-200">Survey Platform</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-100 mb-2">Secure</div>
              <div className="text-blue-200">Payment System</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-100 mb-2">Worldwide</div>
              <div className="text-blue-200">Global Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Ready to Contribute?</h2>
          <p className="text-lg text-blue-700 mb-8">
            Join our global community sharing valuable insights through our professional survey platform
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Global Survey Rewards</span>
          </div>
          <p className="text-blue-300">Professional survey platform for global insights from participants worldwide</p>
        </div>
      </footer>
    </div>
  )
}
