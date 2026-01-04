"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Wallet, Check, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { financeRequests } from "@/lib/requests/finances"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { UserProfile, usersRequests } from "@/lib/requests/users"


export default function CreatePettyCashPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)

  const [fundName, setFundName] = useState("")
  const [initialAmount, setInitialAmount] = useState("")
  const [custodian, setCustodian] = useState<UserProfile | null>(null)
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true)
      try {
        const response = await usersRequests.filterUsers({ role_names: ["ADMIN", "CLERK"] })
        if (response.success){
            setUsers(response.data!)
        }
        else{
            toast.error("Failed to load custodians", {description: response.error})
            router.push('/finance/petty-cash')
        }
      } catch (err) {
        toast.error("Failed to load custodians")
        router.push('/finance/petty-cash')
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [toast])

  const handleCreate = async () => {
    if (!fundName.trim() || !custodian || !initialAmount) {
      toast.error("All fields are required")
      return
    }

    setLoading(true)
    try {
      const response = await financeRequests.createPettyCashFund({
        fund_name: fundName.trim(),
        custodian_id: custodian.id,
        initial_amount: parseFloat(initialAmount),
      })
      if (response.success){
        toast.success("Petty cash fund created successfully!")
        router.push(`/finance/petty-cash/${response.data?.id}`)
      }
      else{
         toast.error("Failed to create fund", {description: response.error})
      }
    } catch (err) {
      toast.error("Failed to create fund")
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
            <Link href="/finance/petty-cash">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Petty Cash
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Create Petty Cash Fund</h1>
            <p className="text-muted-foreground mt-2">Set up a new petty cash fund</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-primary" />
                Fund Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Fund Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Office Petty Cash"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="custodian">Custodian *</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between mt-2"
                      disabled={usersLoading}
                    >
                      {custodian 
                        ? `${custodian.full_name} (${custodian.email})`
                        : "Select custodian..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search custodians..." />
                      <CommandEmpty>
                        {usersLoading ? "Loading..." : "No custodian found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => {
                              setCustodian(user)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                custodian?.id === user.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="amount">Initial Amount (KSh) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/finance/petty-cash">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || !fundName.trim() || !custodian || !initialAmount}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Fund"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Petty Cash Fund?</AlertDialogTitle>
                <AlertDialogDescription>
                  <p className="font-medium">{fundName.trim()}</p>
                  <p>Custodian: {custodian?.full_name} ({custodian?.email})</p>
                  <p>Initial Amount: KSh {parseFloat(initialAmount).toLocaleString()}</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Yes, Create"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}