import React, { useState } from 'react';
import { I18nProvider, useI18n } from './i18n/context';
import { Role, Provider, ServiceCategory, ServiceItem, Booking } from './types';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/public/LandingPage';
import { ProviderDetailModal } from './components/public/ProviderDetailModal';
import { CategoryCatalogModal } from './components/public/CategoryCatalogModal';
import { BookingFlowModal } from './components/customer/BookingFlowModal';
import { CustomerView } from './components/customer/CustomerView';
import { ProviderView } from './components/provider/ProviderView';
import { AgentView } from './components/agent/AgentView';
import { FinanceView } from './components/finance/FinanceView';
import { AdminView } from './components/admin/AdminView';

function AppContent() {
  const { locale, isRtl } = useI18n();

  // Active Role state: default to 'visitor' for public discovery
  const [currentRole, setCurrentRole] = useState<Role>('visitor');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingCategoryId, setBookingCategoryId] = useState<string | undefined>(undefined);
  const [bookingProviderId, setBookingProviderId] = useState<string | undefined>(undefined);

  const [inspectingProvider, setInspectingProvider] = useState<Provider | null>(null);
  const [inspectingCategory, setInspectingCategory] = useState<ServiceCategory | null>(null);

  const handleOpenBooking = (categoryId?: string, providerId?: string) => {
    setBookingCategoryId(categoryId);
    setBookingProviderId(providerId);
    setIsBookingModalOpen(true);
  };

  const handleBookingCreated = (newBooking: Booking) => {
    // Optionally switch to customer role to view the new booking
    setCurrentRole('customer');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Top Header with 3 zones & Role Switcher */}
      <Header
        currentRole={currentRole}
        onRoleChange={role => setCurrentRole(role)}
        onOpenBookingModal={() => handleOpenBooking()}
      />

      {/* Main Body per Active Role */}
      <main className="flex-1">
        {currentRole === 'visitor' && (
          <LandingPage
            onOpenBookingModal={handleOpenBooking}
            onOpenProviderModal={provider => setInspectingProvider(provider)}
            onOpenCategoryModal={category => setInspectingCategory(category)}
          />
        )}

        {currentRole === 'customer' && (
          <CustomerView onOpenBookingModal={() => handleOpenBooking()} />
        )}

        {currentRole === 'provider' && <ProviderView />}

        {currentRole === 'agent' && <AgentView />}

        {currentRole === 'finance' && <FinanceView />}

        {currentRole === 'admin' && <AdminView />}
      </main>

      {/* Global Modals */}
      {inspectingProvider && (
        <ProviderDetailModal
          provider={inspectingProvider}
          onClose={() => setInspectingProvider(null)}
          onBookProvider={prov => {
            setInspectingProvider(null);
            handleOpenBooking(undefined, prov.id);
          }}
        />
      )}

      {inspectingCategory && (
        <CategoryCatalogModal
          category={inspectingCategory}
          onClose={() => setInspectingCategory(null)}
          onSelectService={srv => {
            setInspectingCategory(null);
            handleOpenBooking(srv.categoryId);
          }}
        />
      )}

      <BookingFlowModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingCreated={handleBookingCreated}
        preselectedCategoryId={bookingCategoryId}
        preselectedProviderId={bookingProviderId}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
