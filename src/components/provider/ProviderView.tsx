import React, { useState } from 'react';
import { Booking, Provider, formatPKR, Paisa } from '../../types';
import { BOOKING_STATUS_CONFIG } from '../../data/bookingStatusMap';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import { ImageFallback } from '../common/ImageFallback';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Square,
  DollarSign,
  Phone,
  Lock,
  Plus,
} from 'lucide-react';

export const ProviderView: React.FC = () => {
  const { t, locale } = useI18n();

  const provider = adapter.getProviderById('prov-usman-1') || adapter.getProviders()[0];
  const [isOnline, setIsOnline] = useState<boolean>(provider.isOnline);
  const [bookings, setBookings] = useState<Booking[]>(() => adapter.getBookings());
  const [selectedJob, setSelectedJob] = useState<Booking | null>(() => {
    // Default to the first active job or in-progress job
    return adapter.getBookings().find(b => ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'QUOTE_REVISED', 'AWAITING_VERIFICATION', 'VERIFIED_SATISFIED'].includes(b.status)) || null;
  });

  // Modal / Action states
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Quote revision state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionParts, setRevisionParts] = useState('1200');
  const [revisionLabor, setRevisionLabor] = useState('600');
  const [revisionReason, setRevisionReason] = useState('Found damaged compressor contactor relay requiring replacement.');

  // Photo simulation
  const [afterPhotoAttached, setAfterPhotoAttached] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const reloadData = () => {
    const list = adapter.getBookings();
    setBookings(list);
    if (selectedJob) {
      const updated = list.find(b => b.id === selectedJob.id);
      if (updated) setSelectedJob(updated);
    }
  };

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    adapter.updateProviderOnlineStatus(provider.id, nextState);
  };

  // Job Actions
  const handleDepart = () => {
    if (!selectedJob) return;
    adapter.departToCustomer(selectedJob.id);
    setActionSuccessMsg('Status updated: On The Way. Customer has been alerted.');
    reloadData();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setOtpError(null);

    const res = adapter.verifyStartOtp(selectedJob.id, otpInput);
    if (res.success) {
      setActionSuccessMsg('Start OTP verified successfully! Job clock started.');
      setOtpInput('');
      reloadData();
    } else {
      setOtpError(res.error || 'Invalid OTP code.');
    }
  };

  const handleToggleChecklist = (itemId: string, done: boolean) => {
    if (!selectedJob) return;
    adapter.updateChecklist(selectedJob.id, itemId, done);
    reloadData();
  };

  const handleRequestRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    const partsPaisa = Math.round(parseFloat(revisionParts || '0') * 100);
    const laborPaisa = Math.round(parseFloat(revisionLabor || '0') * 100);

    adapter.requestQuoteRevision(
      selectedJob.id,
      revisionReason,
      `اضافی پرزہ جات اور لیبر چارجز: ${revisionReason}`,
      partsPaisa,
      laborPaisa
    );
    setShowRevisionModal(false);
    setActionSuccessMsg('Quote revision sent to customer. Awaiting their digital approval.');
    reloadData();
  };

  const handleMarkComplete = () => {
    if (!selectedJob) return;
    adapter.markJobComplete(
      selectedJob.id,
      afterPhotoAttached
        ? ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80']
        : []
    );
    setActionSuccessMsg('Job marked complete! Status is now AWAITING VERIFICATION. QA agent will call customer before payout/cash.');
    reloadData();
  };

  const handleCollectCash = () => {
    if (!selectedJob) return;
    const res = adapter.collectCashPayment(selectedJob.id);
    if (res.success) {
      setActionSuccessMsg('Cash payment collected. Platform commission debited to ledger.');
      reloadData();
    } else {
      setOtpError(res.error || 'Cash collection not allowed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Mobile-First Technician Bar */}
      <div className="bg-[#050B14] text-white rounded-3xl p-5 sm:p-6 border border-blue-500/30 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-dark opacity-35 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <ImageFallback
              src={provider.avatar}
              alt={provider.name}
              type="avatar"
              className="w-12 h-12 rounded-full border-2 border-blue-500/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white font-display">{provider.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border border-blue-400/40 text-cyan-300 bg-blue-900/40">
                  TEVTA PRO
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {provider.businessName} · <span className="font-mono-nums text-cyan-300 font-bold">{provider.rating.toFixed(2)}★</span> Rating
              </div>
            </div>
          </div>

          {/* Availability Toggle (44px target) */}
          <button
            onClick={handleToggleOnline}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-display uppercase tracking-wider ${
              isOnline
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-cyan-300 animate-ping' : 'bg-slate-500'}`} />
            <span>{isOnline ? 'Active Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Quick Earnings & SLA Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-900/60 text-center relative z-10 font-mono">
          <div className="p-2.5 bg-blue-950/50 rounded-xl border border-blue-900/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Today's Earnings</span>
            <span className="text-sm font-bold text-cyan-300 font-mono-nums">PKR 4,850</span>
          </div>
          <div className="p-2.5 bg-blue-950/50 rounded-xl border border-blue-900/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Completed</span>
            <span className="text-sm font-bold text-white font-mono-nums">{provider.completedJobsCount}</span>
          </div>
          <div className="p-2.5 bg-blue-950/50 rounded-xl border border-blue-900/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">QA Pass Score</span>
            <span className="text-sm font-bold text-cyan-400 font-mono-nums">{provider.verificationPassRate}%</span>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-500 hover:text-slate-800 font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* Job Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {bookings.map(b => {
          const isSelected = selectedJob?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                setSelectedJob(b);
                setOtpError(null);
                setActionSuccessMsg(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[44px] transition-all border ${
                isSelected
                  ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{b.bookingRef}</span>
              <span className="ml-2 text-[10px] opacity-80">({b.status.replace(/_/g, ' ')})</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE JOB EXECUTION CONSOLE */}
      {selectedJob ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
          {/* Top Job Overview */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">{selectedJob.bookingRef}</span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                    BOOKING_STATUS_CONFIG[selectedJob.status].badgeClass
                  }`}
                >
                  {BOOKING_STATUS_CONFIG[selectedJob.status].labelEn}
                </span>
                <span className="text-xs text-slate-500">· {selectedJob.paymentMethod}</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                {selectedJob.customerAddress.street}, {selectedJob.customerAddress.neighborhood}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Your Technician Share</span>
              <span className="text-lg font-black text-teal-950 tabular-nums">
                {formatPKR(selectedJob.pricing.providerEarningsPaisa)}
              </span>
            </div>
          </div>

          {/* Customer Contact & Problem Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Customer Name & Contact:</span>
              <div className="font-bold text-slate-900">{selectedJob.customerName}</div>
              <div className="text-slate-600 font-mono mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedJob.customerPhoneMasked}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">Reported Problem Symptoms:</span>
              <p className="text-slate-800 font-medium mt-0.5">{selectedJob.problemDescriptionEn}</p>
            </div>
          </div>

          {/* 1. DISPATCH / DEPART STEP */}
          {(selectedJob.status === 'ACCEPTED' || selectedJob.status === 'REQUESTED') && (
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="font-bold text-sm text-blue-950">Step 1: Depart to Customer Address</div>
              <p className="text-xs text-blue-900">
                Notify customer that you are on the way. The app records your transit timestamp.
              </p>
              <button
                onClick={handleDepart}
                className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px] flex items-center justify-center gap-2"
              >
                <span>Depart to Customer Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. CUSTOMER START OTP VERIFICATION STEP */}
          {(selectedJob.status === 'ON_THE_WAY' || selectedJob.status === 'ARRIVED') && (
            <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
              <div className="font-bold text-sm text-teal-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-800" />
                <span>Step 2: Enter Customer Start OTP</span>
              </div>
              <p className="text-xs text-teal-900">
                Ask customer for their 4-digit secret code upon physical arrival. Job clock will NOT initiate without it.
              </p>

              {otpError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 font-semibold">
                  {otpError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="Enter 4-digit OTP (e.g. 8421)"
                  className="w-full sm:w-64 p-3 text-center font-mono font-bold tracking-widest text-base border border-slate-300 rounded-lg focus:outline-teal-700"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                >
                  Verify & Start Job
                </button>
              </form>
            </div>
          )}

          {/* 3. IN PROGRESS: CHECKLIST & QUOTE REVISION */}
          {(selectedJob.status === 'IN_PROGRESS' || selectedJob.status === 'QUOTE_REVISED') && (
            <div className="space-y-6">
              {/* Mandatory Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Technician Service Checklist (SRS Requirement)
                  </h3>
                  <span className="text-[11px] text-slate-500">Check off items as completed</span>
                </div>

                <div className="space-y-2">
                  {selectedJob.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id, !item.done)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors min-h-[44px] ${
                        item.done
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.done ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={item.done ? 'line-through text-slate-500 font-medium' : 'font-semibold'}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase">QA Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-Site Scope / Quote Revision Requester */}
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      Need Additional Parts or Labor?
                    </h4>
                    <p className="text-xs text-purple-900">
                      Never demand off-app cash. Submit digital revision for customer one-tap approval.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRevisionModal(!showRevisionModal)}
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                  >
                    + Request Quote Revision
                  </button>
                </div>

                {selectedJob.quoteRevision && (
                  <div className="p-3 bg-white rounded-lg border border-purple-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-purple-950">
                      <span>Status: {selectedJob.quoteRevision.status}</span>
                      <span className="tabular-nums">+{formatPKR(selectedJob.quoteRevision.totalAdditionalPaisa)}</span>
                    </div>
                    <div className="text-slate-600">{selectedJob.quoteRevision.reasonEn}</div>
                  </div>
                )}
              </div>

              {/* Mark Complete & Photo Upload */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">Complete Job & Upload Work Evidence</h4>
                  <p className="text-xs text-slate-600">
                    Take high-resolution photo of repaired appliance or work area.
                  </p>
                </div>

                <div
                  onClick={() => setAfterPhotoAttached(!afterPhotoAttached)}
                  className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                    afterPhotoAttached
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                      : 'border-slate-300 hover:border-slate-400 text-slate-600'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <span className="text-xs font-semibold block">
                    {afterPhotoAttached ? '✓ 1 After-Photo Uploaded (Simulated)' : 'Tap to Attach Work Evidence Photo'}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <strong>Strict Quality Rule:</strong> Marking complete changes status strictly to{' '}
                  <strong>Awaiting verification</strong>. Funds and cash collection are locked until the customer confirms satisfaction to our QA telephone agent.
                </div>

                <button
                  onClick={handleMarkComplete}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                >
                  Mark Job Complete (Submit for QA Verification)
                </button>
              </div>
            </div>
          )}

          {/* 4. AWAITING VERIFICATION / QA STATUS */}
          {selectedJob.status === 'AWAITING_VERIFICATION' && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-950 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Job Status: Awaiting Verification (QA Audit In Progress)</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Your after-photos have been submitted. Our independent verification agent is contacting customer{' '}
                <strong>{selectedJob.customerName}</strong> via phone within our 30-minute SLA.
              </p>
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs text-slate-700 font-medium">
                🔒 Payout / Cash collection will unlock automatically once customer responds to verification call.
              </div>
            </div>
          )}

          {/* 5. VERIFIED_SATISFIED -> CASH COLLECTION (IF CASH JOB) */}
          {(selectedJob.status === 'VERIFIED_SATISFIED' || selectedJob.status === 'CASH_COLLECTED') && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Verification Approved by QA Agent!</span>
              </div>

              {selectedJob.paymentMethod === 'CASH' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm">Authorized Cash Collection</div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Cash to Collect from Customer:</span>
                      <span className="font-black text-base text-emerald-900 tabular-nums">
                        {formatPKR(selectedJob.pricing.customerTotalPaisa)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Platform Commission (Auto-Debited to your wallet):</span>
                      <span className="tabular-nums font-semibold text-rose-700">
                        -{formatPKR(selectedJob.pricing.platformFeePaisa)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-2">
                      <span>Net Technician Profit Retained in Hand:</span>
                      <span className="tabular-nums text-emerald-800">
                        {formatPKR(selectedJob.pricing.providerEarningsPaisa)}
                      </span>
                    </div>
                  </div>

                  {selectedJob.status === 'CASH_COLLECTED' ? (
                    <div className="p-3 bg-emerald-100/70 text-emerald-950 rounded-lg text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Cash collected and ledger updated. Job cycle closed!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleCollectCash}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                    >
                      Confirm Cash Received from Customer ({formatPKR(selectedJob.pricing.customerTotalPaisa)})
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900 text-sm">Digital Escrow Released!</div>
                  <p className="text-slate-600">
                    PKR {(selectedJob.pricing.providerEarningsPaisa / 100).toFixed(0)} has been released from escrow into your verified bank account (Meezan Bank ending 8192).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          No job currently selected. Toggle active status to receive new incoming dispatches.
        </div>
      )}

      {/* Quote Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Request Quote Revision</h3>
            <p className="text-xs text-slate-600">
              Enter parts and labor adjustments. Customer must digitally approve before you can invoice for these.
            </p>

            <form onSubmit={handleRequestRevision} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Additional Parts (PKR):</label>
                <input
                  type="number"
                  value={revisionParts}
                  onChange={e => setRevisionParts(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Additional Labor (PKR):</label>
                <input
                  type="number"
                  value={revisionLabor}
                  onChange={e => setRevisionLabor(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Technical Reason / Diagnostic Proof:</label>
                <textarea
                  value={revisionReason}
                  onChange={e => setRevisionReason(e.target.value)}
                  className="w-full h-20 p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white text-xs font-bold rounded-lg min-h-[44px]"
                >
                  Submit Revision to Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
