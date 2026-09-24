import {
  Booking,
  BookingStatus,
  Provider,
  ServiceCategory,
  ServiceItem,
  EscrowRecord,
  PayoutRecord,
  LedgerEntry,
  CustomerAddress,
  MaintenancePlan,
  AuditLogItem,
  Role,
  Paisa,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_PROVIDERS,
  INITIAL_BOOKINGS,
  INITIAL_ESCROW_RECORDS,
  INITIAL_PAYOUTS,
  INITIAL_LEDGER,
  INITIAL_CUSTOMER_ADDRESSES,
  INITIAL_MAINTENANCE_PLANS,
  INITIAL_AUDIT_LOGS,
} from './mockData';

const STORAGE_KEYS = {
  BOOKINGS: 'shm_bookings_v2',
  PROVIDERS: 'shm_providers_v2',
  ESCROW: 'shm_escrow_v2',
  PAYOUTS: 'shm_payouts_v2',
  LEDGER: 'shm_ledger_v2',
  ADDRESSES: 'shm_addresses_v2',
  AUDIT_LOGS: 'shm_audit_v2',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error parsing localStorage key ${key}`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving localStorage key ${key}`, e);
  }
}

class ServiceAdapter {
  private categories: ServiceCategory[] = INITIAL_CATEGORIES;
  private services: ServiceItem[] = INITIAL_SERVICES;
  private maintenancePlans: MaintenancePlan[] = INITIAL_MAINTENANCE_PLANS;

  // Categories & Services
  getCategories(): ServiceCategory[] {
    return [...this.categories];
  }

  getCategoryById(id: string): ServiceCategory | undefined {
    return this.categories.find(c => c.id === id);
  }

  getServices(categoryId?: string): ServiceItem[] {
    if (!categoryId) return [...this.services];
    return this.services.filter(s => s.categoryId === categoryId);
  }

  getServiceById(id: string): ServiceItem | undefined {
    return this.services.find(s => s.id === id);
  }

  // Providers
  getProviders(categoryId?: string): Provider[] {
    const providers: Provider[] = loadStorage(STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
    if (!categoryId) return providers;
    return providers.filter(p => p.categoryIds.includes(categoryId));
  }

  getProviderById(id: string): Provider | undefined {
    const providers = this.getProviders();
    return providers.find(p => p.id === id);
  }

  updateProviderOnlineStatus(providerId: string, isOnline: boolean): void {
    const providers = this.getProviders();
    const updated = providers.map(p => (p.id === providerId ? { ...p, isOnline } : p));
    saveStorage(STORAGE_KEYS.PROVIDERS, updated);
  }

  // Bookings
  getBookings(): Booking[] {
    return loadStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }

  getBookingById(id: string): Booking | undefined {
    const bookings = this.getBookings();
    return bookings.find(b => b.id === id || b.bookingRef === id);
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
    const bookings = this.getBookings();
    const id = `bk-${Date.now()}`;
    const newBooking: Booking = {
      ...bookingData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newBooking, ...bookings];
    saveStorage(STORAGE_KEYS.BOOKINGS, updated);

    // If online escrow, record initial escrow hold in finance engine
    if (bookingData.paymentMethod === 'ONLINE_ESCROW') {
      this.recordEscrowHold(newBooking);
    }

    this.addAuditLog({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorRole: 'customer',
      actorName: newBooking.customerName,
      action: 'BOOKING_CREATED',
      bookingRef: newBooking.bookingRef,
      details: `New booking submitted with ${newBooking.paymentMethod} payment. Initial status: ${newBooking.status}.`,
    });

    return newBooking;
  }

  updateBookingStatus(id: string, newStatus: BookingStatus, notes?: string): Booking | undefined {
    const bookings = this.getBookings();
    let updatedBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === id) {
        updatedBooking = {
          ...b,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        return updatedBooking;
      }
      return b;
    });

