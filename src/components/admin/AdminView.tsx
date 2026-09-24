import React, { useState } from 'react';
import { Booking, Provider, ServiceCategory, AuditLogItem, formatPKR } from '../../types';
import { BOOKING_STATUS_CONFIG } from '../../data/bookingStatusMap';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Users,
  Settings,
  FileText,
  Search,
  Lock,
  ArrowRight,
  ShieldCheck,
  Slash,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { t, locale } = useI18n();

  const [bookings, setBookings] = useState<Booking[]>(() => adapter.getBookings());
  const [providers, setProviders] = useState<Provider[]>(() => adapter.getProviders());
  const [categories, setCategories] = useState<ServiceCategory[]>(() => adapter.getCategories());
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => adapter.getAuditLogs());

  const [activeTab, setActiveTab] = useState<'oversight' | 'disputes' | 'providers' | 'pricing' | 'audit' | 'roles'>('oversight');
  const [bookingFilter, setBookingFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const reloadData = () => {
    setBookings(adapter.getBookings());
    setProviders(adapter.getProviders());
    setCategories(adapter.getCategories());
    setAuditLogs(adapter.getAuditLogs());
  };

  const handleResolveDispute = (bookingId: string, resolution: 'REFUND' | 'RELEASE_PROVIDER' | 'REWORK') => {
    if (resolution === 'REFUND') {
      adapter.updateBookingStatus(bookingId, 'CANCELLED', 'Dispute Committee: Full refund granted to customer.');
      setActionNotice('Dispute resolved: Full refund approved.');
    } else if (resolution === 'RELEASE_PROVIDER') {
      adapter.updateBookingStatus(bookingId, 'VERIFIED_SATISFIED', 'Dispute Committee: Overruled complaint, released funds to provider.');
      setActionNotice('Dispute resolved: Funds released to technician.');
    } else {
      adapter.updateBookingStatus(bookingId, 'REWORK_REQUIRED', 'Dispute Committee: Ordered complimentary rework dispatch.');
      setActionNotice('Dispute resolved: Free rework dispatch scheduled.');
    }
    reloadData();
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'ALL') return true;
    if (bookingFilter === 'DISPUTED') return b.status === 'DISPUTED' || b.complaint;
    if (bookingFilter === 'AWAITING') return b.status === 'AWAITING_VERIFICATION';
    if (bookingFilter === 'ACTIVE') return ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'QUOTE_REVISED'].includes(b.status);
    if (bookingFilter === 'COMPLETED') return ['VERIFIED_SATISFIED', 'FUNDS_RELEASED', 'CASH_COLLECTED'].includes(b.status);
    return true;
  });

  const disputedBookings = bookings.filter(b => b.status === 'DISPUTED' || b.complaint);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#050B14] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-dark opacity-35 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
              ROOT OPERATIONS COMMAND // LAHORE PROTOCOL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mt-1">
            System Administrator Control Room
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Lahore Citywide Operations · State Transition Oversight · Dispute Committee Governance & SLA Telemetry
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-mono">
          <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-800/80 text-center min-w-[90px]">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Active Jobs</span>
            <span className="text-lg font-bold text-white font-mono-nums">
              {bookings.filter(b => ['IN_PROGRESS', 'AWAITING_VERIFICATION'].includes(b.status)).length}
            </span>
          </div>
          <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-800/80 text-center min-w-[90px]">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Disputes</span>
            <span className="text-lg font-bold text-cyan-400 font-mono-nums">
              {disputedBookings.length}
            </span>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('oversight')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'oversight'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Booking Oversight ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'disputes'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Dispute Committee ({disputedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'providers'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Provider Vetting & Credentials ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'pricing'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Category & Fee Management ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          System Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'roles'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          RBAC Permissions Matrix
        </button>
      </div>

      {/* TAB 1: BOOKING OVERSIGHT */}
      {activeTab === 'oversight' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-bold text-slate-900">Real-Time Booking State Monitor</span>
            <div className="flex items-center gap-1.5">
              {['ALL', 'ACTIVE', 'AWAITING', 'DISPUTED', 'COMPLETED'].map(f => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    bookingFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Ref</th>
                  <th className="p-3.5">Customer & Area</th>
                  <th className="p-3.5">Technician</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">OTP</th>
                  <th className="p-3.5">Customer Limit</th>
                  <th className="p-3.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBookings.map(b => {
                  const meta = BOOKING_STATUS_CONFIG[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{b.bookingRef}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{b.customerName}</div>
                        <div className="text-slate-500">{b.customerAddress.neighborhood}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{b.providerName}</div>
                        <div className="text-slate-500">{b.providerPhoneMasked}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${meta.badgeClass}`}>
                          {meta.labelEn}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{b.startOtp}</td>
                      <td className="p-3.5 font-bold text-teal-950 tabular-nums">
                        {formatPKR(b.pricing.customerTotalPaisa)}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700">{b.paymentMethod}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DISPUTE COMMITTEE */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Dispute Resolution Committee</h3>
            <p className="text-xs text-slate-600">
              Escrow funds remain frozen until an administrative decision is recorded with a tamper-evident audit memo.
            </p>
          </div>

          <div className="space-y-4">
            {disputedBookings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                Zero active disputes or customer complaints.
              </div>
            ) : (
              disputedBookings.map(b => (
                <div key={b.id} className="p-6 bg-white rounded-2xl border border-rose-200 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-rose-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{b.bookingRef}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                          Disputed Escrow Hold
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mt-1">
                        Customer: {b.customerName} vs Provider: {b.providerName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Frozen Escrow Amount</span>
                      <span className="text-lg font-black text-rose-900 tabular-nums">
                        {formatPKR(b.pricing.customerTotalPaisa)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50/60 rounded-xl text-xs space-y-2 text-rose-950">
                    <strong>Complaint Summary / QA Finding:</strong>
                    <p>{b.complaint?.details || b.verification?.agentNotes || 'Customer flagged unsatisfactory execution.'}</p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                    <button
                      onClick={() => handleResolveDispute(b.id, 'REFUND')}
                      className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg min-h-[44px]"
                    >
                      Authorize Full Customer Refund
                    </button>
                    <button
                      onClick={() => handleResolveDispute(b.id, 'REWORK')}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg min-h-[44px]"
                    >
                      Dispatch Free Rework Technician
                    </button>
                    <button
                      onClick={() => handleResolveDispute(b.id, 'RELEASE_PROVIDER')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg min-h-[44px]"
                    >
                      Dismiss Complaint & Release to Provider
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROVIDER CREDENTIALS */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Vetted Technician Verification Audit</span>
            <span className="text-slate-500">NADRA Smart CNIC · Punjab Police Clearance · TEVTA</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Technician</th>
                  <th className="p-3.5">Trade & Business</th>
                  <th className="p-3.5">NADRA CNIC</th>
                  <th className="p-3.5">Police Clear</th>
                  <th className="p-3.5">QA Audit Score</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {providers.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3.5 text-slate-700">{p.businessName}</td>
                    <td className="p-3.5">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Clean Record
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800 tabular-nums">
                      {p.verificationPassRate}% Phone Pass
                    </td>
                    <td className="p-3.5 font-bold text-amber-600 tabular-nums">
                      {p.rating.toFixed(2)}★ ({p.totalReviews})
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Active & Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY & PRICING */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Six Active Launch Categories</span>
            <span className="text-slate-500">Base Inspection Fees in PKR</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Base Visit & Diagnosis Fee</th>
                  <th className="p-3.5">Estimated Job Range</th>
                  <th className="p-3.5">Active Services</th>
                  <th className="p-3.5">Platform QA Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{c.nameEn}</td>
                    <td className="p-3.5 font-extrabold text-teal-900 tabular-nums">
                      {formatPKR(c.baseInspectionFeePaisa)}
                    </td>
                    <td className="p-3.5 text-slate-700 tabular-nums">
                      {formatPKR(c.estimatedRangePaisa.min)} – {formatPKR(c.estimatedRangePaisa.max)}
                    </td>
                    <td className="p-3.5 text-slate-600 font-semibold">{c.activeServicesCount} Services</td>
                    <td className="p-3.5 text-slate-600 tabular-nums">PKR 250</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Tamper-Evident System Audit Trail</span>
            <span className="text-slate-500">Every state transition and financial trigger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor & Role</th>
                  <th className="p-3.5">Action Code</th>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Audit Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900">{log.actorName}</span>
                      <span className="text-slate-400 block uppercase text-[10px]">{log.actorRole}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-purple-900">{log.action}</td>
                    <td className="p-3.5 font-mono text-slate-600">{log.bookingRef || 'N/A'}</td>
                    <td className="p-3.5 text-slate-700 leading-relaxed text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">SRS §15 Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-600">
              Governs permissions across the Smart Home Maintenance Services platform.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Scope of Authority</th>
                  <th className="p-3.5">Phone Privacy Access</th>
                  <th className="p-3.5">Financial Powers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Public Visitor</td>
                  <td className="p-3.5 font-mono">/</td>
                  <td className="p-3.5 text-slate-700">Browse categories, providers, inspection fees</td>
                  <td className="p-3.5 text-slate-500">Fully Masked</td>
                  <td className="p-3.5 text-slate-500">None</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Customer</td>
                  <td className="p-3.5 font-mono">/c</td>
                  <td className="p-3.5 text-slate-700">Book, approve revisions, view OTP, verify work</td>
                  <td className="p-3.5 text-slate-700">Assigned Provider Phone</td>
                  <td className="p-3.5 text-slate-700">Escrow deposit, revision approval</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Service Provider</td>
                  <td className="p-3.5 font-mono">/p</td>
                  <td className="p-3.5 text-slate-700">Accept jobs, verify Start OTP, submit revision</td>
                  <td className="p-3.5 text-slate-700">Assigned Customer Phone</td>
                  <td className="p-3.5 text-slate-700">Cash collection post-verification</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Verification QA Agent</td>
                  <td className="p-3.5 font-mono">/agent</td>
                  <td className="p-3.5 text-slate-700">Claim calls, questionnaire, record attempts</td>
                  <td className="p-3.5 text-emerald-800 font-bold">Unmasked Audit Access</td>
                  <td className="p-3.5 text-slate-700">Authorize release / Engage dispute hold</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Finance Officer</td>
                  <td className="p-3.5 font-mono">/finance</td>
                  <td className="p-3.5 text-slate-700">Escrow ledger, payout batches, manual journals</td>
                  <td className="p-3.5 text-slate-700">Audit access</td>
                  <td className="p-3.5 text-indigo-900 font-bold">Escrow release, bank transfers</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Administrator</td>
                  <td className="p-3.5 font-mono">/admin</td>
                  <td className="p-3.5 text-slate-700">Full operations oversight, disputes, catalog</td>
                  <td className="p-3.5 text-purple-900 font-bold">Full Access</td>
                  <td className="p-3.5 text-purple-900 font-bold">Dispute arbitration overrides</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
