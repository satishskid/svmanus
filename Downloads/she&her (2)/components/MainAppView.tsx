
import React, { useState, useMemo, useCallback } from 'react';
import { UserRole, Service, Appointment, User, PatientContext, ProviderSlot } from '../types';

// Mock service data for demo
const mockServices: Service[] = [
  {
    id: "menstrual-health",
    name: "Menstrual Health Consultation",
    description: "Comprehensive consultation for menstrual health concerns",
    type: "Telemedicine",
    icon: () => <div>🩺</div>,
    price: 150,
    relevantStages: [],
  },
  {
    id: "pregnancy-planning",
    name: "Pregnancy Planning Consultation",
    description: "Planning and preparation for pregnancy",
    type: "In-Clinic",
    icon: () => <div>🤰</div>,
    price: 200,
    relevantStages: [],
  }
];

import Header from './Header';
import Footer from './Footer';
import UserJourney from './UserJourney';
import HrDashboard from './HrDashboard';
import ProviderPortal from './ProviderPortal';
import ManagerDashboard from './ManagerDashboard';
import ConsultationPortal from './ConsultationPortal';
import PWAInstall from './PWAInstall';
import { generateInitialProviderSlots } from '../utils';
import { REFERRAL_URL, APP_NAME, SERVICES_DATA, PROVIDERS_DATA, CORPORATE_PLANS_DATA, PRODUCT_KNOWLEDGE_DATA } from '../constants';
import { FullPageSpinner } from './LoadingSpinner';

interface MainAppViewProps {
  currentUser: User;
  onOpenApiKeyModal: () => void;
}

const MainAppView: React.FC<MainAppViewProps> = ({ currentUser, onOpenApiKeyModal }) => {
  const [patientContext, setPatientContext] = useState<PatientContext>('SELF');
  const [providerSlots] = useState<ProviderSlot[]>(generateInitialProviderSlots());

  // The user role can be switched in the UI for demo purposes.
  // In a real app, this would be fixed based on the user's DB record.
  const [displayRole, setDisplayRole] = useState<UserRole>(currentUser.role);

  const corporatePlansMap = useMemo(() => new Map(CORPORATE_PLANS_DATA.map(p => [p.id, p])), []);
  const currentPlan = useMemo(() => currentUser.corporatePlanId ? corporatePlansMap.get(currentUser.corporatePlanId) : undefined, [currentUser, corporatePlansMap]);

  // Mock data for demo mode when database functions aren't available
  const mockAppointments: Appointment[] = [
    {
      _id: "demo-appointment-1",
      _creationTime: Date.now(),
      userId: currentUser._id as any,
      user: currentUser,
      serviceId: "menstrual-health",
      serviceName: "Menstrual Health Consultation",
      service: mockServices[0],
      slotStartTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
      status: "Completed",
      pricePaid: 150,
      patientContext: "SELF",
    },
    {
      _id: "demo-appointment-2",
      _creationTime: Date.now(),
      userId: currentUser._id as any,
      user: currentUser,
      serviceId: "pregnancy-planning",
      serviceName: "Pregnancy Planning Consultation",
      service: mockServices[1],
      slotStartTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
      status: "Confirmed",
      pricePaid: 200,
      patientContext: "SELF",
    }
  ];

  const userAppointments = useMemo(() => {
    return mockAppointments.filter(a => a.userId === currentUser._id);
  }, [mockAppointments, currentUser._id]);

  const allAppointments = mockAppointments;

  const handleSignOut = () => {
    // For demo mode, just reload the page
    window.location.reload();
  };

  const renderContent = () => {
    switch(displayRole) {
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'HR':
        const corporateAppointments = allAppointments.filter(a => !!a.user?.corporatePlanId);
        return <HrDashboard userCount={1} sessionCount={542} appointments={corporateAppointments} />;
      case 'PROVIDER':
        return <ProviderPortal appointments={allAppointments as Appointment[]} />;
      case 'USER':
      default:
        // For demo purposes, show consultation portal for users
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome to AI Consultation</h2>
              <p className="text-pink-100">Get instant AI-powered health consultations and expert guidance</p>
            </div>
            <ConsultationPortal currentUser={currentUser} />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        appName={APP_NAME}
        currentRole={displayRole}
        onRoleChange={setDisplayRole}
        currentUser={currentUser}
        patientContext={patientContext}
        onPatientContextChange={setPatientContext}
        onLogout={handleSignOut}
        onOpenApiKeyModal={onOpenApiKeyModal}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
      <Footer referralUrl={REFERRAL_URL} />

      {/* PWA Install Prompt */}
      <PWAInstall />
    </div>
  );
};

export default MainAppView;
