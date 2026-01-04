"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Wallet, Edit } from "lucide-react"
import Link from "next/link"
import { financeRequests, PettyCashFund, PettyCashTransaction } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

export default function ViewPettyCashPage() {
  const router = useRouter()
  const params = useParams()
  const fundId = params.id as string
  const { toast } = useToast()

  const [fund, setFund] = useState<PettyCashFund | null>(null)
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  useEffect(() => {
    const fetchFund = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.viewPettyCashFund(fundId)
        if (response.success && response.data) {
          setFund(response.data)
          setTransactions(response.data.recent_transactions)
        }
      } catch (error) {
        toast.error("Failed to load fund")
        router.push("/finance/petty-cash")
      } finally {
        setLoading(false)
        setTransactionsLoading(false)
      }
    }
    fetchFund()
  }, [fundId, router, toast])

  const getTypeVariant = (type: string) => {
    return type === "REPLENISHMENT" ? "default" : "secondary"
  }

  const formatAmount = (amount: string) => `KSh ${parseFloat(amount).toLocaleString()}`

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
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="mb-8">
            <Link href="/finance/petty-cash">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Petty Cash
              </Button>
            </Link>
          </div>

          <Card className="mb-10 border-2 shadow-md">
            <CardContent className="pt-10 pb-12">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
                <div className="flex items-start gap-8">
                  <div className="p-6 bg-primary/10 rounded-xl">
                    <Wallet className="w-16 h-16 text-primary" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{fund.fund_name}</h1>
                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant={fund.status === "ACTIVE" ? "default" : fund.status === "CLOSED" ? "destructive" : "secondary"}>
                          {fund.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Custodian</p>
                        <p className="text-md">{fund.custodian_full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Initial Amount</p>
                        <p className="text-md">{formatAmount(fund.initial_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatAmount(fund.current_balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:self-start">
                  <Link href={`/finance/petty-cash/${fund.id}/edit`}>
                    <Button size="lg" variant="outline" className="w-full shadow-md">
                      <Edit className="w-5 h-5 mr-2" />
                      Manage Fund
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-md text-muted-foreground">No transactions recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Balance Before</TableHead>
                        <TableHead>Balance After</TableHead>
                        <TableHead>Processed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={getTypeVariant(tx.transaction_type)}>
                              {tx.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{tx.description || "—"}</TableCell>
                          <TableCell className="font-semibold">{formatAmount(tx.amount)}</TableCell>
                          <TableCell>{formatAmount(tx.balance_before)}</TableCell>
                          <TableCell>{formatAmount(tx.balance_after)}</TableCell>
                          <TableCell>{tx.processed_by_full_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainContent>
    </>
  )
}