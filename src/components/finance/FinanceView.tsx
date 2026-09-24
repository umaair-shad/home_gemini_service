import React, { useState } from 'react';
import { EscrowRecord, PayoutRecord, LedgerEntry, formatPKR } from '../../types';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Download,
  Filter,
  Plus,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { t, locale } = useI18n();

  const [escrows, setEscrows] = useState<EscrowRecord[]>(() => adapter.getEscrowRecords());
  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => adapter.getPayouts());
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => adapter.getLedgerEntries());
  const [activeTab, setActiveTab] = useState<'escrow' | 'payouts' | 'ledger' | 'reconciliation'>('escrow');

  // Adjustment modal
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjDebit, setAdjDebit] = useState('Escrow Discrepancy Clearing');
  const [adjCredit, setAdjCredit] = useState('Provider Retained Earnings');
  const [adjAmount, setAdjAmount] = useState('500');
  const [adjMemo, setAdjMemo] = useState('Correction for disputed parts cost on SHM-LHR-8935');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const reloadData = () => {
    setEscrows(adapter.getEscrowRecords());
    setPayouts(adapter.getPayouts());
    setLedger(adapter.getLedgerEntries());
  };

  const handleProcessPayout = (payoutId: string) => {
    adapter.processPayout(payoutId);
    setActionNotice('Payout batch processed to bank clearing gateway.');
    reloadData();
  };

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaisa = Math.round(parseFloat(adjAmount || '0') * 100);

    adapter.addLedgerEntry({
      id: `led-${Date.now()}`,
      timestamp: new Date().toISOString(),
      debitAccount: adjDebit,
      creditAccount: adjCredit,
      amountPaisa,
      memo: adjMemo,
      transactionType: 'MANUAL_ADJUSTMENT',
    });

    setShowAdjustmentModal(false);
    setActionNotice(`Manual ledger adjustment of PKR ${adjAmount} recorded in audit ledger.`);
    reloadData();
  };

  // Quick calculations
  const totalHeldInEscrow = escrows
    .filter(e => e.status === 'HELD' || e.status === 'DISPUTED')
    .reduce((sum, e) => sum + e.amountPaisa, 0);

  const totalDisputedEscrow = escrows
    .filter(e => e.status === 'DISPUTED')
    .reduce((sum, e) => sum + e.amountPaisa, 0);

  const totalPendingPayouts = payouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.netAmountPaisa || p.amountPaisa), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Finance Header */}
      <div className="bg-[#050B14] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-dark opacity-35 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
              ESCROW TREASURY & SETTLEMENT ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mt-1">
            Bilal Ahmed · Chief Financial Controller
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Cryptographic Escrow Vault · Double-Entry General Ledger · Automated IBAN/Raast Batch Clearing
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setShowAdjustmentModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all min-h-[42px] flex items-center gap-2 tracking-wider font-display uppercase cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Adjustment</span>
          </button>
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Total Active Escrow Trust</span>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{formatPKR(totalHeldInEscrow)}</div>
          <span className="text-[11px] text-teal-800 font-medium">Locked in platform escrow</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Disputed Escrow Holds</span>
          <div className="text-2xl font-black text-rose-700 tabular-nums">{formatPKR(totalDisputedEscrow)}</div>
          <span className="text-[11px] text-rose-800 font-medium">Frozen pending committee review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Pending Provider Payouts</span>
          <div className="text-2xl font-black text-indigo-900 tabular-nums">{formatPKR(totalPendingPayouts)}</div>
          <span className="text-[11px] text-indigo-700 font-medium">Scheduled for batch release</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('escrow')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] ${
            activeTab === 'escrow'
              ? 'border-indigo-600 text-indigo-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Escrow Records ({escrows.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] ${
            activeTab === 'payouts'
              ? 'border-indigo-600 text-indigo-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Provider Payout Batches ({payouts.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] ${
            activeTab === 'ledger'
              ? 'border-indigo-600 text-indigo-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Audit Ledger ({ledger.length})
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] ${
            activeTab === 'reconciliation'
              ? 'border-indigo-600 text-indigo-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Cash Reconciliation
        </button>
      </div>

      {/* TAB 1: ESCROW RECORDS */}
      {activeTab === 'escrow' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Protected Escrow Funds</span>
            <span className="text-slate-500">Funds released strictly upon verified telephone audit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Amount (PKR)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Held At</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {escrows.map(esc => (
                  <tr key={esc.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{esc.bookingRef}</td>
                    <td className="p-3.5 text-slate-700">{esc.customerName}</td>
                    <td className="p-3.5 text-slate-700">{esc.providerName}</td>
                    <td className="p-3.5 font-extrabold text-slate-900 tabular-nums">
                      {formatPKR(esc.amountPaisa)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          esc.status === 'RELEASED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : esc.status === 'DISPUTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {esc.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(esc.heldAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      {esc.status === 'HELD' && (
                        <button
                          onClick={() => {
                            adapter.releaseEscrowForBooking(esc.bookingRef);
                            reloadData();
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded min-h-[32px]"
                        >
                          Manual Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYOUT BATCHES */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Provider Bank Transfer Batches</span>
            <span className="text-slate-500">Meezan, HBL, Raast Clearing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Batch ID</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Bank & Account</th>
                  <th className="p-3.5">Gross Amount</th>
                  <th className="p-3.5">Commission</th>
                  <th className="p-3.5">Net Payout</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payouts.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono text-slate-600">{pay.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{pay.providerName}</td>
                    <td className="p-3.5 text-slate-600">
                      {pay.bankName || pay.method} ({pay.accountNumberMasked || pay.destinationMasked})
                    </td>
                    <td className="p-3.5 font-medium tabular-nums">{formatPKR(pay.grossAmountPaisa || pay.amountPaisa)}</td>
                    <td className="p-3.5 text-rose-700 font-medium tabular-nums">
                      -{formatPKR(pay.commissionDeductedPaisa || 0)}
                    </td>
                    <td className="p-3.5 font-extrabold text-emerald-900 tabular-nums">
                      {formatPKR(pay.netAmountPaisa || pay.amountPaisa)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          pay.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {pay.status === 'PENDING' ? (
                        <button
                          onClick={() => handleProcessPayout(pay.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded min-h-[36px]"
                        >
                          Process Payout
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">Transferred</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Double-Entry Financial Journal</span>
            <button
              onClick={() => {
                const data = JSON.stringify(ledger, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ledger-audit-${Date.now()}.json`;
                a.click();
              }}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-[11px] flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Data</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Debit Account</th>
                  <th className="p-3.5">Credit Account</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Ref</th>
                  <th className="p-3.5">Memo / Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ledger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{entry.debitAccount}</td>
                    <td className="p-3.5 font-medium text-slate-800">{entry.creditAccount}</td>
                    <td className="p-3.5 font-extrabold text-slate-900 tabular-nums">
                      {formatPKR(entry.amountPaisa)}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{entry.bookingRef || 'N/A'}</td>
                    <td className="p-3.5 text-slate-600 text-[11px]">{entry.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CASH RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Cash Collection Reconciliation Engine</h3>
            <p className="text-xs text-slate-600">
              Matches cash collected on-site by field technicians against the platform commission debited from provider wallets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-900 block text-sm">Provider Wallet Balances</span>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                  <span>Muhammad Usman (HVAC)</span>
                  <span className="font-bold text-emerald-700 tabular-nums">Credit Balance: PKR 3,250</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                  <span>Zahid Ali (Plumbing)</span>
                  <span className="font-bold text-emerald-700 tabular-nums">Credit Balance: PKR 1,800</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3 text-xs">
              <span className="font-bold text-teal-950 block text-sm">Automated Cash Safeguards</span>
              <ul className="space-y-2 text-teal-900">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>Cash collection is disallowed until QA telephone verification passes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>Platform commission is automatically journaled as a wallet debit.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Manual Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Post Manual Ledger Adjustment</h3>
            <p className="text-xs text-slate-600">
              Creates an immutable double-entry ledger adjustment for dispute resolutions or parts corrections.
            </p>

            <form onSubmit={handleManualAdjustment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Debit Account:</label>
                <input
                  type="text"
                  value={adjDebit}
                  onChange={e => setAdjDebit(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Credit Account:</label>
                <input
                  type="text"
                  value={adjCredit}
                  onChange={e => setAdjCredit(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (PKR):</label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={e => setAdjAmount(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Memo & Justification:</label>
                <textarea
                  value={adjMemo}
                  onChange={e => setAdjMemo(e.target.value)}
                  className="w-full h-20 p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                >
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
