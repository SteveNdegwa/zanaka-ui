"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, Wallet, Plus } from "lucide-react"
import Link from "next/link"
import { financeRequests, PettyCashFund } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

export default function EditPettyCashPage() {
  const router = useRouter()
  const params = useParams()
  const fundId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [fund, setFund] = useState<PettyCashFund | null>(null)
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [showReplenishConfirm, setShowReplenishConfirm] = useState(false)

  const fetchFund = async () => {
    setLoading(true)
    try {
      const response = await financeRequests.viewPettyCashFund(fundId)
      if (response.success && response.data) {
        setFund(response.data)
      }
    } catch (error) {
      toast.error("Failed to load fund")
      router.push("/finance/petty-cash")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFund()
  }, [fundId, router, toast])

  const handleReplenishConfirm = async () => {
    setProcessing(true)
    try {
      const response = await financeRequests.replenishPettyCash(fundId, {
        amount: parseFloat(amount),
        notes: notes.trim() || undefined,
      })
      if (response.success) {
        toast.success("Fund replenished successfully!")
        await fetchFund() // Re-fetch updated data
        setAmount("")
        setNotes("")
      } else {
        toast.error("Failed to replenish fund", { description: response.error })
      }
    } catch (err) {
      toast.error("Failed to replenish fund")
    } finally {
      setProcessing(false)
      setShowReplenishConfirm(false)
    }
  }

  const handleClose = async () => {
    setProcessing(true)
    try {
      const response = await financeRequests.closePettyCashFund(fundId)
      if (response.success) {
        toast.success("Fund closed successfully")
        router.push("/finance/petty-cash")
      } else {
        toast.error("Failed to close fund", { description: response.error })
      }
    } catch (err) {
      toast.error("Failed to close fund")
    } finally {
      setProcessing(false)
    }
  }

  const handleReopen = async () => {
    setProcessing(true)
    try {
      const response = await financeRequests.reopenPettyCashFund(fundId)
      if (response.success) {
        toast.success("Fund reopened successfully")
        await fetchFund() // Re-fetch updated data
      } else {
        toast.error("Failed to reopen fund", { description: response.error })
      }
    } catch (err) {
      toast.error("Failed to reopen fund")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading fund...</span>
      </div>
    )
  }

  if (!fund) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Fund not found</div>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href={`/finance/petty-cash/${fundId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fund
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Manage {fund.fund_name}</h1>
            <p className="text-muted-foreground mt-2">Replenish or change fund status</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-primary" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    KSh {parseFloat(fund.current_balance).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Custodian</p>
                  <p className="text-lg">{fund.custodian_full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={fund.status === "ACTIVE" ? "default" : fund.status === "CLOSED" ? "destructive" : "secondary"}>
                    {fund.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {fund.status === "ACTIVE" && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Replenish Fund</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="amount">Amount to Add (KSh) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Reason for replenishment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowReplenishConfirm(true)}
                    disabled={processing || !amount || parseFloat(amount) <= 0}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Replenish Fund
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            {fund.status === "ACTIVE" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={processing}>
                    Close Fund
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close Petty Cash Fund?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This fund will be marked as closed and no longer available for transactions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClose} disabled={processing}>
                      {processing ? "Closing..." : "Close Fund"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {fund.status === "CLOSED" && (
              <Button onClick={handleReopen} disabled={processing}>
                {processing ? "Reopening..." : "Reopen Fund"}
              </Button>
            )}
          </div>

          {/* Replenish Confirmation Dialog */}
          <AlertDialog open={showReplenishConfirm} onOpenChange={setShowReplenishConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Replenishment</AlertDialogTitle>
                <AlertDialogDescription>
                  <p>Add <strong>KSh {parseFloat(amount).toLocaleString()}</strong> to {fund.fund_name}?</p>
                  {notes.trim() && <p className="mt-3 italic">Notes: {notes.trim()}</p>}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReplenishConfirm} disabled={processing}>
                  {processing ? "Processing..." : "Yes, Replenish"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}