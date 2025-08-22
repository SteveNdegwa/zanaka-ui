"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building } from "lucide-react"

const branches = [
  { id: "all", name: "All Branches", code: "ALL" },
  { id: "main", name: "Main Campus", code: "MAIN" },
  { id: "north", name: "North Campus", code: "NORTH" },
  { id: "south", name: "South Campus", code: "SOUTH" },
  { id: "tech", name: "Tech Campus", code: "TECH" },
]

interface BranchSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function BranchSelector({ value = "all", onValueChange, className }: BranchSelectorProps) {
  const [selectedBranch, setSelectedBranch] = useState(value)

  const handleValueChange = (newValue: string) => {
    setSelectedBranch(newValue)
    onValueChange?.(newValue)
  }

  return (
    <Select value={selectedBranch} onValueChange={handleValueChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4" />
          <SelectValue placeholder="Select branch" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{branch.name}</span>
              <span className="text-xs text-gray-500">({branch.code})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
