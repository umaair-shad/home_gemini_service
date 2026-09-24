/**
 * Types & Domain Models for Smart Home Maintenance Services
 * Following SRS State Transitions T1-T26 and TRD Specifications
 */

export type Role = 'visitor' | 'customer' | 'provider' | 'agent' | 'finance' | 'admin';

export type Locale = 'en' | 'ur';

// Monetary amounts are tracked as integer paisa (100 paisa = 1 PKR)
export type Paisa = number;

export function formatPKR(paisa: Paisa): string {
  const pkr = paisa / 100;
  return `PKR ${pkr.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatPKRShort(paisa: Paisa): string {
  const pkr = Math.round(paisa / 100);
  return `Rs ${pkr.toLocaleString('en-PK')}`;
}

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'REQUESTED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'QUOTE_REVISED'
  | 'COMPLETED'
  | 'AWAITING_VERIFICATION'
  | 'IN_VERIFICATION'
  | 'VERIFIED_SATISFIED'
  | 'VERIFIED_WITH_ISSUE'
  | 'REWORK_REQUIRED'
  | 'DISPUTED'
  | 'FUNDS_RELEASED'
  | 'CASH_COLLECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface BookingStatusMeta {
  status: BookingStatus;
  labelEn: string;
  labelUr: string;
  badgeClass: string;
  descriptionEn: string;
  descriptionUr: string;
}

export type PaymentMethod = 'CASH' | 'ONLINE_ESCROW';

export interface ServiceCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameUr: string;
  iconName: string;
  descriptionEn: string;
  descriptionUr: string;
  baseInspectionFeePaisa: Paisa;
  estimatedRangePaisa: { min: Paisa; max: Paisa };
  activeServicesCount: number;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  titleEn: string;
  titleUr: string;
  baseInspectionFeePaisa: Paisa;
  estimatedLaborPaisa: Paisa;
  warrantyDays: number;
  inclusionsEn: string[];
  inclusionsUr: string[];
  exclusionsEn: string[];
  exclusionsUr: string[];
  defaultChecklistEn: string[];
  defaultChecklistUr: string[];
}

export interface ProviderDocument {
  id: string;
  type: 'CNIC' | 'POLICE_CHECK' | 'TRADE_CERT' | 'BANK_VERIFICATION';
  titleEn: string;
  titleUr: string;
  docNumberMasked: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verifiedAt?: string;
}

export interface Provider {
  id: string;
  name: string;
  nameUr: string;
  businessName: string;
  businessNameUr: string;
  phoneMasked: string;
  fullPhone: string;
  avatar: string;
  categoryIds: string[];
  rating: number;
  totalReviews: number;
  ratingDistribution: { [stars: number]: number };
  verifiedBadges: {
    cnic: boolean;
    policeRecord: boolean;
    tradeCertified: boolean;
  };
  serviceAreas: string[]; // e.g. DHA, Gulberg, Johar Town, Model Town
  experienceYears: number;
  bioEn: string;
  bioUr: string;
  isOnline: boolean;
  hourlyRatePaisa: Paisa;
  walletBalancePaisa: Paisa;
  debtBalancePaisa: Paisa; // Commission owed for cash bookings
  completedJobsCount: number;
  verificationPassRate: number; // Percentage
  documents: ProviderDocument[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  labelUr: string;
  done: boolean;
}

export interface QuoteRevision {
  id: string;
  reasonEn: string;
  reasonUr: string;
  additionalPartsPaisa: Paisa;
  additionalLaborPaisa: Paisa;
  totalAdditionalPaisa: Paisa;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
}

export interface VerificationData {
  agentId?: string;
  agentName?: string;
  callState: 'IDLE' | 'DIALING' | 'IN_CALL' | 'COMPLETED' | 'UNREACHABLE';
  attempts: number;
  maxAttempts: number;
  slaMinutesRemaining: number;
  answers: {
    arrivedOnTime: boolean | null;
    workCompleted: 'FULL' | 'PARTIAL' | 'NONE' | null;
    beforeAfterShown: boolean | null;
    unapprovedCashAsked: boolean | null;
    satisfactionRating: number; // 1-5
  };
  outcome?: 'VERIFIED_SATISFIED' | 'VERIFIED_WITH_ISSUE' | 'REWORK_REQUIRED' | 'DISPUTED';
  agentNotes: string;
  verifiedAt?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  serviceId: string;
  categoryId: string;
  customerId: string;
  customerName: string;
  customerPhoneMasked: string;
  customerPhoneFull: string;
  customerAddress: {
    label: string;
    street: string;
    neighborhood: string; // Lahore area
    city: string;
  };
  providerId: string | null;
  providerName: string | null;
  providerPhoneMasked: string | null;
  status: BookingStatus;
  startOtp: string; // 4-digit code given to provider
  paymentMethod: PaymentMethod;
  paymentStatus: 'HELD_IN_ESCROW' | 'AUTHORIZED_FOR_CASH' | 'CASH_COLLECTED' | 'REFUNDED' | 'DISPUTED';
  pricing: {
    inspectionFeePaisa: Paisa;
    approvedLaborPaisa: Paisa;
    approvedPartsPaisa: Paisa;
    platformFeePaisa: Paisa;
    discountPaisa: Paisa;
    customerTotalPaisa: Paisa; // Max limit: final cannot exceed approved
    providerEarningsPaisa: Paisa;
    cashToCollectPaisa?: Paisa;
  };
  scheduledDate: string;
  scheduledSlot: string;
  problemDescriptionEn: string;
  problemDescriptionUr: string;
  problemPhotos: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  checklist: ChecklistItem[];
  quoteRevision?: QuoteRevision;
  verification?: VerificationData;
  complaint?: {
    id: string;
    category: string;
    details: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
    createdAt: string;
  };
  warranty: {
    eligible: boolean;
    validUntilDate?: string;
    claimed: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EscrowRecord {
  id: string;
  bookingRef: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  amountPaisa: Paisa;
  status: 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  heldAt: string;
  releasedAt?: string;
  notes: string;
}

export interface PayoutRecord {
  id: string;
  providerId: string;
  providerName: string;
  amountPaisa: Paisa;
  grossAmountPaisa?: Paisa;
  commissionDeductedPaisa?: Paisa;
  netAmountPaisa?: Paisa;
  bankName?: string;
  accountNumberMasked?: string;
  method: 'RAAST' | 'JAZZCASH' | 'BANK_TRANSFER';
  destinationMasked: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  processedAt: string;
  referenceCode: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  debitAccount: string;
  creditAccount: string;
  amountPaisa: Paisa;
  bookingRef?: string;
  memo: string;
  transactionType: 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'CASH_COMMISSION_DEBIT' | 'PAYOUT' | 'REFUND' | 'MANUAL_ADJUSTMENT';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorRole: Role;
  actorName: string;
  action: string;
  bookingRef?: string;
  details: string;
}

export interface CustomerAddress {
  id: string;
  title: string;
  titleUr: string;
  street: string;
  neighborhood: string;
  isDefault: boolean;
}

export interface MaintenancePlan {
  id: string;
  nameEn: string;
  nameUr: string;
  priceMonthlyPaisa: Paisa;
  billingFrequency: 'MONTHLY' | 'ANNUAL';
  featuresEn: string[];
  featuresUr: string[];
  includedInspectionsPerYear: number;
  discountPercentage: number;
}
