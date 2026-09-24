import React, { useState } from 'react';
import { Booking, formatPKR } from '../../types';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import { X, CheckCircle2, Star, ShieldCheck, AlertCircle } from 'lucide-react';

interface CustomerOneTapVerifyModalProps {
  booking: Booking | null;
  onClose: () => void;
  onVerified: () => void;
}

export const CustomerOneTapVerifyModal: React.FC<CustomerOneTapVerifyModalProps> = ({
  booking,
  onClose,
  onVerified,
}) => {
  const { t, locale } = useI18n();

  const [arrivedOnTime, setArrivedOnTime] = useState<boolean | null>(true);
  const [workCompleted, setWorkCompleted] = useState<'FULL' | 'PARTIAL' | 'NONE'>('FULL');
  const [beforeAfterShown, setBeforeAfterShown] = useState<boolean | null>(true);
  const [unapprovedCashAsked, setUnapprovedCashAsked] = useState<boolean | null>(false);
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [customerNotes, setCustomerNotes] = useState<string>('Work was completed neatly and tested thoroughly.');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If answers indicate no work or unapproved cash, enforce Dispute
    const isDisputedCondition = workCompleted === 'NONE' || unapprovedCashAsked === true;
    const outcome = isDisputedCondition ? 'DISPUTED' : (workCompleted === 'FULL' ? 'VERIFIED_SATISFIED' : 'VERIFIED_WITH_ISSUE');

    const result = adapter.submitVerificationOutcome(
      booking.id,
      {
        arrivedOnTime: arrivedOnTime ?? true,
        workCompleted,
        beforeAfterShown: beforeAfterShown ?? true,
        unapprovedCashAsked: unapprovedCashAsked ?? false,
        satisfactionRating,
      },
      outcome,
      `Customer self-verified via One-Tap link: ${customerNotes}`,
      'customer-self',
      `${booking.customerName} (Self-Verification)`
    );

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    } else {
      setErrorMsg(result.error || 'Verification error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-teal-800 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>One-Tap Customer Verification</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Confirm Work Quality for {booking.bookingRef}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">Thank you for verifying!</h4>
              <p className="text-xs text-slate-600">
                Your feedback has been logged. Escrow disbursement and warranty coverage are now active.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 space-y-1">
                <strong>Technician: {booking.providerName}</strong>
                <div>Location: {booking.customerAddress.neighborhood}</div>
                <div>Scheduled: {booking.scheduledDate} ({booking.scheduledSlot})</div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Q1 */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-800 block">
                  1. Did the technician arrive on time and present themselves in person?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setArrivedOnTime(true)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold ${
                      arrivedOnTime === true ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setArrivedOnTime(false)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold ${
                      arrivedOnTime === false ? 'border-rose-700 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q2 */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-800 block">
                  2. What is the completion status of the requested work?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkCompleted('FULL')}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold ${
                      workCompleted === 'FULL' ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Fully Done
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkCompleted('PARTIAL')}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold ${
                      workCompleted === 'PARTIAL' ? 'border-amber-700 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkCompleted('NONE')}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold ${
                      workCompleted === 'NONE' ? 'border-rose-700 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    No Work
                  </button>
                </div>
              </div>

              {/* Q3 */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-800 block">
                  3. Were you shown the before and after condition?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBeforeAfterShown(true)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold ${
                      beforeAfterShown === true ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setBeforeAfterShown(false)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold ${
                      beforeAfterShown === false ? 'border-rose-700 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q4 */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-800 block">
                  4. Did the technician ask for any unapproved cash or side payment?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUnapprovedCashAsked(false)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold ${
                      unapprovedCashAsked === false ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    No (Correct)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnapprovedCashAsked(true)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold ${
                      unapprovedCashAsked === true ? 'border-rose-700 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Yes (Unapproved fee)
                  </button>
                </div>
              </div>

              {/* Q5 */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-800 block">
                  5. Rate Technician Workmanship (1 to 5 Stars):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSatisfactionRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= satisfactionRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {satisfactionRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Optional Comments:
                </label>
                <textarea
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="Share feedback for quality assurance..."
                  className="w-full h-16 p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
              >
                Submit Quality Verification
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
