import React from 'react';
import { useI18n } from '../../i18n/context';
import { ShieldCheck, PhoneCall, MapPin, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { locale } = useI18n();

  return (
    <footer className="bg-[#050B14] text-slate-300 border-t border-blue-900/40 pt-16 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-dark opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-blue-950">
          {/* Brand & Trust */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/25">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight block font-display">
                  SMART HOME PRO
                </span>
                <span className="text-[10px] tracking-widest text-cyan-400 font-mono uppercase">
                  LAHORE DISPATCH OS
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              {locale === 'ur'
                ? 'لاہور بھر کے جدید گھروں کے لیے خودکار تصدیق شدہ تکنیکی خدمات۔ نادرا ویریفائیڈ کاریگر اور ایسکرو تحفظ۔'
                : 'Autonomous residential maintenance and precision engineering for Lahore. Fully verified master technicians backed by 100% escrow protection.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium font-mono">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{locale === 'ur' ? 'نادرا اور پولیس تصدیق شدہ عملہ' : 'NADRA CNIC & Police Vetted Personnel'}</span>
            </div>
          </div>

          {/* Lahore Coverage Zones */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{locale === 'ur' ? 'لاہور کے فعال سیکٹرز' : 'Active Grid Sectors'}</span>
            </h4>
            <ul className="text-xs space-y-2.5 text-slate-400 font-mono">
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>DHA Phase 1–9 & Raya Golf Resort</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Gulberg II & III, MM Alam Precinct</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Model Town & Garden Town Enclaves</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Johar Town & Canal Executive Estates</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Lahore Cantt & Askari 1–11</span>
              </li>
            </ul>
          </div>

          {/* Customer Protection */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{locale === 'ur' ? 'صارف تحفظ ایس ایل اے' : 'Protection Safeguards'}</span>
            </h4>
            <ul className="text-xs space-y-2.5 text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>30-Day Workmanship Warranty</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Arrival Security OTP Requirement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Fixed Upfront Diagnostic Fee</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>100% Post-Job Telephone QA Audit</span>
              </li>
            </ul>
          </div>

          {/* Support & Dispatch */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{locale === 'ur' ? 'ہیلپ لائن اور سپورٹ' : 'Dispatch Control Line'}</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3 font-mono">
              {locale === 'ur'
                ? 'ہفتے کے 7 دن صبح 8 بجے سے رات 10 بجے تک دستیاب'
                : 'Direct dispatch line: 08:00 AM – 10:00 PM PKT daily'}
            </p>
            <div className="p-3.5 bg-blue-950/60 rounded-xl border border-blue-800/60">
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-1 font-mono-nums">
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span>042-111-737-247</span>
              </div>
              <span className="text-[11px] text-slate-400 block font-mono">dispatch@smarthome.pk · Lahore</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-mono">
          <p>© 2026 Smart Home Concierge Services. Registered in Pakistan.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Escrow Trust Engine</span>
            <span aria-hidden="true">·</span>
            <span>NADRA Verified Personnel</span>
            <span aria-hidden="true">·</span>
            <span>Zero Cash Overcharge Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
