import React, { useState } from 'react';
import { Role } from '../../types';
import { useI18n } from '../../i18n/context';
import { RoleSwitcher } from './RoleSwitcher';
import { Languages, Menu, X, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onOpenBookingModal: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenBookingModal,
}) => {
  const { t, locale, setLocale } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ur' : 'en');
  };

  const handleNavClick = (anchor: string) => {
    setMobileMenuOpen(false);
    if (currentRole !== 'visitor') {
      onRoleChange('visitor');
    }
    setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100/80 shadow-xs">
      {/* Top Futuristic Protocol Status Bar */}
      <div className="bg-[#050B14] text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/40">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </div>
          <span className="font-semibold text-blue-200 tracking-wider text-[11px] font-mono uppercase">
            {locale === 'ur' ? 'لاہور سمارٹ گرڈ لائیو' : 'SMART DISPATCH OS // LAHORE SECTOR 01-09 ACTIVE'}
          </span>
          <span className="hidden md:inline text-blue-800">|</span>
          <span className="hidden md:inline text-[11px] text-slate-400">
            {locale === 'ur' ? '4 مرحلہ وار تصدیق اور ایسکرو فعال' : 'SLA Target: < 30 Min Dispatch · Escrow Safeguarded'}
          </span>
        </div>
        <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
      </div>

      {/* Main Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark with futuristic icon */}
        <button
          onClick={() => onRoleChange('visitor')}
          className="text-left group cursor-pointer flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-black flex items-center gap-1.5 font-display">
              <span>SMART HOME</span>
              <span className="text-[10px] font-mono text-blue-600 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200/60">
                PRO
              </span>
            </div>
            <div className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase font-mono">
              {locale === 'ur' ? 'لاہور ہوم سروسز نیٹ ورک' : 'Verified Trades Network · Lahore'}
            </div>
          </div>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-700">
          <button
            onClick={() => handleNavClick('services-section')}
            className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-blue-600 after:transition-all"
          >
            {t.navServices}
          </button>
          <button
            onClick={() => handleNavClick('how-it-works-section')}
            className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-blue-600 after:transition-all"
          >
            {t.navHowItWorks}
          </button>
          <button
            onClick={() => handleNavClick('trust-section')}
            className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-blue-600 after:transition-all"
          >
            {t.navTrustSafety}
          </button>
          <button
            onClick={() => handleNavClick('plans-section')}
            className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-blue-600 after:transition-all"
          >
            {t.navPricing}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-slate-200/80 min-h-[38px] cursor-pointer"
            title="Switch Language / زبان تبدیل کریں"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold">{locale === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Futuristic High-Contrast Primary CTA Button */}
          <button
            onClick={onOpenBookingModal}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md shadow-blue-500/25 transition-all whitespace-nowrap min-h-[38px] flex items-center gap-2 cursor-pointer tracking-wide"
          >
            <span>{locale === 'ur' ? 'فوری سروس بک کریں' : 'Instant Dispatch'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-black hover:bg-blue-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-blue-100 px-5 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-black">
            <button
              onClick={() => handleNavClick('services-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              {t.navServices}
            </button>
            <button
              onClick={() => handleNavClick('how-it-works-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              {t.navHowItWorks}
            </button>
            <button
              onClick={() => handleNavClick('trust-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              {t.navTrustSafety}
            </button>
            <button
              onClick={() => handleNavClick('plans-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              {t.navPricing}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
