import React from 'react';
import { Role } from '../../types';
import { useI18n } from '../../i18n/context';
import { User, Wrench, Headphones, CreditCard, Shield, Globe } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const { locale } = useI18n();

  const roles: { id: Role; label: string; icon: React.ReactNode; badge: string }[] = [
    {
      id: 'visitor',
      label: locale === 'ur' ? 'عوامی وزٹر' : 'Public Discovery',
      icon: <Globe className="w-3.5 h-3.5" />,
      badge: 'Public',
    },
    {
      id: 'customer',
      label: locale === 'ur' ? 'کسٹمر پورٹل' : 'Customer (Tariq)',
      icon: <User className="w-3.5 h-3.5" />,
      badge: 'Resident',
    },
    {
      id: 'provider',
      label: locale === 'ur' ? 'کاریگر ٹرمینل' : 'Technician (Usman)',
      icon: <Wrench className="w-3.5 h-3.5" />,
      badge: 'Field Pro',
    },
    {
      id: 'agent',
      label: locale === 'ur' ? 'کوالٹی آڈٹ' : 'QA Dispatch (Farah)',
      icon: <Headphones className="w-3.5 h-3.5" />,
      badge: 'Phone QA',
    },
    {
      id: 'finance',
      label: locale === 'ur' ? 'ایسکرو خزانہ' : 'Treasury (Bilal)',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      badge: 'Escrow',
    },
    {
      id: 'admin',
      label: locale === 'ur' ? 'کمانڈ سینٹر' : 'Admin Operations',
      icon: <Shield className="w-3.5 h-3.5" />,
      badge: 'Root',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-blue-200/80 shadow-xs">
      <span className="hidden xl:inline text-[10px] font-bold text-blue-900/70 px-2 uppercase tracking-widest font-mono">
        {locale === 'ur' ? 'کردار:' : 'Role //'}
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {roles.map(role => {
          const isActive = currentRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all whitespace-nowrap min-h-[30px] font-medium cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                  : 'text-slate-700 hover:text-black hover:bg-blue-50/80'
              }`}
              title={`Switch perspective to ${role.label}`}
            >
              <span className={isActive ? 'text-white' : 'text-blue-600'}>
                {role.icon}
              </span>
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
