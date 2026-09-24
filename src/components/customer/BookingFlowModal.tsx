import React, { useState } from 'react';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import {
  ServiceCategory,
  ServiceItem,
  Provider,
  Booking,
  PaymentMethod,
  formatPKR,
} from '../../types';
import {
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Upload,
  AlertCircle,
} from 'lucide-react';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: Booking) => void;
  preselectedCategoryId?: string;
  preselectedProviderId?: string;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  onBookingCreated,
  preselectedCategoryId,
  preselectedProviderId,
}) => {
  const { t, locale } = useI18n();

  // Wizard Steps:
  // 1: Service
  // 2: Address
  // 3: Provider (or Auto-Match)
  // 4: Slot
  // 5: Details / Photos
  // 6: Price & Cancellation Review
  // 7: Payment Choice (Cash vs Online Escrow)
  // 8: Success
  const [step, setStep] = useState<number>(1);

  const categories = adapter.getCategories();
  const allServices = adapter.getServices();
  const addresses = adapter.getCustomerAddresses();
  const allProviders = adapter.getProviders();

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(() => {
    return categories.find(c => c.id === preselectedCategoryId) || categories[0];
  });
  const [selectedService, setSelectedService] = useState<ServiceItem>(() => {
    const s = allServices.find(s => s.categoryId === selectedCategory.id);
    return s || allServices[0];
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || 'addr-1');
  const [selectedProviderId, setSelectedProviderId] = useState<string>(preselectedProviderId || 'auto');
  const [selectedDate, setSelectedDate] = useState<string>('Today, 24 Sep');
  const [selectedSlot, setSelectedSlot] = useState<string>('02:00 PM - 04:00 PM');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [hasPhotosUploaded, setHasPhotosUploaded] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE_ESCROW');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const currentAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const assignedProvider = selectedProviderId === 'auto'
    ? allProviders.find(p => p.categoryIds.includes(selectedCategory.id))
    : allProviders.find(p => p.id === selectedProviderId);

  // Pricing calculations
  const inspectionFeePaisa = selectedService.baseInspectionFeePaisa;
  const estimatedLaborPaisa = selectedService.estimatedLaborPaisa;
  const platformFeePaisa = 25000; // PKR 250
  const customerTotalPaisa = inspectionFeePaisa + estimatedLaborPaisa + platformFeePaisa;
  const providerEarningsPaisa = estimatedLaborPaisa + inspectionFeePaisa - 10000;

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else if (step === 7) {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalSubmit = () => {
    // Generate 4-digit start OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const refNumber = `SHM-LHR-${Math.floor(1000 + Math.random() * 9000)}`;

    // Critical rule: Online checkout starts at PENDING_PAYMENT; Cash starts at REQUESTED
    const initialStatus = paymentMethod === 'ONLINE_ESCROW' ? 'PENDING_PAYMENT' : 'REQUESTED';

    const newBooking = adapter.createBooking({
      bookingRef: refNumber,
      serviceId: selectedService.id,
      categoryId: selectedCategory.id,
      customerId: 'cust-tariq-1',
      customerName: 'Tariq Mahmood',
      customerPhoneMasked: '0300-***4521',
      customerPhoneFull: '0300-8454521',
      customerAddress: {
        label: currentAddress.title,
        street: currentAddress.street,
        neighborhood: currentAddress.neighborhood,
        city: 'Lahore',
      },
      providerId: assignedProvider ? assignedProvider.id : null,
      providerName: assignedProvider ? assignedProvider.name : 'Auto-Dispatched Technician',
      providerPhoneMasked: assignedProvider ? assignedProvider.phoneMasked : '0300-***0000',
      status: initialStatus,
      startOtp: generatedOtp,
      paymentMethod,
      paymentStatus: paymentMethod === 'ONLINE_ESCROW' ? 'HELD_IN_ESCROW' : 'AUTHORIZED_FOR_CASH',
      pricing: {
        inspectionFeePaisa,
        approvedLaborPaisa: estimatedLaborPaisa,
        approvedPartsPaisa: 0,
        platformFeePaisa,
        discountPaisa: 0,
        customerTotalPaisa,
        providerEarningsPaisa,
        cashToCollectPaisa: paymentMethod === 'CASH' ? customerTotalPaisa : undefined,
      },
      scheduledDate: selectedDate,
      scheduledSlot: selectedSlot,
      problemDescriptionEn: problemDescription || `${selectedService.titleEn} required at Lahore address.`,
      problemDescriptionUr: problemDescription || selectedService.titleUr,
      problemPhotos: hasPhotosUploaded ? ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'] : [],
      beforePhotos: [],
      afterPhotos: [],
      checklist: selectedService.defaultChecklistEn.map((item, idx) => ({
        id: `chk-${idx}`,
        label: item,
        labelUr: selectedService.defaultChecklistUr[idx] || item,
        done: false,
      })),
      warranty: {
        eligible: true,
        validUntilDate: '2026-10-24',
        claimed: false,
      },
    });

    setCreatedBooking(newBooking);
    setStep(8); // Success step
    onBookingCreated(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col justify-between">
        {/* Modal Top Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              {locale === 'ur' ? `مرحلہ ${step} از 7` : `Step ${step > 7 ? '7' : step} of 7`}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {step === 1 && (locale === 'ur' ? 'سروس کا انتخاب' : 'Select Service & Scope')}
              {step === 2 && (locale === 'ur' ? 'پتہ اور مقام' : 'Service Address in Lahore')}
              {step === 3 && (locale === 'ur' ? 'کاریگر کا انتخاب' : 'Technician Selection')}
              {step === 4 && (locale === 'ur' ? 'تاریخ اور وقت' : 'Preferred Date & Time Slot')}
              {step === 5 && (locale === 'ur' ? 'مسئلے کی تفصیل اور تصویر' : 'Issue Details & Photos')}
              {step === 6 && (locale === 'ur' ? 'قیمت کا جائزہ اور پالیسی' : 'Itemized Price & Cancellation Summary')}
              {step === 7 && (locale === 'ur' ? 'ادائیگی کا طریقہ' : 'Payment Method Selection')}
              {step === 8 && (locale === 'ur' ? 'بکنگ مکمل!' : 'Booking Confirmed!')}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* STEP 1: SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-700 block">Category:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      const s = allServices.find(srv => srv.categoryId === cat.id);
                      if (s) setSelectedService(s);
                    }}
                    className={`p-3 text-left rounded-lg border text-xs font-medium transition-all ${
                      selectedCategory.id === cat.id
                        ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>{locale === 'ur' ? cat.nameUr : cat.nameEn}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Inspection: {formatPKR(cat.baseInspectionFeePaisa)}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-2">Service Breakdown:</label>
                <div className="space-y-2">
                  {adapter.getServices(selectedCategory.id).map(srv => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        selectedService.id === srv.id
                          ? 'border-teal-700 bg-teal-50/40 text-slate-900 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {locale === 'ur' ? srv.titleUr : srv.titleEn}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Base Visit & Diagnosis: {formatPKR(srv.baseInspectionFeePaisa)} · {srv.warrantyDays}-Day Warranty
                        </div>
                      </div>
                      <div className="font-bold text-teal-900 tabular-nums">
                        Est: {formatPKR(srv.baseInspectionFeePaisa + srv.estimatedLaborPaisa)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-700 block">Select Saved Address (Lahore):</label>
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                      selectedAddressId === addr.id
                        ? 'border-teal-700 bg-teal-50/40 text-slate-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{addr.title}</div>
                      <div className="text-slate-600 mt-0.5">{addr.street}</div>
                      <div className="text-slate-500 font-medium">{addr.neighborhood}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Your exact street address is securely masked from technicians until they accept the assignment.</span>
              </div>
            </div>
          )}

          {/* STEP 3: PROVIDER */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-700 block">Select Assigned Technician:</label>
              <div
                onClick={() => setSelectedProviderId('auto')}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  selectedProviderId === 'auto'
                    ? 'border-teal-700 bg-teal-50/40 text-slate-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">Auto-Match Best Local Specialist (Recommended)</div>
                  <div className="text-slate-500 mt-0.5">Dispatches to highest rated active technician in {currentAddress.neighborhood}</div>
                </div>
                <span className="text-xs font-bold text-teal-800 px-2.5 py-1 bg-teal-100 rounded-md">Fastest</span>
              </div>

              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">
                Or Choose Specific Technician:
              </div>

              <div className="space-y-2">
                {allProviders
                  .filter(p => p.categoryIds.includes(selectedCategory.id))
                  .map(prov => (
                    <div
                      key={prov.id}
                      onClick={() => setSelectedProviderId(prov.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        selectedProviderId === prov.id
                          ? 'border-teal-700 bg-teal-50/40 text-slate-900 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                          {prov.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{prov.businessName}</div>
                          <div className="text-slate-500">{prov.name} · {prov.rating}★ ({prov.totalReviews} reviews)</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-teal-900 tabular-nums">{formatPKR(prov.hourlyRatePaisa)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* STEP 4: SLOT */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-700 block">Select Date:</label>
              <div className="grid grid-cols-3 gap-2">
                {['Today, 24 Sep', 'Tomorrow, 25 Sep', 'Friday, 26 Sep'].map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`py-3 px-2 text-xs rounded-lg border font-medium transition-all ${
                      selectedDate === date
                        ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" />
                    <span>{date}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-2">Available Time Window:</label>
                <div className="space-y-2">
                  {[
                    '09:00 AM - 11:00 AM (Morning)',
                    '11:00 AM - 01:00 PM (Midday)',
                    '02:00 PM - 04:00 PM (Afternoon)',
                    '04:00 PM - 06:00 PM (Evening)',
                  ].map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        selectedSlot === slot
                          ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold">Available</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PROBLEM DETAILS & PHOTOS */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Describe the Issue or Symptoms:
                </label>
                <textarea
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  placeholder="e.g. Master bedroom split AC tripping after 10 minutes, fan making grinding vibration sound..."
                  className="w-full h-24 p-3 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Upload Problem Photos (Optional):
                </label>
                <div
                  onClick={() => setHasPhotosUploaded(!hasPhotosUploaded)}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    hasPhotosUploaded
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900'
                      : 'border-slate-300 hover:border-slate-400 text-slate-500'
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <span className="text-xs font-semibold block">
                    {hasPhotosUploaded
                      ? '✓ 1 Diagnostic Photo Attached (Simulated)'
                      : 'Click to simulate attaching device photo / fault video'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, MP4 up to 25MB</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PRICE & CANCELLATION SUMMARY */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-200">
                  Transparent Itemized Quotation
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Upfront Inspection & Diagnosis Fee</span>
                  <span className="font-semibold tabular-nums text-slate-900">{formatPKR(inspectionFeePaisa)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Standard Labor Scope</span>
                  <span className="font-semibold tabular-nums text-slate-900">{formatPKR(estimatedLaborPaisa)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform QA & Escrow Fee</span>
                  <span className="font-semibold tabular-nums text-slate-900">{formatPKR(platformFeePaisa)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-teal-950">
                  <span>Estimated Total (Max Customer Limit)</span>
                  <span className="tabular-nums">{formatPKR(customerTotalPaisa)}</span>
                </div>
              </div>

              {/* Policy Banner */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Strict Zero-Surprise Policy:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  The final job amount cannot exceed this approved total unless you digitally approve a revised quote on-site for spare parts.
                </p>
                <p className="text-[11px] leading-relaxed pt-1">
                  <strong>Cancellation Policy:</strong> Free cancellation up to 60 minutes before scheduled slot. If technician has departed, a PKR 300 transit allowance applies.
                </p>
              </div>
            </div>
          )}

          {/* STEP 7: PAYMENT SELECTION */}
          {step === 7 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-700 block">Choose Payment Method:</label>

              {/* Online Escrow */}
              <div
                onClick={() => setPaymentMethod('ONLINE_ESCROW')}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'ONLINE_ESCROW'
                    ? 'border-teal-700 bg-teal-50/50 text-slate-900 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-900">
                    Digital Escrow (JazzCash, Raast, Credit/Debit Card)
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Starts at <strong>Pending payment</strong>. Money is safely locked in platform escrow and NEVER given to technician until our QA agent calls you and you confirm satisfaction.
                  </p>
                </div>
              </div>

              {/* Cash On Verified Completion */}
              <div
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'CASH'
                    ? 'border-teal-700 bg-teal-50/50 text-slate-900 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-900">
                    Cash Payment upon Verified Completion
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Enters <strong>Requested</strong> directly. You hand cash to technician ONLY after work is completed and our QA team gives digital authorization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: SUCCESS CONFIRMATION */}
          {step === 8 && createdBooking && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900">Booking Confirmed!</h4>
                <div className="text-xs text-slate-500 font-mono">Ref: {createdBooking.bookingRef}</div>
              </div>

              {/* Prominent Start OTP */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl max-w-sm mx-auto space-y-1">
                <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block">
                  {t.customer.startOtpLabel}
                </span>
                <span className="text-3xl font-black text-teal-950 font-mono tracking-widest block tabular-nums">
                  {createdBooking.startOtp}
                </span>
                <p className="text-[10px] text-teal-800 leading-tight">
                  {t.customer.startOtpNotice}
                </p>
              </div>

              <div className="text-xs text-slate-600 max-w-md mx-auto">
                Your booking is scheduled for <strong>{createdBooking.scheduledDate}</strong> ({createdBooking.scheduledSlot}).
                You can track arrival and review technician notes on your Customer Hub.
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 && step < 8 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.common.back}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 8 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-all min-h-[44px] cursor-pointer"
            >
              <span>{step === 7 ? (paymentMethod === 'ONLINE_ESCROW' ? 'Authorize Escrow & Book' : 'Confirm Cash Booking') : t.common.next}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-all min-h-[44px] cursor-pointer"
            >
              Go to Customer Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
