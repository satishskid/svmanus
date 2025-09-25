

import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Appointment, ProductKnowledge } from '../types';
import AddNotesModal from './AddNotesModal';
import ProviderProtocolView from './ProviderProtocolView';
import { ClipboardDocCheckIcon, BookOpenIcon } from './Icons';
import { PRODUCT_KNOWLEDGE_DATA } from '../constants';

interface ProviderPortalProps {
  appointments: Appointment[];
}

type ProviderTab = 'appointments' | 'protocols';

const StatusBadge: React.FC<{ status: Appointment['status'] }> = ({ status }) => {
    const colorClasses = {
        Confirmed: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[status]}`}>{status}</span>;
};

const TabButton: React.FC<{ tabId: ProviderTab; activeTab: ProviderTab; onClick: (tabId: ProviderTab) => void; icon: React.FC<any>; children: React.ReactNode; }> = ({ tabId, activeTab, onClick, icon: Icon, children }) => {
  const isActive = tabId === activeTab;
  return (
    <button onClick={() => onClick(tabId)} className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${isActive ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </button>
  );
};

const ProviderPortal: React.FC<ProviderPortalProps> = ({ appointments }) => {
  const [activeTab, setActiveTab] = useState<ProviderTab>('appointments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const updateStatus = useMutation(api.appointments.updateAppointmentStatus);
  const addNotes = useMutation(api.appointments.addAppointmentNotes);

  const ai = useMemo(() => {
    // Fix: Cast import.meta to any to resolve TypeScript error.
    const apiKey = localStorage.getItem('gemini_api_key') || (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, []);
  
  const handleOpenNotesModal = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
  };
  
  const handleSaveNotes = (notes: string) => {
      if(selectedAppointment) {
          addNotes({ id: selectedAppointment._id, notes });
      }
      setIsModalOpen(false);
      setSelectedAppointment(null);
  }

  const renderAppointmentsView = () => (
    <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.length > 0 ? appointments.map((appt) => (
              <tr key={appt._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(appt.slotStartTime).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.user.name}{appt.patientContext !== 'SELF' && <span className="block text-xs italic">(for {appt.patientContext.toLowerCase()})</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.serviceName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={appt.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  {appt.status === 'Confirmed' && <button onClick={() => updateStatus({ id: appt._id, status: 'Completed' })} className="text-green-600 hover:text-green-900">Mark Completed</button>}
                  {appt.status === 'Completed' && <button onClick={() => handleOpenNotesModal(appt)} className="text-indigo-600 hover:text-indigo-900">{appt.notes ? 'Edit Notes' : 'Add Notes'}</button>}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">No appointments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Provider Portal</h2>
          <p className="text-gray-600 mt-1">Manage appointments and access training materials.</p>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-2">
            <TabButton tabId="appointments" activeTab={activeTab} onClick={setActiveTab} icon={ClipboardDocCheckIcon}>Appointments</TabButton>
            <TabButton tabId="protocols" activeTab={activeTab} onClick={setActiveTab} icon={BookOpenIcon}>Protocols & Training</TabButton>
          </nav>
        </div>

        {activeTab === 'appointments' && renderAppointmentsView()}
        {activeTab === 'protocols' && <ProviderProtocolView productKnowledge={PRODUCT_KNOWLEDGE_DATA} ai={ai} />}

      </div>
      {selectedAppointment && (
        <AddNotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveNotes} appointment={selectedAppointment} />
      )}
    </>
  );
};

export default ProviderPortal;
