import React, { useState } from 'react';
import { Booking, BookingStatus, formatPKR } from '../../types';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import {
  Headphones,
  Phone,
  PhoneCall,
  PhoneOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Star,
  Lock,
  ArrowRight,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';

export const AgentView: React.FC = () => {
  const { t, locale } = useI18n();

  const [bookings, setBookings] = useState<Booking[]>(() => adapter.getBookings());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(() => {
    const queue = adapter.getBookings().filter(b => b.status === 'AWAITING_VERIFICATION' || b.verification);
    return queue[0]?.id || null;
  });

  // Call form state
  const [callState, setCallState] = useState<'IDLE' | 'DIALING' | 'IN_CALL' | 'COMPLETED' | 'UNREACHABLE'>('IDLE');
  const [qArrivedOnTime, setQArrivedOnTime] = useState<boolean | null>(true);
  const [qWorkCompleted, setQWorkCompleted] = useState<'FULL' | 'PARTIAL' | 'NONE'>('FULL');
  const [qBeforeAfterShown, setQBeforeAfterShown] = useState<boolean | null>(true);
  const [qUnapprovedCashAsked, setQUnapprovedCashAsked] = useState<boolean | null>(false);
  const [qSatisfactionRating, setQSatisfactionRating] = useState<number>(5);
  const [agentNotes, setAgentNotes] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<'VERIFIED_SATISFIED' | 'VERIFIED_WITH_ISSUE' | 'REWORK_REQUIRED' | 'DISPUTED'>('VERIFIED_SATISFIED');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const reloadData = () => {
    const list = adapter.getBookings();
    setBookings(list);
  };

  const currentBooking = bookings.find(b => b.id === selectedBookingId);

  // Filter verification queue
  const queueBookings = bookings.filter(
    b => b.status === 'AWAITING_VERIFICATION' || b.verification?.callState !== 'COMPLETED'
  );

  const handleClaim = (booking: Booking) => {
    adapter.claimVerification(booking.id, 'agent-farah-1', 'Farah Naz');
    reloadData();
    setActionNotice(`You claimed booking ${booking.bookingRef}. Audit lock engaged.`);
  };

  const handleStartCall = () => {
    if (!currentBooking) return;
    setCallState('DIALING');
    adapter.updateVerificationCallState(currentBooking.id, 'DIALING');
    setTimeout(() => {
      setCallState('IN_CALL');
      adapter.updateVerificationCallState(currentBooking.id, 'IN_CALL');
    }, 1500);
  };

  const handleUnreachable = () => {
    if (!currentBooking) return;
    setCallState('UNREACHABLE');
    // Increment attempts; Enforce Max 3; Booking STAYS AWAITING_VERIFICATION with sub-state updated!
    adapter.updateVerificationCallState(currentBooking.id, 'UNREACHABLE', true);
    reloadData();
    setActionNotice(
      `Attempt logged for ${currentBooking.bookingRef}. Status remains Awaiting Verification. Max 3 attempts before customer one-tap SMS fallback.`
    );
  };

  // Rule verification: If no work done OR unapproved cash asked, force DISPUTED
  const mustBeDisputed = qWorkCompleted === 'NONE' || qUnapprovedCashAsked === true;

  const handleSubmitOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBooking) return;
    setValidationError(null);

    if (mustBeDisputed && selectedOutcome !== 'DISPUTED') {
      setValidationError(
        'Critical Quality Rule: When work is NOT completed or an unapproved cash surcharge was asked, outcome MUST be DISPUTED.'
      );
      return;
    }

    const res = adapter.submitVerificationOutcome(
      currentBooking.id,
      {
        arrivedOnTime: qArrivedOnTime ?? true,
        workCompleted: qWorkCompleted,
        beforeAfterShown: qBeforeAfterShown ?? true,
        unapprovedCashAsked: qUnapprovedCashAsked ?? false,
        satisfactionRating: qSatisfactionRating,
      },
      selectedOutcome,
      agentNotes || 'Customer confirmed completion details via telephone verification audit.',
      'agent-farah-1',
      'Farah Naz (Senior QA Officer)'
    );

    if (res.success) {
      setActionNotice(
        `Verification submitted as ${selectedOutcome}. Financial triggers: ${
          selectedOutcome === 'VERIFIED_SATISFIED' ? 'Escrow Released to Provider' : 'Dispute Hold Engaged'
        }.`
      );
      setCallState('IDLE');
      reloadData();
    } else {
      setValidationError(res.error || 'Failed to submit verification.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Agent Top Bar */}
      <div className="bg-[#050B14] text-white rounded-3xl p-6 sm:p-7 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-dark opacity-35 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
              QA TELEPHONY AUDIT COMMAND // DESK 04
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
            Farah Naz · Senior Verification Officer
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Lahore Central Operations · Mandatory post-service telephonic audit & cryptographic escrow release protocol.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-800/80 text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Queue SLA Target</span>
            <span className="text-sm font-bold text-cyan-400 font-mono-nums">100% &lt; 30 min</span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-500 hover:text-slate-800 font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Left Queue (Desktop 4 cols), Right Console (Desktop 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Verification Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">
              Audit Call Queue ({queueBookings.length})
            </h2>
            <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Live Priority
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {queueBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                All verification calls are currently up to date.
              </div>
            ) : (
              queueBookings.map(b => {
                const isSelected = selectedBookingId === b.id;
                const isClaimedByMe = b.verification?.agentId === 'agent-farah-1';
                const slaMins = b.verification?.slaMinutesRemaining ?? 20;

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBookingId(b.id);
                      setCallState('IDLE');
                      setValidationError(null);
                    }}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{b.bookingRef}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          slaMins <= 10
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        SLA: {slaMins}m left
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900">{b.customerName}</div>
                    <div className="text-slate-500">{b.customerAddress.neighborhood} · {b.paymentMethod}</div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500">
                        Technician: <strong className="text-slate-700">{b.providerName}</strong>
                      </span>
                      <span className="font-mono font-bold text-teal-900">
                        {formatPKR(b.pricing.customerTotalPaisa)}
                      </span>
                    </div>

                    {!isClaimedByMe && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleClaim(b);
                        }}
                        className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors"
                      >
                        Claim for Call
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Call Execution Console */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {currentBooking ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{currentBooking.bookingRef}</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      Awaiting Verification Audit
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                    Customer: {currentBooking.customerName}
                  </h2>
                </div>

                {/* Agent Call Action Button */}
                <div className="flex items-center gap-2">
                  {callState === 'IDLE' && (
                    <button
                      onClick={handleStartCall}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-2 min-h-[44px]"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Initiate QA Call (Audit Line)</span>
                    </button>
                  )}

                  {callState === 'DIALING' && (
                    <div className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 animate-pulse min-h-[44px]">
                      <Phone className="w-4 h-4 animate-spin" />
                      <span>Dialing {currentBooking.customerPhoneFull}...</span>
                    </div>
                  )}

                  {callState === 'IN_CALL' && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-300 min-h-[44px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                        <span>In Call with Customer</span>
                      </span>
                      <button
                        onClick={handleUnreachable}
                        className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg min-h-[44px] flex items-center gap-1"
                        title="Customer Unreachable"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>Unreachable (Log Attempt)</span>
                      </button>
                    </div>
                  )}

                  {callState === 'UNREACHABLE' && (
                    <button
                      onClick={handleStartCall}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 min-h-[44px]"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Retry Call (Attempt {(currentBooking.verification?.attempts || 0) + 1}/3)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Profile & Attempt Status */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Unmasked Direct Phone (QA Audit):</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">{currentBooking.customerPhoneFull}</div>
                  <div className="text-slate-500">{currentBooking.customerAddress.street}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">Technician & Earnings:</span>
                  <div className="font-bold text-slate-900">{currentBooking.providerName}</div>
                  <div className="text-slate-600">
                    Gross: {formatPKR(currentBooking.pricing.customerTotalPaisa)} · Net: {formatPKR(currentBooking.pricing.providerEarningsPaisa)}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Call Attempts & Sub-State:</span>
                  <div className="font-bold text-slate-900">
                    Attempt {currentBooking.verification?.attempts || 0} of 3
                  </div>
                  <span className="text-[11px] text-slate-600">
                    {currentBooking.verification?.attempts && currentBooking.verification.attempts >= 3
                      ? '⚠️ Max attempts reached: Customer sent One-Tap verification SMS link.'
                      : 'Call attempt logs retained in permanent audit ledger.'}
                  </span>
                </div>
              </div>

              {/* Bilingual Call Script */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-blue-950 uppercase tracking-wider block">
                  Mandatory Verification Call Script (اردو / English)
                </span>
                <p className="text-blue-900 italic">
                  "Assalam o Alaikum {currentBooking.customerName} sb! Main Smart Home Quality Assurance team se Farah Naz baat kar rahi hoon. Aap ke ghar {currentBooking.providerName} ne service complete ki hai. Kya main quality confirmation ke 4 sawalat pooch sakti hoon?"
                </p>
              </div>

              {/* 5-POINT MANDATORY QUESTIONNAIRE */}
              <form onSubmit={handleSubmitOutcome} className="space-y-5">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
                  5-Point Customer Audit Questionnaire
                </h3>

                {validationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Q1 */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-800 block">
                    1. Did technician arrive within the scheduled window and present identity?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setQArrivedOnTime(true)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${
                        qArrivedOnTime === true ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200'
                      }`}
                    >
                      Yes, On Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setQArrivedOnTime(false)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${
                        qArrivedOnTime === false ? 'border-rose-700 bg-rose-50 text-rose-900' : 'border-slate-200'
                      }`}
                    >
                      No, Delayed / Irregular
                    </button>
                  </div>
                </div>

                {/* Q2: Work Completed */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-800 block">
                    2. Was the requested repair work fully tested and functioning?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setQWorkCompleted('FULL')}
                      className={`py-2 rounded-lg border text-xs font-semibold ${
                        qWorkCompleted === 'FULL' ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200'
                      }`}
                    >
                      Fully Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setQWorkCompleted('PARTIAL')}
                      className={`py-2 rounded-lg border text-xs font-semibold ${
                        qWorkCompleted === 'PARTIAL' ? 'border-amber-700 bg-amber-50 text-amber-900' : 'border-slate-200'
                      }`}
                    >
                      Partial Completion
                    </button>
                    <button
                      type="button"
                      onClick={() => setQWorkCompleted('NONE')}
                      className={`py-2 rounded-lg border text-xs font-semibold ${
                        qWorkCompleted === 'NONE' ? 'border-rose-700 bg-rose-50 text-rose-900 font-bold' : 'border-slate-200'
                      }`}
                    >
                      No Work Completed
                    </button>
                  </div>
                </div>

                {/* Q3: Before / After shown */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-800 block">
                    3. Did the technician demonstrate the before and after condition?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setQBeforeAfterShown(true)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${
                        qBeforeAfterShown === true ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200'
                      }`}
                    >
                      Yes, Demonstrated
                    </button>
                    <button
                      type="button"
                      onClick={() => setQBeforeAfterShown(false)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${
                        qBeforeAfterShown === false ? 'border-rose-700 bg-rose-50 text-rose-900' : 'border-slate-200'
                      }`}
                    >
                      No Evidence Shown
                    </button>
                  </div>
                </div>

                {/* Q4: Unapproved Cash Asked */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-800 block">
                    4. Did the technician demand any unapproved extra cash payment?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setQUnapprovedCashAsked(false)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${
                        qUnapprovedCashAsked === false ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200'
                      }`}
                    >
                      No Unapproved Cash (Correct)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQUnapprovedCashAsked(true)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${
                        qUnapprovedCashAsked === true ? 'border-rose-700 bg-rose-50 text-rose-900 font-bold' : 'border-slate-200'
                      }`}
                    >
                      Yes, Unapproved Fee Demanded
                    </button>
                  </div>
                </div>

                {/* Q5: Satisfaction Rating */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-800 block">
                    5. Overall Customer Satisfaction Rating (1 to 5 Stars):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setQSatisfactionRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= qSatisfactionRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">
                      {qSatisfactionRating} Stars Recorded
                    </span>
                  </div>
                </div>

                {/* Agent Audit Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Agent Logged Observations:
                  </label>
                  <textarea
                    value={agentNotes}
                    onChange={e => setAgentNotes(e.target.value)}
                    placeholder="Enter customer verbal testimony, tone, and any special remarks..."
                    className="w-full h-20 p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-700"
                  />
                </div>

                {/* OUTCOME SELECTION */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Determine Verification Decision
                    </span>
                    {mustBeDisputed && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Rule Triggered: Disputed Mandatory
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      disabled={mustBeDisputed}
                      onClick={() => setSelectedOutcome('VERIFIED_SATISFIED')}
                      className={`p-3 rounded-lg border font-bold text-center transition-all ${
                        selectedOutcome === 'VERIFIED_SATISFIED'
                          ? 'border-emerald-700 bg-emerald-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      Verified: Satisfied
                    </button>

                    <button
                      type="button"
                      disabled={mustBeDisputed}
                      onClick={() => setSelectedOutcome('VERIFIED_WITH_ISSUE')}
                      className={`p-3 rounded-lg border font-bold text-center transition-all ${
                        selectedOutcome === 'VERIFIED_WITH_ISSUE'
                          ? 'border-amber-700 bg-amber-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      Verified with Issue
                    </button>

                    <button
                      type="button"
                      disabled={mustBeDisputed}
                      onClick={() => setSelectedOutcome('REWORK_REQUIRED')}
                      className={`p-3 rounded-lg border font-bold text-center transition-all ${
                        selectedOutcome === 'REWORK_REQUIRED'
                          ? 'border-purple-700 bg-purple-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      Rework Required
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOutcome('DISPUTED')}
                      className={`p-3 rounded-lg border font-bold text-center transition-all ${
                        selectedOutcome === 'DISPUTED'
                          ? 'border-rose-700 bg-rose-700 text-white'
                          : 'border-slate-200 text-rose-800 hover:bg-rose-50'
                      }`}
                    >
                      Disputed (Freeze)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                >
                  Confirm Outcome & Trigger Financial Workflow
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select a booking from the verification queue to begin the telephone audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
