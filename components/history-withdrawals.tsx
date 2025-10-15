"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { History, DollarSign, Clock, CreditCard, Building2, Smartphone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface HistoryAndWithdrawalsProps {
  userId: string
}

export default function HistoryAndWithdrawals({ userId }: HistoryAndWithdrawalsProps) {
  const [availableBalance, setAvailableBalance] = useState(0)
  const [earningsHistory, setEarningsHistory] = useState<any[]>([])
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentDetails, setPaymentDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    branchCode: "",
    mobileNumber: "",
  })

  const supabase = createClient()
  const MINIMUM_WITHDRAWAL = 200

  const paymentMethods = [
    { value: "eft", label: "EFT - Electronic Funds Transfer", icon: Building2 },
    { value: "capitec", label: "Capitec Bank", icon: Building2 },
    { value: "fnb", label: "First National Bank (FNB)", icon: Building2 },
    { value: "standard", label: "Standard Bank", icon: Building2 },
    { value: "absa", label: "ABSA Bank", icon: Building2 },
    { value: "nedbank", label: "Nedbank", icon: Building2 },
    { value: "mtn_money", label: "MTN Money", icon: Smartphone },
  ]

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      // Fetch available balance
      const { data: profile } = await supabase.from("profiles").select("available_balance").eq("id", userId).single()

      if (profile) {
        setAvailableBalance(profile.available_balance || 0)
      }

      // Fetch earnings history
      const { data: earnings } = await supabase
        .from("earnings_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      setEarningsHistory(earnings || [])

      // Fetch withdrawal history
      const { data: withdrawals } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      setWithdrawalHistory(withdrawals || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const amount = Number.parseFloat(withdrawalAmount)

      if (amount < MINIMUM_WITHDRAWAL) {
        alert(`Minimum withdrawal amount is $${MINIMUM_WITHDRAWAL}`)
        return
      }

      if (amount > availableBalance) {
        alert("Insufficient balance")
        return
      }

      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending",
      })

      if (error) throw error

      alert("Withdrawal request submitted successfully!")
      setWithdrawalAmount("")
      setPaymentMethod("")
      setPaymentDetails({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        branchCode: "",
        mobileNumber: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error submitting withdrawal:", error)
      alert("Error submitting withdrawal request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPaymentFields = () => {
    if (!paymentMethod) return null

    if (paymentMethod === "mtn_money") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="mobileNumber">MTN Mobile Number</Label>
            <Input
              id="mobileNumber"
              placeholder="e.g., +27 82 123 4567"
              value={paymentDetails.mobileNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileNumber: e.target.value })}
              required
            />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="accountHolder">Account Holder Name</Label>
          <Input
            id="accountHolder"
            placeholder="Full name as on bank account"
            value={paymentDetails.accountHolder}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, accountHolder: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            placeholder="Bank account number"
            value={paymentDetails.accountNumber}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="branchCode">Branch Code</Label>
          <Input
            id="branchCode"
            placeholder="6-digit branch code"
            value={paymentDetails.branchCode}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, branchCode: e.target.value })}
            required
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">History & Withdrawals</h1>
        <p className="text-blue-100">Track your earnings history and manage withdrawal requests.</p>
      </div>

      <Tabs defaultValue="withdraw" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="withdraw">Request Withdrawal</TabsTrigger>
          <TabsTrigger value="earnings">Earnings History</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Request Withdrawal</CardTitle>
              <CardDescription className="text-blue-700">
                Withdraw your available balance using South African payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Available Balance:</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-bold text-green-600">${availableBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {availableBalance >= MINIMUM_WITHDRAWAL ? (
                <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={MINIMUM_WITHDRAWAL}
                      max={availableBalance}
                      step="0.01"
                      placeholder={`Minimum $${MINIMUM_WITHDRAWAL}`}
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a South African payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => {
                          const Icon = method.icon
                          return (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4" />
                                <span>{method.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {renderPaymentFields()}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Processing..." : "Submit Withdrawal Request"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Minimum Balance Required</h3>
                  <p className="text-blue-600 mb-4">
                    You need at least ${MINIMUM_WITHDRAWAL} to request a withdrawal. Complete more surveys to reach the
                    minimum balance.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Complete More Surveys</Button>
                </div>
              )}

              <p className="text-xs text-blue-600 mt-4">
                • Minimum withdrawal: ${MINIMUM_WITHDRAWAL} • Processing time: 3-5 business days • All payments are
                processed in USD and converted to ZAR at current exchange rates
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Earnings History</CardTitle>
              <CardDescription className="text-blue-700">
                Your complete earnings and transaction history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earningsHistory.length > 0 ? (
                <div className="space-y-4">
                  {earningsHistory.map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div>
                        <p className="font-medium text-green-900">{earning.task_title}</p>
                        <p className="text-sm text-green-600">
                          {new Date(earning.created_at).toLocaleDateString("en-ZA")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+${earning.amount}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {earning.earning_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">No Earnings Yet</h3>
                  <p className="text-blue-600 mb-4">Complete your first survey to start earning!</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Start Earning Now</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Withdrawal History</CardTitle>
              <CardDescription className="text-blue-700">
                Track your withdrawal requests and payment status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalHistory.length > 0 ? (
                <div className="space-y-4">
                  {withdrawalHistory.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div>
                        <p className="font-medium text-blue-900">${withdrawal.amount} withdrawal</p>
                        <p className="text-sm text-blue-600">
                          {new Date(withdrawal.created_at).toLocaleDateString("en-ZA")} • {withdrawal.payment_method}
                        </p>
                      </div>
                      <Badge
                        variant={withdrawal.status === "completed" ? "default" : "secondary"}
                        className={
                          withdrawal.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : withdrawal.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">No Withdrawals Yet</h3>
                  <p className="text-blue-600">
                    Your withdrawal history will appear here once you make your first request.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
