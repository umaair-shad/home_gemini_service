import React from 'react';
import { Provider, formatPKR } from '../../types';
import { useI18n } from '../../i18n/context';
import { ImageFallback } from '../common/ImageFallback';
import { X, Star, ShieldCheck, MapPin, Award, CheckCircle2, Lock, Calendar } from 'lucide-react';

interface ProviderDetailModalProps {
  provider: Provider | null;
  onClose: () => void;
  onBookProvider: (provider: Provider) => void;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  onClose,
  onBookProvider,
}) => {
  const { t, locale } = useI18n();

  if (!provider) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {locale === 'ur' ? provider.businessNameUr : provider.businessName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{locale === 'ur' ? provider.nameUr : provider.name}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {locale === 'ur' ? 'مکمل نادرا و پولیس تصدیق شدہ' : 'NADRA & Police Verified Pro'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <ImageFallback
                src={provider.avatar}
                alt={provider.name}
                type="avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900 text-sm">{provider.rating.toFixed(2)}</span>
                  <span className="text-xs text-slate-500">({provider.totalReviews} verified reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                  <span>{provider.experienceYears} Years Field Experience</span>
                  <span aria-hidden="true">·</span>
                  <span>{provider.completedJobsCount} Jobs Completed</span>
                </div>
                {/* Privacy Safeguard: Masked Contact */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Phone: {provider.phoneMasked} (Private until job accepted)</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="text-xs text-slate-500">Hourly / Base Rate</div>
              <div className="text-lg font-extrabold text-teal-900 tabular-nums">
                {formatPKR(provider.hourlyRatePaisa)}
              </div>
              <span className="text-[11px] text-slate-500">Visit & diagnosis included</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {locale === 'ur' ? 'پیشہ ورانہ تعارف' : 'Professional Background'}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {locale === 'ur' ? provider.bioUr : provider.bioEn}
            </p>
          </div>

          {/* Lahore Coverage Areas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {locale === 'ur' ? 'لاہور میں سروس ایریاز' : 'Service Coverage Areas'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {provider.serviceAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200"
                >
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Credentials */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {locale === 'ur' ? 'تصدیق شدہ دستاویزات' : 'Verified Credentials & Documents'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">NADRA Smart CNIC</div>
                  <div className="text-[11px] text-slate-600">Identity verified & physical address verified</div>
                </div>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">Punjab Police Clearance</div>
                  <div className="text-[11px] text-slate-600">Zero criminal record history confirmed</div>
                </div>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">Technical Skill Certified</div>
                  <div className="text-[11px] text-slate-600">TEVTA Punjab / DAE Trade Diploma holder</div>
                </div>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">98.4% QA Call Score</div>
                  <div className="text-[11px] text-slate-600">Verified by customer telephone audits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {locale === 'ur' ? 'ریٹنگ اور جائزے' : 'Rating Distribution'}
            </h4>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = provider.ratingDistribution[stars] || 0;
                const pct = provider.totalReviews > 0 ? (count / provider.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-medium text-slate-600">{stars} Stars</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-500 tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {locale === 'ur'
              ? 'بکنگ پر کاریگر کو 60 سیکنڈ میں ڈسپیچ کیا جائے گا'
              : 'Direct dispatch with 60-second acceptance SLA'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 min-h-[44px]"
            >
              {t.common.close}
            </button>
            <button
              onClick={() => {
                onClose();
                onBookProvider(provider);
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-all min-h-[44px] cursor-pointer"
            >
              {locale === 'ur' ? 'یہ کاریگر منتخب کریں' : 'Book This Technician'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
