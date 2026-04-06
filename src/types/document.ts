export type Language = 'en' | 'ar';
export type DocumentType = 'invoice' | 'proposal' | 'receipt';
export type Currency = 'KWD' | 'KES' | 'USD';
export type InvoiceStatus = 'paid' | 'pending';
export type PaymentMethod = 'bank_transfer' | 'mpesa' | 'stripe' | 'cash';
export type DiscountType = 'percentage' | 'flat';

export interface LineItem {
  id: string;
  description: string;
  descriptionAr?: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
}

export interface ClientInfo {
  name: string;
  email: string;
  address: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swift: string;
}

export interface MpesaDetails {
  businessName: string;
  businessNumber: string;
  accountNumber: string;
}

export interface Discount {
  type: DiscountType;
  value: number;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  bankDetails: BankDetails;
  mpesaDetails: MpesaDetails;
  paymentMethods: PaymentMethod[];
  counters: {
    invoice: number;
    proposal: number;
    receipt: number;
  };
}

export interface InvoiceData {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxId?: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  paymentTerms?: string;
  client: ClientInfo;
  lineItems: LineItem[];
  taxRate: number;
  discount: Discount;
  currency: Currency;
  status: InvoiceStatus;
  bankDetails: BankDetails;
  mpesaDetails?: MpesaDetails;
  paymentMethods: PaymentMethod[];
  notes?: string;
}

export interface ProposalData {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxId?: string;
  proposalNumber: string;
  date: string;
  client: ClientInfo;
  executiveSummary: string;
  scopeOfWork: string[];
  timeline: { milestone: string; date: string }[];
  totalCost: number;
  currency: Currency;
  notes?: string;
}

export interface ReceiptData {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxId?: string;
  receiptNumber: string;
  date: string;
  client: ClientInfo;
  lineItems: LineItem[];
  amountPaid: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  notes?: string;
}

export interface SavedDocument {
  id: string;
  type: DocumentType;
  docNumber: string;
  companyId: string;
  companyName: string;
  clientName: string;
  date: string;
  data: InvoiceData | ProposalData | ReceiptData;
  total?: number;
  subtotal?: number;
  tax?: number;
  createdAt: string;
}
