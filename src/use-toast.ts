"use client"

import { toast as sonnerToast, type ExternalToast } from "sonner"

export function useToast() {
  return {
    toast: sonnerToast,
  }
}

export const toast = sonnerToast
export type Toast = ExternalToast