"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Wallet, Eye } from "lucide-react"
import Link from "next/link"
import { financeRequests, PettyCashFund } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

export default function PettyCashListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [funds, setFunds] = useState<PettyCashFund[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchFunds = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.listPettyCashFunds({
          search_term: searchTerm || undefined,
        })
        if (response.success && response.data) {
          setFunds(response.data)
        }
      } catch (error) {
        toast.error("Failed to load petty cash funds")
      } finally {
        setLoading(false)
      }
    }
    fetchFunds()
  }, [searchTerm, toast])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default"
      case "SUSPENDED": return "secondary"
      case "CLOSED": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MainContent>
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Petty Cash</h1>
                <p className="text-muted-foreground mt-2">Manage petty cash funds and transactions</p>
              </div>
              <Button onClick={() => router.push("/finance/petty-cash/create")} className="shadow-lg">
                <Wallet className="w-5 h-5 mr-2" />
                Create Fund
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by fund name or custodian..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Funds Table */}
            <Card>
              <CardHeader>
                <CardTitle>Petty Cash Funds ({funds.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : funds.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">No petty cash funds found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fund Name</TableHead>
                          <TableHead>Custodian</TableHead>
                          <TableHead>Initial Amount</TableHead>
                          <TableHead>Current Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {funds.map((fund) => (
                          <TableRow key={fund.id}>
                            <TableCell className="font-medium">{fund.fund_name}</TableCell>
                            <TableCell>{fund.custodian_full_name}</TableCell>
                            <TableCell>KSh {parseFloat(fund.initial_amount).toLocaleString()}</TableCell>
                            <TableCell className="font-semibold">
                              KSh {parseFloat(fund.current_balance).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(fund.status)}>
                                {fund.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/finance/petty-cash/${fund.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </MainContent>
    </div>
  )
}