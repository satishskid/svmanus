import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
// import { useMutation } from "convex/react";
// import { api } from "convex/_generated/api";
import { Appointment } from '../types';
import { PRODUCT_KNOWLEDGE_DATA } from '../constants';
import ProviderProtocolView from './ProviderProtocolView';
import AddNotesModal from './AddNotesModal';
import { ClipboardDocCheckIcon, BookOpenIcon, UserCircleIcon, CalendarDaysIcon } from './Icons';

type ProviderTab = 'appointments' | 'consultations' | 'analytics' | 'protocols';

interface ProviderPortalProps {
  appointments: Appointment[];
}

const ProviderPortal: React.FC<ProviderPortalProps> = ({ appointments }) => {
  const [activeTab, setActiveTab] = useState<ProviderTab>('appointments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeConsultations, setActiveConsultations] = useState<any[]>([]);
  const [consultationHistory, setConsultationHistory] = useState<any[]>([]);

  // const updateStatus = useMutation(api.appointments.updateAppointmentStatus);
  // const addNotes = useMutation(api.appointments.addAppointmentNotes);

  const ai = useMemo(() => {
    const apiKey = localStorage.getItem('gemini_api_key') || (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, []);

  const handleOpenNotesModal = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
  };

  const handleStartConsultation = (appointment: Appointment) => {
    const consultation = {
      id: `consult-${Date.now()}`,
      appointmentId: appointment._id,
      patientName: appointment.user.name,
      patientContext: appointment.patientContext,
      serviceName: appointment.serviceName,
      status: 'active',
      startTime: new Date(),
      context: `Patient booked for ${appointment.serviceName}. Previous conversation context available.`,
      conversationHistory: [],
    };

    setActiveConsultations(prev => [...prev, consultation]);
    setActiveTab('consultations');
  };

  const handleEndConsultation = (consultationId: string) => {
    setActiveConsultations(prev => prev.filter(c => c.id !== consultationId));
    const completedConsultation = activeConsultations.find(c => c.id === consultationId);
    if (completedConsultation) {
      setConsultationHistory(prev => [...prev, { ...completedConsultation, status: 'completed', endTime: new Date() }]);
    }
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedAppointment) {
      console.log('Adding notes for appointment:', selectedAppointment._id, notes);
    }
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const pendingAppointments = appointments.filter(appt => appt.status === 'Confirmed');
  const completedAppointments = appointments.filter(appt => appt.status === 'Completed');

  const renderAppointmentsView = () => (
    <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Pending Appointments</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">{pendingAppointments.length}</p>
            <p className="text-sm text-blue-600">Ready for consultation</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <ClipboardDocCheckIcon className="h-6 w-6 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Completed Today</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">{completedAppointments.length}</p>
            <p className="text-sm text-green-600">Successful consultations</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.length > 0 ? appointments.map((appt) => (
              <tr key={appt._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {appt.user.name}
                  {appt.patientContext !== 'SELF' && (
                    <span className="block text-xs text-gray-500">(for {appt.patientContext.toLowerCase()})</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.serviceName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(appt.slotStartTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    appt.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                    appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appt.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {appt.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => handleStartConsultation(appt)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <UserCircleIcon className="h-4 w-4 mr-1" />
                        Start Consultation
                      </button>
                      <button
                        onClick={() => console.log('Marking appointment as completed:', appt._id)}
                        className="text-green-600 hover:text-green-900 ml-2"
                      >
                        Mark Completed
                      </button>
                    </>
                  )}
                  {appt.status === 'Completed' && (
                    <button
                      onClick={() => handleOpenNotesModal(appt)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {appt.notes ? 'Edit Notes' : 'Add Notes'}
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConsultationsView = () => (
    <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Consultations</h3>

        {activeConsultations.length > 0 ? (
          <div className="space-y-4">
            {activeConsultations.map(consultation => (
              <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{consultation.patientName}</h4>
                    <p className="text-sm text-gray-600">{consultation.serviceName}</p>
                    <p className="text-xs text-gray-500">
                      Started: {consultation.startTime.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                    <button
                      onClick={() => handleEndConsultation(consultation.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      End Call
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>Context:</strong> {consultation.context}
                  </p>
                </div>
                <div className="mt-3">
                  <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600">
                    <UserCircleIcon className="h-4 w-4 inline mr-2" />
                    Join Video Call (Zoom/WhatsApp)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <UserCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active consultations</p>
            <p className="text-sm">Start consultations from the Appointments tab</p>
          </div>
        )}

        {consultationHistory.length > 0 && (
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Recent Consultations</h4>
            <div className="space-y-2">
              {consultationHistory.slice(0, 5).map(consultation => (
                <div key={consultation.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{consultation.patientName}</p>
                      <p className="text-sm text-gray-600">{consultation.serviceName}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Consultation Analytics</h3>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Consultations</p>
                <p className="text-3xl font-bold text-blue-800">{consultationHistory.length + activeConsultations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Avg. Consultation Time</p>
                <p className="text-3xl font-bold text-green-800">25 min</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CalendarDaysIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Patient Satisfaction</p>
                <p className="text-3xl font-bold text-purple-800">4.8/5</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Consultation Trends</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="text-lg font-semibold text-gray-800">12 consultations</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-lg font-semibold text-gray-800">48 consultations</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="text-lg font-semibold text-green-600">+15%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Service Breakdown</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">General Consultation</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gynecology</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mental Health</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {consultationHistory.slice(0, 5).map((consultation, index) => (
              <div key={consultation.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{consultation.patientName}</p>
                    <p className="text-sm text-gray-600">{consultation.serviceName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">Completed</p>
                  <p className="text-xs text-gray-500">
                    {consultation.endTime ? new Date(consultation.endTime).toLocaleDateString() : 'Today'}
                  </p>
                </div>
              </div>
            ))}
            {consultationHistory.length === 0 && (
              <p className="text-gray-500 text-center py-8">No consultation history available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Healthcare Provider Portal</h2>
          <p className="text-gray-600 mt-1">Manage appointments, consultations, and patient care.</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'appointments'
                  ? 'border-indigo-500 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardDocCheckIcon className="h-5 w-5" />
              <span>Appointments</span>
              {pendingAppointments.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                  {pendingAppointments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'consultations'
                  ? 'border-indigo-500 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>Active Consultations</span>
              {activeConsultations.length > 0 && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-1 animate-pulse">
                  {activeConsultations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarDaysIcon className="h-5 w-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('protocols')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'protocols'
                  ? 'border-indigo-500 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpenIcon className="h-5 w-5" />
              <span>Protocols & Training</span>
            </button>
          </nav>
        </div>

        {activeTab === 'appointments' && renderAppointmentsView()}
        {activeTab === 'consultations' && renderConsultationsView()}
        {activeTab === 'analytics' && renderAnalyticsView()}
        {activeTab === 'protocols' && <ProviderProtocolView productKnowledge={PRODUCT_KNOWLEDGE_DATA} ai={ai} />}

      </div>
      {selectedAppointment && (
        <AddNotesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNotes}
          appointment={selectedAppointment}
        />
      )}
    </>
  );
};

export default ProviderPortal;
