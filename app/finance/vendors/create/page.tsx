"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, Building, User, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { financeRequests, VendorPaymentTerm } from "@/lib/requests/finances"
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
} from "@/components/ui/alert-dialog"

export default function CreateVendorPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [kraPin, setKraPin] = useState("")
  const [paymentTerms, setPaymentTerms] = useState<VendorPaymentTerm | "">("")
  const [notes, setNotes] = useState("")

  const handleCreate = async () => {
    if (!name.trim() || !paymentTerms) {
      toast.error("Vendor name and payment terms are required")
      return
    }

    setLoading(true)
    try {
      await financeRequests.createVendor({
        name: name.trim(),
        contact_person: contactPerson.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        kra_pin: kraPin.trim() || undefined,
        payment_terms: paymentTerms as VendorPaymentTerm,
        notes: notes.trim() || undefined,
      })
      toast.success("Vendor created successfully!")
      router.push("/finance/vendors")
    } catch (err) {
      toast.error("Failed to create vendor")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href="/finance/vendors">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vendors
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Add New Vendor</h1>
            <p className="text-muted-foreground mt-2">Register a new supplier or service provider</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="w-6 h-6 text-primary" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme Supplies Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Person</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contact"
                    placeholder="John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vendor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+254 700 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="kra">KRA PIN</Label>
                <Input
                  id="kra"
                  placeholder="A123456789B"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="terms">Payment Terms *</Label>
                <Select value={paymentTerms} onValueChange={(v) => setPaymentTerms(v as VendorPaymentTerm)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                    <SelectItem value="NET_7">Net 7 Days</SelectItem>
                    <SelectItem value="NET_15">Net 15 Days</SelectItem>
                    <SelectItem value="NET_30">Net 30 Days</SelectItem>
                    <SelectItem value="NET_60">Net 60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this vendor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-32"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/finance/vendors">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || !name.trim() || !paymentTerms}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Vendor"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Vendor?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p className="text-lg font-medium">{name.trim()}</p>
                  <div className="bg-muted/50 rounded-lg p-5 space-y-3 text-sm">
                    {contactPerson && (
                      <div className="flex justify-between">
                        <span className="font-medium">Contact Person:</span>
                        <span>{contactPerson}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{email}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex justify-between">
                        <span className="font-medium">Phone:</span>
                        <span>{phone}</span>
                      </div>
                    )}
                    {kraPin && (
                      <div className="flex justify-between">
                        <span className="font-medium">KRA PIN:</span>
                        <span>{kraPin}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Terms:</span>
                      <span>{paymentTerms.replace("_", " ")}</span>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Yes, Create Vendor"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}