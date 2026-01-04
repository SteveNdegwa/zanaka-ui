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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, Building, User, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { financeRequests, Vendor, VendorPaymentTerm } from "@/lib/requests/finances"
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

export default function EditVendorPage() {
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [vendor, setVendor] = useState<Vendor | null>(null)

  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [kraPin, setKraPin] = useState("")
  const [paymentTerms, setPaymentTerms] = useState<VendorPaymentTerm | "">("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.viewVendor(vendorId)
        if (response.success && response.data) {
          const v = response.data
          setVendor(v)
          setName(v.name)
          setContactPerson(v.contact_person)
          setEmail(v.email)
          setPhone(v.phone)
          setKraPin(v.kra_pin)
          setPaymentTerms(v.payment_terms)
          setNotes(v.notes)
        }
      } catch (error) {
        toast.error("Failed to load vendor")
        router.push("/finance/vendors")
      } finally {
        setLoading(false)
      }
    }
    fetchVendor()
  }, [vendorId, router, toast])

  const handleUpdate = async () => {
    if (!name.trim() || !paymentTerms) {
      toast.error("Vendor name and payment terms are required")
      return
    }

    setSaving(true)
    try {
      await financeRequests.updateVendor(vendorId, {
        name: name.trim(),
        contact_person: contactPerson.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        kra_pin: kraPin.trim() || undefined,
        payment_terms: paymentTerms as VendorPaymentTerm,
        notes: notes.trim() || undefined,
      })
      toast.success("Vendor updated successfully!")
      router.push(`/finance/vendors/${vendorId}`)
    } catch (err) {
      toast.error("Failed to update vendor")
    } finally {
      setSaving(false)
      setShowConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading vendor...</span>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Vendor not found</div>
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
            <Link href={`/finance/vendors/${vendorId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vendor
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Edit Vendor</h1>
            <p className="text-muted-foreground mt-2">Update vendor information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="w-6 h-6 text-primary" />
                {vendor.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Vendor Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="contact">Contact Person</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contact"
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="kra">KRA PIN</Label>
                <Input id="kra" value={kraPin} onChange={(e) => setKraPin(e.target.value)} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="terms">Payment Terms *</Label>
                <Select value={paymentTerms} onValueChange={(v) => setPaymentTerms(v as VendorPaymentTerm)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-32"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/finance/vendors/${vendorId}`}>
                  <Button variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={saving || !name.trim() || !paymentTerms}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save Changes?</AlertDialogTitle>
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
                <AlertDialogAction onClick={handleUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Yes, Save Changes"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}