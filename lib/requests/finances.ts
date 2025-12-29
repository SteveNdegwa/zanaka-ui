import { apiClient, APIResponse } from "./client";

// Enums
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

// Fee Structures
export interface GradeLevelFee {
  id: string;
  grade_level: string;
  term: string;
  academic_year: string;
  amount: string;
  is_mandatory: boolean;
}

export interface FeeItem {
  id: string;
  school_id: string;
  school_name: string;
  name: string;
  default_amount: string;
  category: string;
  description: string;
  is_active: boolean;
  applies_to_all_branches: boolean;
  branches: { id: string; name: string }[];
  created_at: string;
  updated_at: string;
  grade_level_fees: GradeLevelFee[];
}

// Refund
export interface Refund {
  id: string;
  amount: string;
  refund_method: PaymentMethod;
  status: RefundStatus;
  processed_by_full_name?: string;
  processed_at: string;
  mpesa_receipt_number?: string | null;
  mpesa_phone_number?: string | null;
  mpesa_transaction_date?: string | null;
  bank_reference?: string | null;
  bank_name?: string | null;
  transaction_id?: string | null;
  reference?: string | null;
  notes?: string | null;
  cancelled_by_full_name?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

// Payments & Allocations
export interface PaymentAllocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  allocated_amount: string;
  allocation_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  invoice_reference: string;
  invoice_total_amount: string;
  invoice_paid_amount: string;
  invoice_balance: string;
  invoice_due_date: string | null;
  invoice_status: string;
}

export interface MpesaTransaction {
  id: string;
  transaction_type: string;
  trans_id: string;
  trans_time: string;
  trans_amount: string;
  business_short_code: string;
  bill_ref_number: string;
  msisdn: string;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  payment_id: string | null;
  is_reconciled: boolean;
  reconciliation_notes: string;
  raw_data: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_reference: string;
  student_id: string | null;
  student_reg_number: string | null;
  student_full_name: string | null;
  payment_method: PaymentMethod;
  amount: string;
  allocated_amount: string;
  effective_utilized_amount: string;
  completed_refunded_amount: string;
  pending_refunded_amount: string;
  unassigned_amount: string;
  available_for_refund: string;
  mpesa_receipt_number: string | null;
  mpesa_phone_number: string | null;
  mpesa_transaction_date: string | null;
  bank_reference: string | null;
  bank_name: string | null;
  transaction_id: string | null;
  verified_at: string | null;
  verified_by_id: string | null;
  verified_by_full_name: string | null;
  reversed_by_id: string | null;
  reversed_by_full_name: string | null;
  reversed_at: string | null;
  reversal_reason: string | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  payment_allocations: PaymentAllocation[];
  refunds: Refund[];
  mpesa_transactions: MpesaTransaction[];
}

// Invoice
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  fee_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: string;
  amount: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentAllocationForInvoice {
  id: string;
  payment_id: string;
  invoice_id: string;
  allocated_amount: string;
  allocation_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  payment_reference: string;
  payment_method: string;
}

export interface Invoice {
  id: string;
  invoice_reference: string;
  student_id: string;
  student_reg_number: string;
  student_full_name: string;
  student_classroom_id: string | null;
  student_classroom_name: string | null;
  student_grade_level: string | null;
  total_amount: string;
  paid_amount: string;
  balance: string;
  priority: number;
  due_date: string | null;
  created_by_id: string;
  created_by_reg_number: string;
  created_by_full_name: string;
  updated_by_id: string | null;
  updated_by_reg_number: string | null;
  updated_by_full_name: string | null;
  notes: string | null;
  is_auto_generated: boolean;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  invoice_items: InvoiceItem[];
  payments: PaymentAllocationForInvoice[];
}

// Bulk Invoice Types
export interface BulkInvoiceSummary {
  id: string;
  bulk_reference: string;
  created_by: string;
  created_at: string;
  student_count: number;
  invoice_count: number;
  total_amount: string;
  due_date: string;
  description: string;
  notes: string | null;
  is_cancelled: boolean;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
}

