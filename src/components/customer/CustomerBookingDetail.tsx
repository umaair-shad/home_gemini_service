import React, { useState } from 'react';
import { Booking, formatPKR } from '../../types';
import { BOOKING_STATUS_CONFIG } from '../../data/bookingStatusMap';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import { ImageFallback } from '../common/ImageFallback';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  ShieldAlert,
  FileText,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Send,
  Lock,
} from 'lucide-react';

interface CustomerBookingDetailProps {
  booking: Booking | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenOneTapVerify?: (booking: Booking) => void;
}

export const CustomerBookingDetail: React.FC<CustomerBookingDetailProps> = ({
  booking,
  onClose,
  onRefresh,
  onOpenOneTapVerify,
}) => {
  const { t, locale } = useI18n();

  const [activeTab, setActiveTab] = useState<'timeline' | 'messages' | 'invoice' | 'complaint'>('timeline');
  const [chatMessages, setChatMessages] = useState<{ sender: 'customer' | 'provider'; text: string; time: string }[]>([
    { sender: 'provider', text: 'Assalam o Alaikum! I am Muhammad Usman, your technician. I will arrive with my toolkit at the scheduled slot.', time: '10:05 AM' },
    { sender: 'customer', text: 'Walaikum Assalam, please ring the gate bell at House 142.', time: '10:10 AM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('Incomplete Work');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [warrantyClaimed, setWarrantyClaimed] = useState(false);

  if (!booking) return null;

  const statusMeta = BOOKING_STATUS_CONFIG[booking.status];

  // Lifecycle steps for the timeline
  const lifecycleSteps = [
    { key: 'REQUESTED', label: 'Requested', done: true },
    { key: 'ACCEPTED', label: 'Technician Assigned', done: ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'QUOTE_REVISED', 'COMPLETED', 'AWAITING_VERIFICATION', 'VERIFIED_SATISFIED', 'FUNDS_RELEASED', 'CASH_COLLECTED'].includes(booking.status) },
    { key: 'IN_PROGRESS', label: 'OTP Start & In Progress', done: ['IN_PROGRESS', 'QUOTE_REVISED', 'COMPLETED', 'AWAITING_VERIFICATION', 'VERIFIED_SATISFIED', 'FUNDS_RELEASED', 'CASH_COLLECTED'].includes(booking.status) },
    { key: 'AWAITING_VERIFICATION', label: 'QA Phone Audit', done: ['AWAITING_VERIFICATION', 'VERIFIED_SATISFIED', 'FUNDS_RELEASED', 'CASH_COLLECTED'].includes(booking.status) },
    { key: 'VERIFIED_SATISFIED', label: 'Completed & Released', done: ['VERIFIED_SATISFIED', 'FUNDS_RELEASED', 'CASH_COLLECTED'].includes(booking.status) },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { sender: 'customer', text: inputMessage, time: 'Just now' },
    ]);
    setInputMessage('');
  };

  const handleRevisionApproval = (approve: boolean) => {
    adapter.respondToQuoteRevision(booking.id, approve);
    onRefresh();
  };

  const handleClaimWarranty = () => {
    adapter.claimWarranty(booking.id);
    setWarrantyClaimed(true);
    onRefresh();
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDetails.trim()) return;
    adapter.addComplaint(booking.id, complaintCategory, complaintDetails);
    setComplaintSubmitted(true);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col justify-between">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">{booking.bookingRef}</span>
              <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${statusMeta.badgeClass}`}>
                {locale === 'ur' ? statusMeta.labelUr : statusMeta.labelEn}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {booking.customerAddress.neighborhood} · {booking.scheduledDate}
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'timeline'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Lifecycle & OTP
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'messages'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Technician Chat ({chatMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'invoice'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Itemized Invoice
          </button>
          <button
            onClick={() => setActiveTab('complaint')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'complaint'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Warranty & Complaints
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* TAB 1: TIMELINE & OTP */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Start OTP Card (Prominent) */}
              <div className="p-5 bg-teal-50/90 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-teal-950 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-teal-800" />
                    <span>{t.customer.startOtpLabel}</span>
                  </div>
                  <p className="text-xs text-teal-900 max-w-sm">
                    {t.customer.startOtpNotice}
                  </p>
                </div>

                <div className="px-6 py-2.5 bg-white rounded-xl border border-teal-300 shadow-xs text-center">
                  <span className="text-3xl font-black text-teal-950 font-mono tracking-widest tabular-nums block">
                    {booking.startOtp}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    4-Digit Secret Code
                  </span>
                </div>
              </div>

              {/* Quote Revision Alert if pending */}
              {booking.quoteRevision && booking.quoteRevision.status === 'PENDING' && (
                <div className="p-5 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-purple-700" />
                    <span>Technician Requested Quote Revision</span>
                  </div>

                  <p className="text-xs text-purple-950 leading-relaxed">
                    {booking.quoteRevision.reasonEn}
                  </p>

                  <div className="p-3 bg-white rounded-lg border border-purple-100 flex items-center justify-between text-xs font-semibold text-purple-950">
                    <span>Additional Parts & Labor:</span>
                    <span className="tabular-nums font-black text-sm">
                      +{formatPKR(booking.quoteRevision.totalAdditionalPaisa)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleRevisionApproval(true)}
                      className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Approve Revised Quote</span>
                    </button>
                    <button
                      onClick={() => handleRevisionApproval(false)}
                      className="flex-1 py-2 px-3 bg-white border border-purple-300 text-purple-900 hover:bg-purple-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Decline (Stick to Base Scope)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Explanation Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Current Status Insight:</span>
                <p className="text-slate-600">
                  {locale === 'ur' ? statusMeta.descriptionUr : statusMeta.descriptionEn}
                </p>
                {booking.status === 'AWAITING_VERIFICATION' && onOpenOneTapVerify && (
                  <div className="pt-2">
                    <button
                      onClick={() => onOpenOneTapVerify(booking)}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-md transition-colors"
                    >
                      Simulate Customer One-Tap Self-Verification Portal
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Milestones */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SRS Lifecycle Transitions (T1–T26)
                </h4>
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                  {lifecycleSteps.map((s, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          s.done ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300'
                        }`}
                      >
                        {s.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="text-xs font-semibold text-slate-900">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Before / After Evidence Photos */}
              {(booking.beforePhotos.length > 0 || booking.afterPhotos.length > 0) && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Work Evidence (Photos Uploaded by Technician)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Before Work:</span>
                      {booking.beforePhotos.length > 0 ? (
                        <ImageFallback
                          src={booking.beforePhotos[0]}
                          alt="Before condition"
                          type="evidence"
                          className="w-full h-36 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="h-36 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                          Awaiting before photo
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">After Work:</span>
                      {booking.afterPhotos.length > 0 ? (
                        <ImageFallback
                          src={booking.afterPhotos[0]}
                          alt="After condition"
                          type="evidence"
                          className="w-full h-36 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="h-36 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                          Awaiting completion photo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TECHNICIAN DIRECT MESSAGING */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>In-app messaging protects both parties. Never agree to off-platform cash deals.</span>
              </div>

              <div className="h-64 overflow-y-auto space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'customer'
                          ? 'bg-teal-800 text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Type message to technician..."
                  className="flex-1 p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ITEMIZED INVOICE */}
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">Official Service Invoice</h4>
                    <span className="text-xs text-slate-500 font-mono">Invoice Ref: INV-{booking.bookingRef}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Payment Method</span>
                    <span className="text-xs font-bold text-teal-950 uppercase">{booking.paymentMethod}</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Inspection & Diagnosis Fee</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatPKR(booking.pricing.inspectionFeePaisa)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Approved Labor Scope</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatPKR(booking.pricing.approvedLaborPaisa)}
                    </span>
                  </div>
                  {booking.pricing.approvedPartsPaisa > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Customer-Approved Spare Parts</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatPKR(booking.pricing.approvedPartsPaisa)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Quality Assurance & Guarantee Fee</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatPKR(booking.pricing.platformFeePaisa)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-base text-teal-950">
                    <span>Total Paid / Payable</span>
                    <span className="tabular-nums">{formatPKR(booking.pricing.customerTotalPaisa)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                  Escrow Authority: Smart Home Maintenance Trust A/C · NTN 8419201-4 · Lahore, Pakistan
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLAINT & WARRANTY */}
          {activeTab === 'complaint' && (
            <div className="space-y-6">
              {/* 30-Day Workmanship Warranty Card */}
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>30-Day Workmanship Warranty Active</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  If the repaired fault reappears within 30 days of completion, our warranty covers a 100% complimentary technician re-visit with zero labor fee.
                </p>

                {warrantyClaimed ? (
                  <div className="p-3 bg-white rounded-lg border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Warranty Claim Initiated! A free rework dispatch has been created under Ref #{booking.bookingRef}-W.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleClaimWarranty}
                    className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                  >
                    Claim Complimentary Warranty Rework
                  </button>
                )}
              </div>

              {/* File a Complaint */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Report an Issue to Admin Dispute Committee
                </h4>

                {complaintSubmitted ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Your complaint has been logged for supervisor investigation. Escrow is frozen pending review.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComplaint} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Category:</label>
                      <select
                        value={complaintCategory}
                        onChange={e => setComplaintCategory(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                      >
                        <option value="Incomplete Work">Incomplete Work</option>
                        <option value="Unapproved Cash Demanded">Unapproved Cash or Extra Fee Demanded</option>
                        <option value="Property Damage">Property Damage or Mess Left</option>
                        <option value="Late / No Show">Technician Late or No Show</option>
                        <option value="Rude Behavior">Unprofessional Conduct</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Description:</label>
                      <textarea
                        value={complaintDetails}
                        onChange={e => setComplaintDetails(e.target.value)}
                        placeholder="Please describe exactly what happened..."
                        className="w-full h-24 p-3 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                    >
                      Submit Complaint for Audit
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 min-h-[44px]"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
