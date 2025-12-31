"use client"

import { toast as sonnerToast, type ExternalToast } from "sonner"

const DEFAULT_DURATION = 10_000 // 10 seconds

function toast(
  message: string,
  options?: ExternalToast
) {
  return sonnerToast(message, {
    duration: DEFAULT_DURATION,
    ...options,
  })
}

toast.success = (message: string, options?: ExternalToast) =>
  sonnerToast.success(message, { duration: DEFAULT_DURATION, ...options })

toast.error = (message: string, options?: ExternalToast) =>
  sonnerToast.error(message, { duration: DEFAULT_DURATION, ...options })

toast.info = (message: string, options?: ExternalToast) =>
  sonnerToast.info(message, { duration: DEFAULT_DURATION, ...options })

toast.warning = (message: string, options?: ExternalToast) =>
  sonnerToast.warning(message, { duration: DEFAULT_DURATION, ...options })

export function useToast() {
  return { toast }
}

export { toast }
export type Toast = ExternalToast
