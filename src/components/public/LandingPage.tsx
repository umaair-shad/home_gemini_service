import React, { useState } from 'react';
import { useI18n } from '../../i18n/context';
import { adapter } from '../../data/adapter';
import { ServiceCategory, Provider, formatPKR } from '../../types';
import { ImageFallback } from '../common/ImageFallback';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
  Clock,
  PhoneCall,
  Check,
  Zap,
  Wrench,
  Wind,
  Hammer,
  Paintbrush,
  Cpu,
  Lock,
  Award,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onOpenBookingModal: (preselectedServiceId?: string, preselectedProviderId?: string) => void;
  onOpenProviderModal: (provider: Provider) => void;
  onOpenCategoryModal: (category: ServiceCategory) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenBookingModal,
  onOpenProviderModal,
  onOpenCategoryModal,
}) => {
  const { t, locale } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Interactive Live Diagnostic HUD state
  const [activeHudCategory, setActiveHudCategory] = useState<string>('cat-1'); // default HVAC
  const [activeSector, setActiveSector] = useState<string>('DHA Phase 5');

  const categories = adapter.getCategories();
  const allProviders = adapter.getProviders();
  const maintenancePlans = adapter.getMaintenancePlans();

  const lahoreNeighborhoods = [
    'All',
    'DHA Phase 1–9',
    'Gulberg II & III',
    'Model Town',
    'Johar Town',
    'Lahore Cantt',
    'Bahria Town',
  ];

  // Filtered providers
  const filteredProviders = allProviders.filter(p => {
    const matchesCategory = selectedCategoryFilter === 'all' || p.categoryIds.includes(selectedCategoryFilter);
    const matchesArea = selectedArea === 'All' || p.serviceAreas.some(a => a.toLowerCase().includes(selectedArea.toLowerCase()));
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bioEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesArea && matchesSearch;
  });

  const getCategoryIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Zap': return <Zap className={`${className} text-blue-600`} />;
      case 'Wrench': return <Wrench className={`${className} text-blue-600`} />;
      case 'Wind': return <Wind className={`${className} text-cyan-500`} />;
      case 'Hammer': return <Hammer className={`${className} text-indigo-600`} />;
      case 'Paintbrush': return <Paintbrush className={`${className} text-blue-500`} />;
      case 'Cpu': return <Cpu className={`${className} text-sky-500`} />;
      default: return <Wrench className={`${className} text-blue-600`} />;
    }
  };

  const selectedCategoryData = categories.find(c => c.id === activeHudCategory) || categories[0];

  return (
    <div className="space-y-24 pb-28">
      {/* 1. FUTURISTIC MINIMALISTIC HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-12 pb-24 border-b border-blue-100/70">
        {/* Futuristic Cyber-Grid Background with subtle blue ambient gradients */}
        <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-b from-blue-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Futuristic Protocol Tag */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wider font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>DISPATCH PROTOCOL // 2026</span>
                <span className="text-blue-300">·</span>
                <span className="text-black font-bold">LAHORE SMART GRID</span>
              </div>

              {/* Bold Futuristic Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-black leading-[1.1] font-display">
                {locale === 'ur' ? (
                  <span>لاہور کے جدید ترین گھروں کے لیے خودکار اور تصدیق شدہ مرمتی نیٹ ورک</span>
                ) : (
                  <span>
                    Autonomous Dispatch & <span className="text-blue-600">Precision Trades</span> for Lahore.
                  </span>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-normal">
                {locale === 'ur' ? (
                  <span>ڈی ایچ اے، گلبرگ اور ماڈل ٹاؤن میں تصدیق شدہ الیکٹریشنز اور اے سی انجینئرز فوری دستیاب ہیں۔ 4-مرحلہ وار ڈیجیٹل آڈٹ، کسٹمر او ٹی پی اور ایسکرو گارنٹی کے ساتھ۔</span>
                ) : (
                  <span>Instant, escrow-protected dispatch of licensed HVAC specialists, electricians, and master plumbers across DHA, Gulberg, Model Town & Cantt. Zero cash overcharging, strict arrival PINs, and guaranteed 30-day warranty.</span>
                )}
              </p>

              {/* Futuristic High-Contrast Search & Dispatch Bar */}
              <div className="p-2 bg-white rounded-2xl border-2 border-blue-500/20 shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="w-5 h-5 text-blue-600 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={locale === 'ur' ? 'سروس تلاش کریں: اے سی، وائرنگ، پلمبنگ...' : 'Search trade: Inverter AC, DB Board, Motor Pump, Solar...'}
                    className="w-full pl-3 pr-4 py-3 text-sm text-black placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
                  />
                </div>

                <div className="relative w-full sm:w-52 border-t sm:border-t-0 sm:border-l border-slate-200 flex items-center">
                  <MapPin className="w-4 h-4 text-blue-600 ml-3 shrink-0" />
                  <select
                    value={selectedArea}
                    onChange={e => setSelectedArea(e.target.value)}
                    className="w-full pl-3 pr-4 py-3 text-xs text-black font-semibold bg-transparent focus:outline-none cursor-pointer"
                  >
                    {lahoreNeighborhoods.map(area => (
                      <option key={area} value={area} className="bg-white text-black">
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => onOpenBookingModal()}
                  className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/30 transition-all whitespace-nowrap min-h-[46px] cursor-pointer flex items-center justify-center gap-2 tracking-wider uppercase font-display"
                >
                  <span>{t.ctaBookNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Futuristic Telemetry Proof Metrics */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-bold text-black font-mono-nums text-sm">450+</span>
                  <span>Licensed Technicians</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-bold text-black font-mono-nums text-sm">18,200+</span>
                  <span>Jobs Cleared</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="font-bold text-black font-mono-nums text-sm">&lt; 28 min</span>
                  <span>Dispatch SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-bold text-black font-mono-nums text-sm">100%</span>
                  <span>Escrow Protection</span>
                </div>
              </div>
            </div>

            {/* Right: Futuristic Live Diagnostic Radar & HUD Simulator */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-6 sm:p-7 bg-[#070D18] text-white border border-blue-500/30 shadow-2xl cyber-glow-blue space-y-6 overflow-hidden">
                {/* High-tech grid background & subtle scanline */}
                <div className="absolute inset-0 cyber-grid-dark opacity-50 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                {/* HUD Header */}
                <div className="relative z-10 flex items-center justify-between pb-4 border-b border-blue-900/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-400">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-widest font-mono uppercase">
                        TRADE RADAR HUD
                      </div>
                      <div className="text-[11px] text-blue-300 font-mono">
                        Live Sector Telemetry & SLA
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-500/40 text-[10px] font-mono text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>GRID ONLINE</span>
                  </div>
                </div>

                {/* Interactive Trade Selector Tabs inside HUD */}
                <div className="relative z-10 space-y-2">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span>Select Trade Discipline:</span>
                    <span className="text-blue-400 font-mono">5 Active Disciplines</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.slice(0, 6).map(c => {
                      const isActive = c.id === activeHudCategory;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveHudCategory(c.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/40'
                              : 'bg-blue-950/40 text-slate-300 border-blue-900/60 hover:border-blue-700 hover:bg-blue-900/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">
                              {locale === 'ur' ? c.nameUr : c.nameEn.split(' ')[0]}
                            </span>
                            {getCategoryIcon(c.iconName, `w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-400'}`)}
                          </div>
                          <span className={`text-[10px] font-mono-nums ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {formatPKR(c.baseInspectionFeePaisa)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-Time Telemetry Readout */}
                <div className="relative z-10 bg-blue-950/60 rounded-2xl p-4 border border-blue-800/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target Discipline:</span>
                    <span className="font-bold text-white font-display">
                      {locale === 'ur' ? selectedCategoryData.nameUr : selectedCategoryData.nameEn}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Diagnostic Inspection:</span>
                    <span className="font-bold text-cyan-300 font-mono-nums text-sm">
                      {formatPKR(selectedCategoryData.baseInspectionFeePaisa)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estimated Job Scope:</span>
                    <span className="font-semibold text-slate-200 font-mono-nums text-[11px]">
                      {formatPKR(selectedCategoryData.estimatedRangePaisa.min)} – {formatPKR(selectedCategoryData.estimatedRangePaisa.max)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-900/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Estimated Arrival:</span>
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      18 – 30 Minutes
                    </span>
                  </div>
                </div>

                {/* Instant Dispatch Action */}
                <div className="relative z-10 pt-1">
                  <button
                    onClick={() => onOpenBookingModal(selectedCategoryData.id)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/40 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider font-display min-h-[46px]"
                  >
                    <span>Dispatch {locale === 'ur' ? selectedCategoryData.nameUr : selectedCategoryData.nameEn} Specialist</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
                    Escrow locked · Arrival OTP generated immediately on booking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FUTURISTIC TRADE MATRIX (Bento Grid) */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-blue-100 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>DISCIPLINE DIRECTORY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight font-display">
              {t.categoriesTitle}
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md font-normal">
            Standardized diagnostic fees, itemized pricing catalog, and 30-day post-service warranty with every booking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-blue-100 hover:border-blue-500/80 p-6 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => onOpenCategoryModal(cat)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3.5 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                    {getCategoryIcon(cat.iconName, "w-6 h-6 group-hover:text-white")}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Diagnostic Fee</span>
                    <span className="text-base font-extrabold text-black font-mono-nums">
                      {formatPKR(cat.baseInspectionFeePaisa)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-black group-hover:text-blue-600 transition-colors font-display">
                    {locale === 'ur' ? cat.nameUr : cat.nameEn}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {locale === 'ur' ? cat.descriptionUr : cat.descriptionEn}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 font-mono">
                  <span className="font-semibold text-blue-600">{cat.activeServicesCount} Verified Services</span>
                  <span className="font-mono-nums text-[11px] text-slate-500">
                    Est: {formatPKR(cat.estimatedRangePaisa.min)} – {formatPKR(cat.estimatedRangePaisa.max)}
                  </span>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCategoryModal(cat);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors min-h-[42px] cursor-pointer"
                >
                  {t.viewServicesBtn}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBookingModal(cat.id);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 min-h-[42px] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AUTONOMOUS PROTOCOL ENGINE (How It Works) */}
      <section id="how-it-works-section" className="bg-slate-50/80 py-20 border-y border-blue-100/60 relative">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono flex items-center justify-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              <span>THE 4-STEP PROTOCOL ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight font-display">
              {t.howItWorksTitle}
            </h2>
            <p className="text-sm text-slate-600 font-normal">
              Built to eradicate informal price haggling, ghost visits, and unverified repairs with mathematical clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xs hover:border-blue-400 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-md shadow-blue-500/20">
                01
              </div>
              <h3 className="font-extrabold text-base text-black font-display">{t.step1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step1Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xs hover:border-blue-400 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-md shadow-blue-500/20">
                02
              </div>
              <h3 className="font-extrabold text-base text-black font-display">{t.step2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step2Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xs hover:border-blue-400 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-md shadow-blue-500/20">
                03
              </div>
              <h3 className="font-extrabold text-base text-black font-display">{t.step3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step3Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xs hover:border-blue-400 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-md shadow-blue-500/20">
                04
              </div>
              <h3 className="font-extrabold text-base text-black font-display">{t.step4Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST & SECURITY SAFEGUARDS */}
      <section id="trust-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 sm:p-12 shadow-sm space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>ZERO-RISK GUARANTEE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight font-display">
              {t.trustTitle}
            </h2>
            <p className="text-sm text-slate-600 font-normal">
              Engineered specifically for gated residences, luxury bungalows, and commercial suites across Lahore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3.5 p-6 rounded-2xl bg-blue-50/50 border border-blue-100/80">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-black font-display">{t.trust1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.trust1Desc}</p>
            </div>

            <div className="space-y-3.5 p-6 rounded-2xl bg-blue-50/50 border border-blue-100/80">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-black font-display">{t.trust2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.trust2Desc}</p>
            </div>

            <div className="space-y-3.5 p-6 rounded-2xl bg-blue-50/50 border border-blue-100/80">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-black font-display">{t.trust3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.trust3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VETTED LAHORE SPECIALISTS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>FIELD SPECIALISTS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-black tracking-tight font-display">
              {locale === 'ur' ? 'لاہور کے تصدیق شدہ کاریگر' : 'Vetted Local Craftsmen in Lahore'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Direct access to professionals with verifiable track records and QA phone audit pass rates.
            </p>
          </div>

          {/* Clean Segmented Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full border border-slate-200">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              All Trades
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryFilter(c.id)}
                className={`px-3.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategoryFilter === c.id
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                {locale === 'ur' ? c.nameUr : c.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <div
              key={provider.id}
              className="bg-white rounded-2xl border border-blue-100 hover:border-blue-500/70 p-6 shadow-xs hover:shadow-lg hover:shadow-blue-500/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ImageFallback
                      src={provider.avatar}
                      alt={provider.name}
                      type="avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-black font-display">
                        {locale === 'ur' ? provider.businessNameUr : provider.businessName}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">{provider.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-blue-600 text-xs font-bold font-mono-nums bg-blue-50 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                    <span>{provider.rating.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {locale === 'ur' ? provider.bioUr : provider.bioEn}
                </p>

                {/* Areas & Badges */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{provider.serviceAreas.join(' · ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>NADRA Cleared · {provider.verificationPassRate}% QA Score</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Diagnostic Rate</span>
                  <span className="text-xs font-extrabold text-black font-mono-nums">
                    {formatPKR(provider.hourlyRatePaisa)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenProviderModal(provider)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors min-h-[36px] cursor-pointer"
                  >
                    Dossier
                  </button>
                  <button
                    onClick={() => onOpenBookingModal(undefined, provider.id)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm shadow-blue-500/20 min-h-[36px] cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SMART RESIDENCE RETAINER PLANS */}
      <section id="plans-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#050C1A] text-white rounded-3xl p-8 sm:p-14 border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-dark opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2 relative z-10">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
              PREVENTATIVE CARE RETAINERS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Annual Residence Maintenance Retainers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Proactive scheduled seasonal HVAC overhauls, quarterly electrical safety audits, and zero emergency surcharge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-10">
            {maintenancePlans.map(plan => (
              <div
                key={plan.id}
                className="bg-blue-950/40 backdrop-blur-md rounded-2xl p-8 border border-blue-800/80 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-xl text-white font-display">
                      {locale === 'ur' ? plan.nameUr : plan.nameEn}
                    </h3>
                    <span className="text-[11px] text-cyan-300 font-mono font-semibold px-2.5 py-0.5 rounded border border-blue-400/40 bg-blue-900/60">
                      {plan.discountPercentage}% Discounted
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono-nums">
                      {formatPKR(plan.priceMonthlyPaisa)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ month billed annually</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-200">
                    {(locale === 'ur' ? plan.featuresUr : plan.featuresEn).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onOpenBookingModal()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/30 min-h-[46px] cursor-pointer tracking-wider uppercase font-display"
                >
                  Enroll Residence in {locale === 'ur' ? plan.nameUr : plan.nameEn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
