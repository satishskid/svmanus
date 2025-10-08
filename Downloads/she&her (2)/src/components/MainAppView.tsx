
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
  onSignOut: () => Promise<void>;
}

const MainAppView: React.FC<MainAppViewProps> = ({ currentUser, onOpenApiKeyModal, onSignOut }) => {
  const [patientContext, setPatientContext] = useState<PatientContext>('SELF');
  const [providerSlots] = useState<ProviderSlot[]>(generateInitialProviderSlots());
  const [currentView, setCurrentView] = useState<'journey' | 'consultation' | 'appointments'>('journey');

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
        // Show navigation between journey and consultation features
        return (
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex space-x-1 border-b border-gray-200">
                <button
                  onClick={() => setCurrentView('journey')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    currentView === 'journey'
                      ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Health Journey
                </button>
                <button
                  onClick={() => setCurrentView('consultation')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    currentView === 'consultation'
                      ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  AI Consultation
                </button>
                <button
                  onClick={() => setCurrentView('appointments')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    currentView === 'appointments'
                      ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Appointments
                </button>
              </div>
            </div>

            {/* Content based on selected view */}
            {currentView === 'journey' && (
              <>
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Welcome to Your Health Journey</h2>
                  <p className="text-pink-100">Explore life stages and get personalized AI guidance</p>
                </div>
                <UserJourney
                  currentUser={currentUser}
                  currentPlan={currentPlan}
                  providerSlots={providerSlots}
                  userAppointments={userAppointments}
                  patientContext={patientContext}
                />
              </>
            )}

            {currentView === 'consultation' && (
              <ConsultationPortal currentUser={currentUser} />
            )}

            {currentView === 'appointments' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">My Appointments</h2>
                {userAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {userAppointments.map(appointment => (
                      <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">{appointment.serviceName}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.slotStartTime).toLocaleString()}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                              appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">₹{appointment.pricePaid}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No appointments found.</p>
                )}
              </div>
            )}
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
        onLogout={onSignOut}
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
