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
import { Loader2, Search, UserPlus, Eye } from "lucide-react"
import Link from "next/link"
import { financeRequests, Vendor } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

export default function VendorListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.listVendors({
          search_term: searchTerm || undefined,
        })
        if (response.success && response.data) {
          setVendors(response.data)
        }
      } catch (error) {
        toast.error("Failed to load vendors")
      } finally {
        setLoading(false)
      }
    }
    fetchVendors()
  }, [searchTerm, toast])

  const formatContactDetails = (vendor: Vendor) => {
    const parts = []
    if (vendor.email) parts.push(vendor.email)
    if (vendor.phone) parts.push(vendor.phone)
    return parts.length > 0 ? parts.join(" • ") : "—"
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
                <h1 className="text-4xl font-bold text-foreground">Vendors</h1>
                <p className="text-muted-foreground mt-2">Manage school suppliers and service providers</p>
              </div>
              <Button onClick={() => router.push("/finance/vendors/create")} className="shadow-lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Vendor
              </Button>
            </div>

            {/* Search Only */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name, contact person, email, phone, or KRA PIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vendors Table */}
            <Card>
              <CardHeader>
                <CardTitle>Vendors ({vendors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">No vendors found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor Name</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Contact Details</TableHead>
                          <TableHead>KRA PIN</TableHead>
                          <TableHead>Payment Terms</TableHead>
                          <TableHead>Total Paid (All Time)</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors.map((vendor) => (
                          <TableRow key={vendor.id}>
                            <TableCell className="font-medium">
                              {vendor.name}
                            </TableCell>
                            <TableCell>
                              {vendor.contact_person || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatContactDetails(vendor)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {vendor.kra_pin || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {vendor.payment_terms.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              KSh {parseFloat(vendor.total_paid_all_time.toString()).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/finance/vendors/${vendor.id}`)}
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