    if (updatedBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'admin',
        actorName: 'System / Operator',
        action: `STATUS_CHANGED_TO_${newStatus}`,
        bookingRef: updatedBooking.bookingRef,
        details: notes || `State transitioned to ${newStatus}`,
      });
    }

    return updatedBooking;
  }

  // Technician Depart
  departToCustomer(bookingId: string): Booking | undefined {
    return this.updateBookingStatus(bookingId, 'ON_THE_WAY', 'Technician departed towards customer address.');
  }

  // Technician Arrive & verify OTP
  verifyStartOtp(bookingId: string, otpInput: string): { success: boolean; error?: string; booking?: Booking } {
    const booking = this.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (booking.startOtp.trim() !== otpInput.trim()) {
      return { success: false, error: 'Invalid Customer Start OTP. Please ask customer for their 4-digit code.' };
    }

    const updated = this.updateBookingStatus(bookingId, 'IN_PROGRESS', 'Customer Start OTP verified in person. Job timer initiated.');
    return { success: true, booking: updated };
  }

  // Checklist updates
  updateChecklist(bookingId: string, itemId: string, done: boolean): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const checklist = b.checklist.map(item => (item.id === itemId ? { ...item, done } : item));
        targetBooking = { ...b, checklist, updatedAt: new Date().toISOString() };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
    }
    return targetBooking;
  }

  // Quote Revision
  requestQuoteRevision(
    bookingId: string,
    reasonEn: string,
    reasonUr: string,
    additionalPartsPaisa: Paisa,
    additionalLaborPaisa: Paisa
  ): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const totalAdditionalPaisa = additionalPartsPaisa + additionalLaborPaisa;

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        targetBooking = {
          ...b,
          status: 'QUOTE_REVISED',
          quoteRevision: {
            id: `rev-${Date.now()}`,
            reasonEn,
            reasonUr,
            additionalPartsPaisa,
            additionalLaborPaisa,
            totalAdditionalPaisa,
            status: 'PENDING',
            requestedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'provider',
        actorName: targetBooking.providerName || 'Technician',
        action: 'QUOTE_REVISION_REQUESTED',
        bookingRef: targetBooking.bookingRef,
        details: `Requested PKR ${(totalAdditionalPaisa / 100).toFixed(0)} additional for parts/labor.`,
      });
    }

    return targetBooking;
  }

  // Customer responds to revision
  respondToQuoteRevision(bookingId: string, approve: boolean): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === bookingId && b.quoteRevision) {
        const rev = b.quoteRevision;
        if (approve) {
          const newParts = b.pricing.approvedPartsPaisa + rev.additionalPartsPaisa;
          const newLabor = b.pricing.approvedLaborPaisa + rev.additionalLaborPaisa;
          const newCustomerTotal = b.pricing.inspectionFeePaisa + newParts + newLabor + b.pricing.platformFeePaisa - b.pricing.discountPaisa;
          const newProviderEarnings = b.pricing.providerEarningsPaisa + rev.totalAdditionalPaisa;

          targetBooking = {
            ...b,
            status: 'IN_PROGRESS',
            pricing: {
              ...b.pricing,
              approvedPartsPaisa: newParts,
              approvedLaborPaisa: newLabor,
              customerTotalPaisa: newCustomerTotal,
              providerEarningsPaisa: newProviderEarnings,
              cashToCollectPaisa: b.paymentMethod === 'CASH' ? newCustomerTotal : undefined,
            },
            quoteRevision: {
              ...rev,
              status: 'APPROVED',
              respondedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        } else {
          targetBooking = {
            ...b,
            status: 'IN_PROGRESS',
            quoteRevision: {
              ...rev,
              status: 'REJECTED',
              respondedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'customer',
        actorName: targetBooking.customerName,
        action: approve ? 'QUOTE_REVISION_APPROVED' : 'QUOTE_REVISION_REJECTED',
        bookingRef: targetBooking.bookingRef,
        details: approve ? 'Customer approved additional quotation.' : 'Customer declined additional quotation; proceeding with base scope.',
      });
    }

    return targetBooking;
  }

  // Provider marks job completed (Moves STRICTLY to AWAITING_VERIFICATION, does not release funds!)
  markJobComplete(bookingId: string, afterPhotoUrls: string[]): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        targetBooking = {
          ...b,
          status: 'AWAITING_VERIFICATION',
          afterPhotos: afterPhotoUrls.length > 0 ? afterPhotoUrls : [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'
          ],
          updatedAt: new Date().toISOString(),
        };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'provider',
        actorName: targetBooking.providerName || 'Technician',
        action: 'JOB_MARKED_COMPLETE_AWAITING_QA',
        bookingRef: targetBooking.bookingRef,
        details: 'Technician uploaded after-evidence. Booking state moved strictly to AWAITING_VERIFICATION. Funds/cash collection NOT yet authorized.',
      });
    }

    return targetBooking;
  }

  // Cash collection by provider (ONLY allowed if status is VERIFIED_SATISFIED or cash is authorized)
  collectCashPayment(bookingId: string): { success: boolean; error?: string; booking?: Booking } {
    const booking = this.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (booking.paymentMethod !== 'CASH') {
      return { success: false, error: 'This is not a cash booking.' };
    }

    // Must be verified or authorized
    if (booking.status !== 'VERIFIED_SATISFIED' && booking.status !== 'AWAITING_VERIFICATION' && booking.status !== 'VERIFIED_WITH_ISSUE') {
      return { success: false, error: 'Cash collection is not permitted until quality verification is completed.' };
    }

    const updated = this.updateBookingStatus(bookingId, 'CASH_COLLECTED', 'Authorized cash payment collected in person from customer.');
    
    // Add ledger debit for platform commission
    this.recordCashCommission(booking);

    return { success: true, booking: updated };
  }

  // Verification Agent Operations
  claimVerification(bookingId: string, agentId: string, agentName: string): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        targetBooking = {
          ...b,
          verification: {
            ...b.verification,
            agentId,
            agentName,
            callState: 'IDLE',
            attempts: (b.verification?.attempts || 0),
            maxAttempts: 3,
            slaMinutesRemaining: b.verification?.slaMinutesRemaining || 20,
            answers: b.verification?.answers || {
              arrivedOnTime: null,
              workCompleted: null,
              beforeAfterShown: null,
              unapprovedCashAsked: null,
              satisfactionRating: 5,
            },
            agentNotes: b.verification?.agentNotes || '',
          },
          updatedAt: new Date().toISOString(),
        };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'agent',
        actorName: agentName,
        action: 'VERIFICATION_CLAIMED',
        bookingRef: targetBooking.bookingRef,
        details: `QA Agent ${agentName} claimed booking for customer verification call.`,
      });
    }

    return targetBooking;
  }

  updateVerificationCallState(
    bookingId: string,
    callState: 'IDLE' | 'DIALING' | 'IN_CALL' | 'COMPLETED' | 'UNREACHABLE',
    attemptIncrement: boolean = false
  ): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === bookingId && b.verification) {
        const attempts = attemptIncrement ? b.verification.attempts + 1 : b.verification.attempts;
        targetBooking = {
          ...b,
          // Booking remains AWAITING_VERIFICATION while call is in progress! Call progress is a sub-state.
          status: 'AWAITING_VERIFICATION',
          verification: {
            ...b.verification,
            callState,
            attempts,
          },
          updatedAt: new Date().toISOString(),
        };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
    }
    return targetBooking;
  }

  submitVerificationOutcome(
    bookingId: string,
    answers: {
      arrivedOnTime: boolean;
      workCompleted: 'FULL' | 'PARTIAL' | 'NONE';
      beforeAfterShown: boolean;
      unapprovedCashAsked: boolean;
      satisfactionRating: number;
    },
    outcome: 'VERIFIED_SATISFIED' | 'VERIFIED_WITH_ISSUE' | 'REWORK_REQUIRED' | 'DISPUTED',
    notes: string,
    agentId: string,
    agentName: string
  ): { success: boolean; error?: string; booking?: Booking } {
    // CRITICAL BUSINESS RULE:
    // If the answers indicate no work or an unapproved extra charge, only allow disputed.
    if (answers.workCompleted === 'NONE' || answers.unapprovedCashAsked === true) {
      if (outcome !== 'DISPUTED') {
        return {
          success: false,
          error: 'Mandatory Rule: When no work was completed or an unapproved extra charge was demanded, the outcome MUST be Disputed.',
        };
      }
    }

    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    let nextStatus: BookingStatus = outcome;

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        targetBooking = {
          ...b,
          status: nextStatus,
          verification: {
            ...b.verification,
            agentId,
            agentName,
            callState: 'COMPLETED',
            attempts: b.verification?.attempts || 1,
            maxAttempts: 3,
            slaMinutesRemaining: 0,
            answers,
            outcome,
            agentNotes: notes,
            verifiedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);

      // Financial effects triggered strictly upon verified outcome:
      if (outcome === 'VERIFIED_SATISFIED') {
        if (targetBooking.paymentMethod === 'ONLINE_ESCROW') {
          this.releaseEscrowForBooking(targetBooking.bookingRef);
        }
      } else if (outcome === 'DISPUTED') {
        this.freezeEscrowForBooking(targetBooking.bookingRef);
      }

      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'agent',
        actorName: agentName,
        action: `VERIFICATION_OUTCOME_${outcome}`,
        bookingRef: targetBooking.bookingRef,
        details: `QA agent recorded questionnaire answers (Satisfaction: ${answers.satisfactionRating}★). Outcome: ${outcome}. Notes: ${notes}`,
      });
    }

    return { success: true, booking: targetBooking };
  }

  // Customer Raise Complaint
  addComplaint(bookingId: string, category: string, details: string): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        targetBooking = {
          ...b,
          complaint: {
            id: `cmp-${Date.now()}`,
            category,
            details,
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'customer',
        actorName: targetBooking.customerName,
        action: 'COMPLAINT_REGISTERED',
        bookingRef: targetBooking.bookingRef,
        details: `Category: ${category}. Complaint logged for operations resolution.`,
      });
    }

    return targetBooking;
  }

  // Customer Warranty Claim (30-day warranty)
  claimWarranty(bookingId: string): Booking | undefined {
    const bookings = this.getBookings();
    let targetBooking: Booking | undefined;

    const updated = bookings.map(b => {
      if (b.id === bookingId && b.warranty.eligible) {
        targetBooking = {
          ...b,
          warranty: {
            ...b.warranty,
            claimed: true,
          },
          status: 'REWORK_REQUIRED',
          updatedAt: new Date().toISOString(),
        };
        return targetBooking;
      }
      return b;
    });

    if (targetBooking) {
      saveStorage(STORAGE_KEYS.BOOKINGS, updated);
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'customer',
        actorName: targetBooking.customerName,
        action: 'WARRANTY_CLAIMED',
        bookingRef: targetBooking.bookingRef,
        details: 'Customer triggered 30-day workmanship warranty claim. Free rework technician dispatch initiated.',
      });
    }

    return targetBooking;
  }

  // Finance Operations
  getEscrowRecords(): EscrowRecord[] {
    return loadStorage(STORAGE_KEYS.ESCROW, INITIAL_ESCROW_RECORDS);
  }

  recordEscrowHold(booking: Booking): void {
    const escrows = this.getEscrowRecords();
    const newRecord: EscrowRecord = {
      id: `esc-${Date.now()}`,
      bookingRef: booking.bookingRef,
      customerId: booking.customerId,
      customerName: booking.customerName,
      providerId: booking.providerId || 'unassigned',
      providerName: booking.providerName || 'Pending Assignment',
      amountPaisa: booking.pricing.customerTotalPaisa,
      status: 'HELD',
      heldAt: new Date().toISOString(),
      notes: `Escrow hold authorized at booking creation for ${booking.scheduledSlot}`,
    };
    saveStorage(STORAGE_KEYS.ESCROW, [newRecord, ...escrows]);

    this.addLedgerEntry({
      id: `led-${Date.now()}`,
      timestamp: new Date().toISOString(),
      debitAccount: `Customer Clearing (${booking.customerName})`,
      creditAccount: 'SmartHome Escrow Trust A/C',
      amountPaisa: booking.pricing.customerTotalPaisa,
      bookingRef: booking.bookingRef,
      memo: `Escrow deposit hold for ${booking.bookingRef}`,
      transactionType: 'ESCROW_HOLD',
    });
  }

  releaseEscrowForBooking(bookingRef: string): void {
    const escrows = this.getEscrowRecords();
    const updated = escrows.map(e => (e.bookingRef === bookingRef ? { ...e, status: 'RELEASED' as const, releasedAt: new Date().toISOString() } : e));
    saveStorage(STORAGE_KEYS.ESCROW, updated);
  }

  freezeEscrowForBooking(bookingRef: string): void {
    const escrows = this.getEscrowRecords();
    const updated = escrows.map(e => (e.bookingRef === bookingRef ? { ...e, status: 'DISPUTED' as const } : e));
    saveStorage(STORAGE_KEYS.ESCROW, updated);
  }

  recordCashCommission(booking: Booking): void {
    this.addLedgerEntry({
      id: `led-${Date.now()}`,
      timestamp: new Date().toISOString(),
      debitAccount: `Provider Wallet Debt (${booking.providerName})`,
      creditAccount: 'Platform Commission Revenue',
      amountPaisa: booking.pricing.platformFeePaisa,
      bookingRef: booking.bookingRef,
      memo: `Commission debit for cash job ${booking.bookingRef}`,
      transactionType: 'CASH_COMMISSION_DEBIT',
    });
  }

  getPayouts(): PayoutRecord[] {
    return loadStorage(STORAGE_KEYS.PAYOUTS, INITIAL_PAYOUTS);
  }

  processPayout(payoutId: string): void {
    const payouts = this.getPayouts();
    const updated = payouts.map(p => (p.id === payoutId ? { ...p, status: 'COMPLETED' as const, processedAt: new Date().toISOString() } : p));
    saveStorage(STORAGE_KEYS.PAYOUTS, updated);
  }

  getLedgerEntries(): LedgerEntry[] {
    return loadStorage(STORAGE_KEYS.LEDGER, INITIAL_LEDGER);
  }

  addLedgerEntry(entry: LedgerEntry): void {
    const ledger = this.getLedgerEntries();
    saveStorage(STORAGE_KEYS.LEDGER, [entry, ...ledger]);
  }

  getAuditLogs(): AuditLogItem[] {
    return loadStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  addAuditLog(item: AuditLogItem): void {
    const logs = this.getAuditLogs();
    saveStorage(STORAGE_KEYS.AUDIT_LOGS, [item, ...logs]);
  }

  // Saved Addresses
  getCustomerAddresses(): CustomerAddress[] {
    return loadStorage(STORAGE_KEYS.ADDRESSES, INITIAL_CUSTOMER_ADDRESSES);
  }

  addCustomerAddress(addr: CustomerAddress): void {
    const list = this.getCustomerAddresses();
    saveStorage(STORAGE_KEYS.ADDRESSES, [...list, addr]);
  }

  getMaintenancePlans(): MaintenancePlan[] {
    return this.maintenancePlans;
  }

  // Masking helpers based on Role
  maskPhone(phone: string, viewerRole: Role, isAssignedBooking: boolean = false): string {
    if (viewerRole === 'admin' || viewerRole === 'agent' || viewerRole === 'finance') {
      return phone; // Full audit access
    }
    if (isAssignedBooking) {
      return phone; // During active job, customer and provider can contact
    }
    // Masked for public / unassigned
    const parts = phone.split('-');
    if (parts.length === 2) {
      return `${parts[0]}-***${parts[1].slice(-4)}`;
    }
    return phone.slice(0, 4) + '***' + phone.slice(-3);
  }
}

export const adapter = new ServiceAdapter();
