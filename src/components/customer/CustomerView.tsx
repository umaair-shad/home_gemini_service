import React, { useState } from 'react';
import { Booking, formatPKR, CustomerAddress } from '../../types';
import { BOOKING_STATUS_CONFIG } from '../../data/bookingStatusMap';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import { CustomerBookingDetail } from './CustomerBookingDetail';
import { CustomerOneTapVerifyModal } from './CustomerOneTapVerifyModal';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  ArrowRight,
  AlertCircle,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface CustomerViewProps {
  onOpenBookingModal: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ onOpenBookingModal }) => {
  const { t, locale } = useI18n();

  const [bookings, setBookings] = useState<Booking[]>(() => adapter.getBookings());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [oneTapBooking, setOneTapBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'addresses' | 'plans'>('bookings');

  // Address creation modal/form state
  const [addresses, setAddresses] = useState<CustomerAddress[]>(() => adapter.getCustomerAddresses());
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('DHA Phase 5, Lahore');

  const reloadData = () => {
    const updated = adapter.getBookings();
    setBookings(updated);
    if (selectedBooking) {
      const refreshed = updated.find(b => b.id === selectedBooking.id);
      if (refreshed) setSelectedBooking(refreshed);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStreet.trim()) return;

    const newAddr: CustomerAddress = {
      id: `addr-${Date.now()}`,
      title: newTitle,
      titleUr: newTitle,
      street: newStreet,
      neighborhood: newNeighborhood,
      isDefault: false,
    };
    adapter.addCustomerAddress(newAddr);
    setAddresses(adapter.getCustomerAddresses());
    setNewTitle('');
    setNewStreet('');
    setShowAddAddress(false);
  };

  const maintenancePlans = adapter.getMaintenancePlans();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Customer Header Banner */}
      <div className="bg-[#050B14] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-dark opacity-35 pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
              {locale === 'ur' ? 'صارف اکاؤنٹ' : 'RESIDENT HUB // LAHORE PROTOCOL'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            {locale === 'ur' ? 'خوش آمدید، طارق محمود' : 'Welcome back, Tariq Mahmood'}
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            DHA Phase 3, Lahore · Verified Property Owner · 100% Escrow Protection Active
          </p>
        </div>

        <button
          onClick={onOpenBookingModal}
          className="relative z-10 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all min-h-[42px] cursor-pointer flex items-center gap-2 tracking-wide font-display uppercase"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'ur' ? 'نئی سروس بک کریں' : 'Schedule Inspection'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-blue-100">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-black'
          }`}
        >
          Active & Past Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-black'
          }`}
        >
          Saved Residences ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'plans'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-black'
          }`}
        >
          Care Retainers
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Service Orders</h2>
            <span className="text-xs text-slate-500">Real-time status synced with SRS state machine</span>
          </div>

          <div className="space-y-4">
            {bookings.map(booking => {
              const statusMeta = BOOKING_STATUS_CONFIG[booking.status];
              const isAwaitingVerification = booking.status === 'AWAITING_VERIFICATION';

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{booking.bookingRef}</span>
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${statusMeta.badgeClass}`}>
                          {locale === 'ur' ? statusMeta.labelUr : statusMeta.labelEn}
                        </span>
                        {booking.quoteRevision && booking.quoteRevision.status === 'PENDING' && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-100 text-purple-900 border border-purple-200 animate-pulse">
                            Revision Pending Signoff
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-1">
                        {booking.customerAddress.neighborhood}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Total Approved Fee</span>
                      <span className="text-base font-extrabold text-teal-950 tabular-nums">
                        {formatPKR(booking.pricing.customerTotalPaisa)}
                      </span>
                    </div>
                  </div>

                  {/* Middle Info & Start OTP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 block">Assigned Technician:</span>
                      <div className="font-semibold text-slate-900">{booking.providerName}</div>
                      <div className="text-slate-500">{booking.providerPhoneMasked}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block">Scheduled Time Slot:</span>
                      <div className="font-semibold text-slate-900">{booking.scheduledDate}</div>
                      <div className="text-slate-500">{booking.scheduledSlot}</div>
                    </div>

                    {/* Start OTP Callout */}
                    <div className="p-3 bg-teal-50/80 rounded-lg border border-teal-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Start OTP:</span>
                        </span>
                        <span className="font-mono font-black text-sm text-teal-950 tabular-nums">
                          {booking.startOtp}
                        </span>
                      </div>
                      <p className="text-[10px] text-teal-800 leading-tight">
                        Give to technician upon arrival at your doorstep.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Payment: <strong className="text-slate-800">{booking.paymentMethod}</strong> ({booking.paymentStatus})
                    </div>

                    <div className="flex items-center gap-2">
                      {isAwaitingVerification && (
                        <button
                          onClick={() => setOneTapBooking(booking)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 min-h-[36px]"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>One-Tap Verify Quality</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors min-h-[36px] flex items-center gap-1"
                      >
                        <span>View Details & Chat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Saved Addresses in Lahore</h2>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Add Lahore Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Label (e.g. Home, Office, Rental Villa)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
                <select
                  value={newNeighborhood}
                  onChange={e => setNewNeighborhood(e.target.value)}
                  className="p-2.5 text-xs border border-slate-300 rounded-lg"
                >
                  <option value="DHA Phase 5, Lahore">DHA Phase 5, Lahore</option>
                  <option value="Gulberg III, Lahore">Gulberg III, Lahore</option>
                  <option value="Model Town Block C, Lahore">Model Town Block C, Lahore</option>
                  <option value="Johar Town Phase 2, Lahore">Johar Town Phase 2, Lahore</option>
                  <option value="Bahria Town Sector C, Lahore">Bahria Town Sector C, Lahore</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Street & House Details (e.g. House 48-B, Street 9)"
                value={newStreet}
                onChange={e => setNewStreet(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-800 text-white text-xs font-bold rounded-lg"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">{addr.title}</div>
                  {addr.isDefault && (
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600">{addr.street}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{addr.neighborhood}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CARE PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Home Care Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {maintenancePlans.map(plan => (
              <div key={plan.id} className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">{plan.nameEn}</h3>
                  <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md">
                    {formatPKR(plan.priceMonthlyPaisa)}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Scheduled preventive visits for air conditioning, distribution box electrical wiring, and drainage inspection.
                </p>
                <button
                  onClick={onOpenBookingModal}
                  className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                >
                  Activate Subscription
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Booking Detail Modal */}
      {selectedBooking && (
        <CustomerBookingDetail
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRefresh={reloadData}
          onOpenOneTapVerify={b => setOneTapBooking(b)}
        />
      )}

      {/* One-Tap Self-Verify Modal */}
      {oneTapBooking && (
        <CustomerOneTapVerifyModal
          booking={oneTapBooking}
          onClose={() => setOneTapBooking(null)}
          onVerified={reloadData}
        />
      )}
    </div>
  );
};
