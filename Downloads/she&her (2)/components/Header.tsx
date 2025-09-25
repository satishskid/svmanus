import React from 'react';
import { SheHerLogo, ArrowRightOnRectangleIcon, KeyIcon } from './Icons';
import RoleSwitcher from './RoleSwitcher';
import PatientContextSwitcher from './PatientContextSwitcher';
import { UserRole, User, PatientContext } from '../types';

interface HeaderProps {
  appName: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: User;
  patientContext: PatientContext;
  onPatientContextChange: (context: PatientContext) => void;
  onLogout: () => void;
  onOpenApiKeyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  appName, 
  currentRole, onRoleChange, 
  currentUser,
  patientContext, onPatientContextChange,
  onLogout,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 text-white shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <SheHerLogo className="h-10 w-10 text-pink-200" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{appName}</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block text-sm font-medium border-r border-white/20 pr-4 mr-2">
            Welcome, {currentUser.name}
          </div>
          {currentRole === 'USER' && (
            <PatientContextSwitcher 
              currentContext={patientContext} 
              onContextChange={onPatientContextChange} 
            />
          )}
          <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
          <button
            onClick={onOpenApiKeyModal}
            title="API Key Settings"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <KeyIcon className="h-6 w-6"/>
          </button>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6"/>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;