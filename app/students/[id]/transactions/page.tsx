"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Receipt,
  CreditCard,
  Eye,
} from "lucide-react"

// Mock transaction data
const transactionData = [
  {
    id: "TXN-001",
    date: "2024-01-15",
    type: "payment",
    description: "Payment for Tuition Fee - January",
    amount: 2500,
    balance: 10000,
    method: "Bank Transfer",
    reference: "TXN123456",
    invoiceId: "INV-001",
  },
  {
    id: "TXN-002",
    date: "2024-01-01",
    type: "invoice",
    description: "Tuition Fee - January",
    amount: -2500,
    balance: 12500,
    method: "Invoice",
    reference: "INV-001",
    invoiceId: "INV-001",
  },
  {
    id: "TXN-003",
    date: "2024-02-01",
    type: "invoice",
    description: "Activity Fee - February",
    amount: -1500,
    balance: 14000,
    method: "Invoice",
    reference: "INV-002",
    invoiceId: "INV-002",
  },
  {
    id: "TXN-004",
    date: "2024-02-15",
    type: "invoice",
    description: "Lab Fee - February",
    amount: -2000,
    balance: 15500,
    method: "Invoice",
    reference: "INV-003",
    invoiceId: "INV-003",
  },
  {
    id: "TXN-005",
    date: "2023-12-15",
    type: "payment",
    description: "Payment for December Fees",
    amount: 3000,
    balance: 8500,
    method: "Cash",
    reference: "CASH001",
    invoiceId: null,
  },
]

export default function StudentTransactionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [dateFilter, setDateFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredTransactions, setFilteredTransactions] = useState(transactionData)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const getTransactionIcon = (type: string) => {
    return type === "payment" ? (
      <CreditCard className="w-4 h-4 text-green-600" />
    ) : (
      <Receipt className="w-4 h-4 text-blue-600" />
    )
  }

  const getTransactionBadge = (type: string) => {
    return type === "payment" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Payment
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Invoice
      </Badge>
    )
  }

  const getAmountDisplay = (amount: number, type: string) => {
    const isPositive = amount > 0
    const displayAmount = Math.abs(amount)

    return (
      <div className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        <span className="font-medium">
          {isPositive ? "+" : "-"}${displayAmount.toLocaleString()}
        </span>
      </div>
    )
  }

  const generateReport = () => {
    // In real app, this would generate and download a PDF report
    console.log("Generating transaction report...")
  }

  const totalInvoices = filteredTransactions
    .filter((t) => t.type === "invoice")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalPayments = filteredTransactions.filter((t) => t.type === "payment").reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = totalInvoices - totalPayments

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <MainContent>
        <DashboardHeader />

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => router.push(`/students/${params.id}`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Transaction Report</h1>
                  <p className="text-muted-foreground">Complete financial transaction history</p>
                </div>
              </div>
              <Button onClick={generateReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Invoiced</p>
                      <p className="text-2xl font-bold text-red-600">${totalInvoices.toLocaleString()}</p>
                    </div>
                    <Receipt className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                      <p className="text-2xl font-bold text-green-600">${totalPayments.toLocaleString()}</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                      <p className={`text-2xl font-bold ${currentBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                        ${Math.abs(currentBalance).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="dateFilter">Date Range</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                        <SelectItem value="lastYear">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="typeFilter">Transaction Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="invoice">Invoices Only</SelectItem>
                        <SelectItem value="payment">Payments Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amountFrom">Amount From</Label>
                    <Input id="amountFrom" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="amountTo">Amount To</Label>
                    <Input id="amountTo" type="number" placeholder="10000" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Running Balance</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTransactionIcon(transaction.type)}
                              {getTransactionBadge(transaction.type)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              {transaction.invoiceId && (
                                <p className="text-xs text-muted-foreground">Ref: {transaction.invoiceId}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getAmountDisplay(transaction.amount, transaction.type)}</TableCell>
                          <TableCell>
                            <span className="font-medium">${transaction.balance.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>{transaction.method}</TableCell>
                          <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(transaction)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Transaction Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for transaction {transaction.id}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                  {/* Transaction Overview */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">
                                        Transaction ID
                                      </Label>
                                      <p className="font-mono text-sm">{transaction.id}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                                      <p>{new Date(transaction.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                                      <div className="flex items-center space-x-2 mt-1">
                                        {getTransactionIcon(transaction.type)}
                                        {getTransactionBadge(transaction.type)}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                                      {getAmountDisplay(transaction.amount, transaction.type)}
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="mt-1">{transaction.description}</p>
                                  </div>

                                  {/* Payment Details */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">
                                        Payment Method
                                      </Label>
                                      <p>{transaction.method}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Reference</Label>
                                      <p className="font-mono text-sm">{transaction.reference}</p>
                                    </div>
                                  </div>

                                  {/* Balance Information */}
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Running Balance
                                        </Label>
                                        <p className="text-lg font-semibold">${transaction.balance.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Balance Change
                                        </Label>
                                        {getAmountDisplay(transaction.amount, transaction.type)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Related Invoice */}
                                  {transaction.invoiceId && (
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">
                                        Related Invoice
                                      </Label>
                                      <div className="flex items-center justify-between mt-1 p-3 bg-muted/30 rounded-lg">
                                        <span className="font-mono text-sm">{transaction.invoiceId}</span>
                                        <Button variant="outline" size="sm">
                                          View Invoice
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Additional Information */}
                                  <div className="pt-4 border-t">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Additional Information
                                    </Label>
                                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                      <p>
                                        • Transaction processed on {new Date(transaction.date).toLocaleDateString()}
                                      </p>
                                      <p>• Payment method: {transaction.method}</p>
                                      {transaction.type === "payment" && <p>• Payment reduces outstanding balance</p>}
                                      {transaction.type === "invoice" && <p>• Invoice increases outstanding balance</p>}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </MainContent>
    </div>
  )
}
