"use client"

import { da } from "date-fns/locale"
import { apiClient, APIResponse } from "./client"

// === Enums ===

// Invoice & Payment
export enum InvoiceStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  MPESA = "MPESA",
  BANK = "BANK",
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  CARD = "CARD",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export enum RefundStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

// Fee Items
export enum FeeItemCategory {
  TUITION = "TUITION",
  TRANSPORT = "TRANSPORT",
  ACTIVITY = "ACTIVITY",
  UNIFORM = "UNIFORM",
  OTHER = "OTHER",
}

export enum GradeLevel {
  BABY_CLASS = "BABY_CLASS",
  PP_1 = "PP_1",
  PP_2 = "PP_2",
  GRADE_1 = "GRADE_1",
  GRADE_2 = "GRADE_2",
  GRADE_3 = "GRADE_3",
  GRADE_4 = "GRADE_4",
  GRADE_5 = "GRADE_5",
  GRADE_6 = "GRADE_6",
  GRADE_7 = "GRADE_7",
  GRADE_8 = "GRADE_8",
  GRADE_9 = "GRADE_9",
}

export enum Term {
  TERM_1 = "TERM_1",
  TERM_2 = "TERM_2",
  TERM_3 = "TERM_3",
}

// Expenses
export enum ExpenseStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum ExpensePaymentMethod {
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  BANK_TRANSFER = "BANK_TRANSFER",
  MPESA = "MPESA",
  CARD = "CARD",
  PETTY_CASH = "PETTY_CASH",
}

// Vendor
export enum VendorPaymentTerm {
  IMMEDIATE = "IMMEDIATE",
  NET_7 = "NET_7",
  NET_15 = "NET_15",
  NET_30 = "NET_30",
  NET_60 = "NET_60",
}

// Petty Cash
export enum PettyCashStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CLOSED = "CLOSED",
}

export enum PettyCashTransactionType {
  DISBURSEMENT = "DISBURSEMENT",
  REPLENISHMENT = "REPLENISHMENT",
  ADJUSTMENT = "ADJUSTMENT",
}

// === Types ===

// Fee Item
export interface GradeLevelFee {
  id: string
  grade_level: GradeLevel
  term: Term
  academic_year: string
  amount: string
  is_mandatory: boolean
  created_at: string
  updated_at: string
}

export interface FeeItem {
  id: string
  school_id: string
  school_name: string
  name: string
  default_amount: string
  category: FeeItemCategory
  description: string | null
  is_active: boolean
  applies_to_all_branches: boolean
  branches: { id: string; name: string }[]
  created_at: string
  updated_at: string
  grade_level_fees: GradeLevelFee[]
}

// Vendor
export interface Vendor {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  kra_pin: string
  payment_terms: VendorPaymentTerm
  mpesa_pochi_number: string
  mpesa_paybill_number: string
  mpesa_paybill_account: string
  mpesa_till_number: string
  bank_name: string
  bank_account: string
  bank_branch: string
  is_active: boolean
  notes: string
  total_paid_current_year: number
  total_paid_all_time: number
  created_at: string
  updated_at: string
}