export interface BulkInvoiceStudentInvoice {
  id: string;
  invoice_reference: string;
  student_id: string;
  student_full_name: string;
  student_reg_number: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  due_date: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

export interface BulkInvoiceDetail {
  bulk_invoice: {
    id: string;
    bulk_reference: string;
    created_by: string;
    created_at: string;
    student_count: number;
    invoice_count: number;
    total_amount: string;
    due_date: string;
    description: string;
    notes: string | null;
    is_cancelled: boolean;
    cancelled_by: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
  };
  invoices: BulkInvoiceStudentInvoice[];
}

// Request/Response Types
export interface CreateInvoiceItemRequest {
  fee_item_id?: string | null;
  description?: string;
  quantity: number;
  unit_price?: string;
  grade_level?: string;
  term?: string;
  academic_year?: string;
}

export interface CreateInvoiceRequest {
  due_date: string;
  priority: number;
  notes?: string;
  invoice_items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceResponse {
  id: string;
}

// Bulk Invoice Request
export interface BulkCreateInvoiceRequest {
  student_ids: string[];
  due_date: string;
  priority?: number;
  description?: string;
  notes?: string;
  invoice_items: CreateInvoiceItemRequest[];
}

export interface BulkCreateInvoiceResponse {
  bulk_invoice_id: string;
  bulk_reference: string;
  created_count: number;
  invoice_ids: string[];
}

// Payment Request Types
export interface CreatePaymentRequest {
  payment_method: PaymentMethod;
  amount: number;
  notes?: string;
  mpesa_receipt_number?: string;
  mpesa_phone_number?: string;
  mpesa_transaction_date?: string;
  bank_reference?: string;
  bank_name?: string;
  priority_invoice_id?: string | null;
}

export interface CreatePaymentResponse {
  id: string;
}

// Refund Request Types
export interface CreateRefundRequest {
  amount: number;
  refund_method: PaymentMethod;
  status?: RefundStatus;
  notes?: string;
  reference?: string;
  mpesa_receipt_number?: string;
  mpesa_phone_number?: string;
  mpesa_transaction_date?: string;
  bank_reference?: string;
  bank_name?: string;
  transaction_id?: string;
}

export interface CreateRefundResponse {
  id: string;
}

// Approve Payment Response
export interface ApprovePaymentResponse {
  id: string;
}

// Finance API Requests
export const financeRequests = {
  // === Fee Items ===
  listFeeItems: async (): Promise<APIResponse<FeeItem[]>> => {
    return apiClient.post<FeeItem[]>("/finances/fee-items/");
  },

  // === Single Invoice ===
  createInvoice: async (
    studentId: string,
    data: CreateInvoiceRequest
  ): Promise<APIResponse<CreateInvoiceResponse>> => {
    return apiClient.post<CreateInvoiceResponse>(
      `/finances/students/${studentId}/invoices/create/`,
      data
    );
  },
  viewInvoice: async (invoiceId: string): Promise<APIResponse<Invoice>> => {
    return apiClient.get<Invoice>(`/finances/invoices/${invoiceId}/`);
  },
  cancelInvoice: async (invoiceId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/invoices/${invoiceId}/cancel/`);
  },
  listInvoices: async (filters?: Record<string, any>): Promise<APIResponse<Invoice[]>> => {
    return apiClient.post<Invoice[]>("/finances/invoices/", filters || {});
  },

  // === Bulk Invoice Management ===
  bulkCreateInvoices: async (
    data: BulkCreateInvoiceRequest
  ): Promise<APIResponse<BulkCreateInvoiceResponse>> => {
    return apiClient.post<BulkCreateInvoiceResponse>("/finances/bulk-invoices/create/", data);
  },
  listBulkInvoices: async (filters?: Record<string, any>): Promise<APIResponse<BulkInvoiceSummary[]>> => {
    return apiClient.post<BulkInvoiceSummary[]>("/finances/bulk-invoices/", filters || {});
  },
  viewBulkInvoice: async (bulkInvoiceId: string): Promise<APIResponse<BulkInvoiceDetail>> => {
    return apiClient.get<BulkInvoiceDetail>(`/finances/bulk-invoices/${bulkInvoiceId}/`);
  },
  bulkCancelInvoices: async (
    bulkInvoiceId: string,
    data?: { reason?: string }
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/bulk-invoices/${bulkInvoiceId}/cancel/`, data || {});
  },

  // === Payment Management ===
  createPayment: async (
    studentId: string,
    data: CreatePaymentRequest
  ): Promise<APIResponse<CreatePaymentResponse>> => {
    return apiClient.post<CreatePaymentResponse>(
      `/finances/students/${studentId}/payments/create/`,
      data
    );
  },
  viewPayment: async (paymentId: string): Promise<APIResponse<Payment>> => {
    return apiClient.get<Payment>(`/finances/payments/${paymentId}/`);
  },
  listPayments: async (filters?: Record<string, any>): Promise<APIResponse<Payment[]>> => {
    return apiClient.post<Payment[]>("/finances/payments/", filters || {});
  },
  reversePayment: async (paymentId: string, data: { reason: string }): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/finances/payments/${paymentId}/reverse/`, data);
  },
  approvePayment: async (paymentId: string): Promise<APIResponse<ApprovePaymentResponse>> => {
    return apiClient.post<ApprovePaymentResponse>(`/finances/payments/${paymentId}/approve/`);
  },
  createRefund: async (
    paymentId: string,
    data: CreateRefundRequest
  ): Promise<APIResponse<CreateRefundResponse>> => {
    return apiClient.post<CreateRefundResponse>(
      `/finances/payments/${paymentId}/refunds/create/`,
      data
    );
  },
  cancelRefund: async (
    refundId: string,
    data: { reason: string }
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(
      `/finances/refunds/${refundId}/cancel/`,
      data
    );
  },
};