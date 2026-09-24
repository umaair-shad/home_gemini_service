import React from 'react';
import { ServiceCategory, ServiceItem, formatPKR } from '../../types';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import { X, CheckCircle2, ShieldAlert, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

interface CategoryCatalogModalProps {
  category: ServiceCategory | null;
  onClose: () => void;
  onSelectService: (service: ServiceItem) => void;
}

export const CategoryCatalogModal: React.FC<CategoryCatalogModalProps> = ({
  category,
  onClose,
  onSelectService,
}) => {
  const { t, locale } = useI18n();

  if (!category) return null;

  const services = adapter.getServices(category.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {locale === 'ur' ? category.nameUr : category.nameEn}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === 'ur' ? category.descriptionUr : category.descriptionEn}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Notice */}
        <div className="bg-teal-50/70 border-b border-teal-100 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-teal-900">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span className="font-semibold">Inspection-First Pricing:</span>
            <span>Pay fixed visit & diagnostic fee upfront. Any spare parts quoted before install.</span>
          </div>
          <div className="font-bold text-teal-900 tabular-nums">
            Base Visit: {formatPKR(category.baseInspectionFeePaisa)}
          </div>
        </div>

        {/* Services List */}
        <div className="p-6 space-y-6">
          {services.map(service => (
            <div
              key={service.id}
              className="p-5 rounded-xl border border-slate-200 hover:border-teal-300 transition-all bg-white hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {locale === 'ur' ? service.titleUr : service.titleEn}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {service.warrantyDays}-Day Warranty
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Standard Lahore Service</span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                  <div className="text-xs text-slate-500">Visit & Labor Est.</div>
                  <div className="text-base font-extrabold text-teal-900 tabular-nums">
                    {formatPKR(service.baseInspectionFeePaisa + service.estimatedLaborPaisa)}
                  </div>
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="font-semibold text-slate-900 block mb-2">What is included:</span>
                  <ul className="space-y-1.5 text-slate-600">
                    {(locale === 'ur' ? service.inclusionsUr : service.inclusionsEn).map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-2">Not included (quoted if required):</span>
                  <ul className="space-y-1.5 text-slate-500">
                    {(locale === 'ur' ? service.exclusionsUr : service.exclusionsEn).map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onSelectService(service);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-all min-h-[44px] cursor-pointer"
                >
                  <span>{locale === 'ur' ? 'یہ سروس بک کریں' : 'Book This Service'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