// Department
export interface Department {
  id: string
  name: string
  head_id: string | null
  head_full_name: string | null
  budget_allocated: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Expense Category
export interface ExpenseCategory {
  id: string
  name: string
  has_budget: boolean
  monthly_budget: string | null
  annual_budget: string | null
  requires_approval: boolean
  is_active: boolean
  total_spent: number
  created_at: string
  updated_at: string
}

// Petty Cash Transaction
export interface PettyCashTransaction {
  id: string
  description: string
  transaction_type: PettyCashTransactionType
  amount: string
  balance_before: string
  balance_after: string
  processed_by_id: string
  processed_by_full_name: string
  expense_id: string | null
  expense_reference: string | null
  notes: string | null
  created_at: string
}

// Petty Cash Fund
export interface PettyCashFund {
  id: string
  fund_name: string
  custodian_id: string
  custodian_full_name: string
  initial_amount: string
  current_balance: string
  status: PettyCashStatus
  created_at: string
  updated_at: string
  recent_transactions: PettyCashTransaction[]
}

// Expense Branch
export interface ExpenseBranch {
  id: string
  name: string
}

// Expense
export interface Expense {
  id: string
  expense_reference: string
  name: string
  school_id: string
  school_name: string
  applies_to_all_branches: boolean
  branches: ExpenseBranch[]
  category_id: string
  category_name: string
  department_id: string
  department_name: string
  vendor_id: string | null
  vendor_name: string | null
  amount: string
  tax_amount: string
  total_amount: string
  expense_date: string | null
  payment_method: ExpensePaymentMethod
  status: ExpenseStatus
  invoice_number: string
  receipt_number: string
  cheque_number: string
  transaction_reference: string
  requested_by_id: string
  requested_by_full_name: string
  approved_by_id: string | null
  approved_by_full_name: string | null
  approved_at: string | null
  rejected_by_id: string | null
  rejected_by_full_name: string | null
  rejected_at: string | null
  rejection_reason: string
  paid_by_id: string | null
  paid_by_full_name: string | null
  paid_at: string | null
  is_taxable: boolean
  tax_rate: string
  is_recurring: boolean
  recurrence_frequency: string | null
  notes: string
  created_at: string
  updated_at: string
  attachments: Array<{
    id: string
    file: string
    file_name: string
    file_type: string
    file_size: number
    uploaded_by_id: string
    uploaded_at: string
  }>
}

// Refund
export interface Refund {
  id: string
  amount: string
  refund_method: PaymentMethod
  status: RefundStatus
  processed_by_full_name?: string
  processed_at: string
  mpesa_receipt_number?: string | null
  mpesa_phone_number?: string | null
  mpesa_transaction_date?: string | null
  bank_reference?: string | null
  bank_name?: string | null
  transaction_id?: string | null
  reference?: string | null
  notes?: string | null
  cancelled_by_full_name?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
}

// Payment Allocation
export interface PaymentAllocation {
  id: string
  payment_id: string
  invoice_id: string
  allocated_amount: string
  allocation_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  invoice_reference: string
  invoice_total_amount: string
  invoice_paid_amount: string
  invoice_balance: string
  invoice_due_date: string | null
  invoice_status: string
}

// Payment
export interface Payment {
  id: string
  payment_reference: string
  student_id: string | null
  student_reg_number: string | null
  student_full_name: string | null
  payment_method: PaymentMethod
  amount: string
  allocated_amount: string
  effective_utilized_amount: string
  completed_refunded_amount: string
  pending_refunded_amount: string
  unassigned_amount: string
  available_for_refund: string
  mpesa_receipt_number: string | null
  mpesa_phone_number: string | null
  mpesa_transaction_date: string | null
  bank_reference: string | null
  bank_name: string | null
  transaction_id: string | null
  verified_at: string | null
  verified_by_full_name: string | null
  reversed_by_full_name: string | null
  reversed_at: string | null
  reversal_reason: string | null
  notes: string | null
  status: PaymentStatus
  created_at: string
  updated_at: string
  payment_allocations: PaymentAllocation[]
  refunds: Refund[]
}

// Invoice Item
export interface InvoiceItem {
  id: string
  invoice_id: string
  fee_item_id: string | null
  description: string
  quantity: number
  unit_price: string
  amount: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Invoice
export interface Invoice {
  id: string
  invoice_reference: string
  student_id: string
  student_reg_number: string
  student_full_name: string
  total_amount: string
  paid_amount: string
  balance: string
  priority: number
  due_date: string | null
  created_by_full_name: string
  updated_by_full_name: string | null
  notes: string | null
  is_auto_generated: boolean
  status: InvoiceStatus
  created_at: string
  updated_at: string
  invoice_items: InvoiceItem[]
}

// Bulk Invoice
export interface BulkInvoiceSummary {
  id: string
  bulk_reference: string
  created_by: string
  created_at: string
  student_count: number
  invoice_count: number
  total_amount: string
  due_date: string
  description: string
  notes: string | null
  is_cancelled: boolean
  cancelled_by: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
}

// === Request Types ===

// Fee Items
export interface CreateFeeItemRequest {
  name: string
  default_amount: number
  category: FeeItemCategory
  description?: string
  branch_ids?: string[]
}

export interface UpdateFeeItemRequest {
  name?: string
  default_amount?: number
  category?: FeeItemCategory
  description?: string
  branch_ids?: string[]
}

export interface CreateGradeLevelFeeRequest {
  grade_level: GradeLevel
  term: Term
  academic_year: string
  amount: number
  is_mandatory?: boolean
}

export interface UpdateGradeLevelFeeRequest {
  grade_level?: GradeLevel
  term?: Term
  academic_year?: string
  amount?: number
  is_mandatory?: boolean
}

// Vendors
export interface CreateVendorRequest {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  kra_pin?: string
  payment_terms?: VendorPaymentTerm
  mpesa_pochi_number?: string
  mpesa_paybill_number?: string
  mpesa_paybill_account?: string
  mpesa_till_number?: string
  bank_name?: string
  bank_account?: string
  bank_branch?: string
  notes?: string
}

export interface UpdateVendorRequest {
  name?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  kra_pin?: string
  payment_terms?: VendorPaymentTerm
  mpesa_pochi_number?: string
  mpesa_paybill_number?: string
  mpesa_paybill_account?: string
  mpesa_till_number?: string
  bank_name?: string
  bank_account?: string
  bank_branch?: string
  notes?: string
}

// Departments
export interface CreateDepartmentRequest {
  name: string
  head_id?: string | null
  budget_allocated?: number
}

export interface UpdateDepartmentRequest {
  name?: string
  head_id?: string | null
  budget_allocated?: number
}

// Expense Categories
export interface CreateExpenseCategoryRequest {
  name: string
  has_budget?: boolean
  monthly_budget?: number | null
  annual_budget?: number | null
  requires_approval?: boolean
}

export interface UpdateExpenseCategoryRequest {
  name?: string
  has_budget?: boolean
  monthly_budget?: number | null
  annual_budget?: number | null
  requires_approval?: boolean
  is_active?: boolean
}

// Expenses
export interface CreateExpenseRequest {
  name: string
  branch_ids?: string[]
  category_id: string
  department_id: string
  vendor_id?: string | null
  amount: number
  expense_date: string
  payment_method?: ExpensePaymentMethod
  invoice_number?: string
  receipt_number?: string
  cheque_number?: string
  transaction_reference?: string
  is_taxable?: boolean
  tax_rate?: number
  is_recurring?: boolean
  recurrence_frequency?: string | null
  notes?: string
}

export interface UpdateExpenseRequest {
  name?: string
  school_id?: string
  branch_ids?: string[]
  category_id?: string
  department_id?: string
  vendor_id?: string | null
  amount?: number
  expense_date?: string
  payment_method?: ExpensePaymentMethod
  invoice_number?: string
  receipt_number?: string
  cheque_number?: string
  transaction_reference?: string
  is_taxable?: boolean
  tax_rate?: number
  is_recurring?: boolean
  recurrence_frequency?: string | null
  notes?: string
}

// Petty Cash
export interface CreatePettyCashFundRequest {
  fund_name: string
  custodian_id: string
  initial_amount: number
}

export interface ReplenishPettyCashRequest {
  amount: number
  notes?: string
}

export interface HomepageStatistics {
  school_stats: {
    total_branches: number
    total_classrooms: number
    active_students: number
    new_admissions: number
  }
  gross_cash_received: {
    amount: number
    formatted: string
  }
  refunds_issued: {
    amount: number
    formatted: string
  }
  net_cash_revenue: {
    amount: number
    formatted: string
    change: number | null
    message: string
    is_positive: boolean | null
  }
  expenses: {
    amount: number
    formatted: string
  }
  net_cash_profit: {
    amount: number
    formatted: string
    change: number | null
    message: string
    is_positive: boolean | null
  }
  outstanding_balance: {
    amount: number
    formatted: string
  }
  overdue_balance: {
    amount: number
    formatted: string
  }
  pending_payments: number
  period: {
    label: string
    start: string | null
    end: string | null
  }
}

// === Finance API Requests ===
export const financeRequests = {
  // === Fee Items ===
  listFeeItems: async (filters?: Record<string, any>): Promise<APIResponse<FeeItem[]>> => {
    return apiClient.post<FeeItem[]>("/finances/fee-items/", filters || {})
  },

  createFeeItem: async (data: CreateFeeItemRequest): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>("/finances/fee-items/create/", data)
  },

  viewFeeItem: async (feeItemId: string): Promise<APIResponse<FeeItem>> => {
    return apiClient.get<FeeItem>(`/finances/fee-items/${feeItemId}/`)
  },

  updateFeeItem: async (feeItemId: string, data: UpdateFeeItemRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/fee-items/${feeItemId}/update/`, data)
  },

  deactivateFeeItem: async (feeItemId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/fee-items/${feeItemId}/deactivate/`)
  },

  activateFeeItem: async (feeItemId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/fee-items/${feeItemId}/activate/`)
  },

  createGradeLevelFee: async (
    feeItemId: string,
    data: CreateGradeLevelFeeRequest
  ): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>(`/finances/fee-items/${feeItemId}/grade-level-fees/create/`, data)
  },

  updateGradeLevelFee: async (
    gradeLevelFeeId: string,
    data: UpdateGradeLevelFeeRequest
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/grade-level-fees/${gradeLevelFeeId}/update/`, data)
  },

  deleteGradeLevelFee: async (gradeLevelFeeId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/grade-level-fees/${gradeLevelFeeId}/delete/`)
  },

  // === Vendors ===
  listVendors: async (filters?: Record<string, any>): Promise<APIResponse<Vendor[]>> => {
    return apiClient.post<Vendor[]>("/finances/vendors/", filters || {})
  },

  createVendor: async (data: CreateVendorRequest): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>("/finances/vendors/create/", data)
  },

  viewVendor: async (vendorId: string): Promise<APIResponse<Vendor>> => {
    return apiClient.get<Vendor>(`/finances/vendors/${vendorId}/`)
  },

  updateVendor: async (vendorId: string, data: UpdateVendorRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/vendors/${vendorId}/update/`, data)
  },

  deactivateVendor: async (vendorId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/vendors/${vendorId}/deactivate/`)
  },

  activateVendor: async (vendorId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/vendors/${vendorId}/activate/`)
  },

  // === Departments ===
  listDepartments: async (filters?: Record<string, any>): Promise<APIResponse<Department[]>> => {
    return apiClient.post<Department[]>("/finances/departments/", filters || {})
  },

  createDepartment: async (data: CreateDepartmentRequest): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>("/finances/departments/create/", data)
  },

  viewDepartment: async (departmentId: string): Promise<APIResponse<Department>> => {
    return apiClient.get<Department>(`/finances/departments/${departmentId}/`)
  },

  updateDepartment: async (departmentId: string, data: UpdateDepartmentRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/departments/${departmentId}/update/`, data)
  },

  deactivateDepartment: async (departmentId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/departments/${departmentId}/deactivate/`)
  },

  activateDepartment: async (departmentId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/departments/${departmentId}/activate/`)
  },

  getDepartmentExpenseBreakdown: async (
    departmentId: string,
    filters?: Record<string, any>
  ): Promise<APIResponse<any>> => {
    return apiClient.post<any>(`/finances/departments/${departmentId}/expense-breakdown/`, filters || {})
  },

  // === Expense Categories ===
  listExpenseCategories: async (filters?: Record<string, any>): Promise<APIResponse<ExpenseCategory[]>> => {
    return apiClient.post<ExpenseCategory[]>("/finances/expense-categories/", filters || {})
  },

  createExpenseCategory: async (data: CreateExpenseCategoryRequest): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>("/finances/expense-categories/create/", data)
  },

  viewExpenseCategory: async (categoryId: string): Promise<APIResponse<ExpenseCategory>> => {
    return apiClient.get<ExpenseCategory>(`/finances/expense-categories/${categoryId}/`)
  },

  updateExpenseCategory: async (categoryId: string, data: UpdateExpenseCategoryRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expense-categories/${categoryId}/update/`, data)
  },

  deactivateExpenseCategory: async (categoryId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expense-categories/${categoryId}/deactivate/`)
  },

  activateExpenseCategory: async (categoryId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expense-categories/${categoryId}/activate/`)
  },

  // === Expenses ===
  listExpenses: async (filters?: Record<string, any>): Promise<APIResponse<Expense[]>> => {
    return apiClient.post<Expense[]>("/finances/expenses/", filters || {})
  },

  createExpense: async (data: CreateExpenseRequest): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>("/finances/expenses/create/", data)
  },

  viewExpense: async (expenseId: string): Promise<APIResponse<Expense>> => {
    return apiClient.get<Expense>(`/finances/expenses/${expenseId}/`)
  },

  updateExpense: async (expenseId: string, data: UpdateExpenseRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expenses/${expenseId}/update/`, data)
  },

  submitExpenseForApproval: async (expenseId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expenses/${expenseId}/submit/`)
  },

  approveExpense: async (expenseId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expenses/${expenseId}/approve/`)
  },

  rejectExpense: async (
    expenseId: string,
    data: { rejection_reason: string }
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expenses/${expenseId}/reject/`, data)
  },

  markExpenseAsPaid: async (
    expenseId: string,
    data: {
      payment_method: ExpensePaymentMethod
      receipt_number?: string
      cheque_number?: string
      transaction_reference?: string
      petty_cash_fund_id?: string
      notes?: string
    }
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expenses/${expenseId}/pay/`, data)
  },

  cancelExpense: async (expenseId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expenses/${expenseId}/cancel/`)
  },

  getExpenseSummary: async (filters?: Record<string, any>): Promise<APIResponse<any>> => {
    return apiClient.post<any>("/finances/expenses/summary/", filters || {})
  },

  addExpenseAttachment: async (
    expenseId: string,
    file: File
  ): Promise<APIResponse<{ id: string }>> => {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.post<{ id: string }>(
      `/finances/expenses/${expenseId}/attachments/add/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
  },

  removeExpenseAttachment: async (attachmentId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/expenses/attachments/${attachmentId}/remove/`)
  },

  // === Petty Cash ===
  listPettyCashFunds: async (filters?: Record<string, any>): Promise<APIResponse<PettyCashFund[]>> => {
    return apiClient.post<PettyCashFund[]>("/finances/petty-cash/", filters || {})
  },

  createPettyCashFund: async (data: CreatePettyCashFundRequest): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>("/finances/petty-cash/create/", data)
  },

  viewPettyCashFund: async (fundId: string): Promise<APIResponse<PettyCashFund>> => {
    return apiClient.get<PettyCashFund>(`/finances/petty-cash/${fundId}/`)
  },

  replenishPettyCash: async (fundId: string, data: ReplenishPettyCashRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/petty-cash/${fundId}/replenish/`, data)
  },

  closePettyCashFund: async (fundId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/petty-cash/${fundId}/close/`)
  },

  reopenPettyCashFund: async (fundId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/petty-cash/${fundId}/reopen/`)
  },

  viewPettyCashTransactions: async (
    fundId: string,
    filters?: Record<string, any>
  ): Promise<APIResponse<PettyCashTransaction[]>> => {
    return apiClient.post<PettyCashTransaction[]>(`/finances/petty-cash/${fundId}/transactions/`, filters || {})
  },

  // === Invoices ===
  listInvoices: async (filters?: Record<string, any>): Promise<APIResponse<Invoice[]>> => {
    return apiClient.post<Invoice[]>("/finances/invoices/", filters || {})
  },

  createInvoice: async (
    studentId: string,
    data: any
  ): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>(`/finances/students/${studentId}/invoices/create/`, data)
  },

  viewInvoice: async (invoiceId: string): Promise<APIResponse<Invoice>> => {
    return apiClient.get<Invoice>(`/finances/invoices/${invoiceId}/`)
  },

  updateInvoice: async (invoiceId: string, data: any): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/invoices/${invoiceId}/update/`, data)
  },

  cancelInvoice: async (invoiceId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/invoices/${invoiceId}/cancel/`)
  },

  activateInvoice: async (invoiceId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/invoices/${invoiceId}/activate/`)
  },

  // === Bulk Invoices ===
  bulkCreateInvoices: async (data: any): Promise<APIResponse<any>> => {
    return apiClient.post<any>("/finances/bulk-invoices/create/", data)
  },

  listBulkInvoices: async (filters?: Record<string, any>): Promise<APIResponse<BulkInvoiceSummary[]>> => {
    return apiClient.post<BulkInvoiceSummary[]>("/finances/bulk-invoices/", filters || {})
  },

  viewBulkInvoice: async (bulkInvoiceId: string): Promise<APIResponse<any>> => {
    return apiClient.get<any>(`/finances/bulk-invoices/${bulkInvoiceId}/`)
  },

  bulkCancelInvoices: async (bulkInvoiceId: string, data?: { reason?: string }): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/bulk-invoices/${bulkInvoiceId}/cancel/`, data || {})
  },

  // === Payments ===
  listPayments: async (filters?: Record<string, any>): Promise<APIResponse<Payment[]>> => {
    return apiClient.post<Payment[]>("/finances/payments/", filters || {})
  },

  createPayment: async (studentId: string, data: any): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>(`/finances/students/${studentId}/payments/create/`, data)
  },

  viewPayment: async (paymentId: string): Promise<APIResponse<Payment>> => {
    return apiClient.get<Payment>(`/finances/payments/${paymentId}/`)
  },

  approvePayment: async (paymentId: string): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>(`/finances/payments/${paymentId}/approve/`)
  },

  reversePayment: async (paymentId: string, data: { reason: string }): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/payments/${paymentId}/reverse/`, data)
  },

  allocatePayments: async (studentId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/students/${studentId}/payments/allocate/`)
  },

  createRefund: async (paymentId: string, data: any): Promise<APIResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>(`/finances/payments/${paymentId}/refunds/create/`, data)
  },

  cancelRefund: async (refundId: string, data?: { reason: string }): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/refunds/${refundId}/cancel/`, data || {})
  },

  getHomepageStatistics: async (data: object): Promise<APIResponse<HomepageStatistics>> => {
    return apiClient.post<HomepageStatistics>('/finances/homepage-statistics/', data)
  },
}