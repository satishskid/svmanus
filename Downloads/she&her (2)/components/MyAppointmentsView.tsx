
import React, { useState } from 'react';
import { Appointment } from '../types';
import { ArrowLeftIcon, DocumentTextIcon } from './Icons';

interface MyAppointmentsViewProps {
  appointments: Appointment[];
  onBack: () => void;
}

const StatusBadge: React.FC<{ status: Appointment['status'] }> = ({ status }) => {
    const colorClasses = {
        Confirmed: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[status]}`}>{status}</span>;
};

const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({ appointments, onBack }) => {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
      <button onClick={onBack} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Chat
      </button>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">My Appointments</h2>
        <p className="text-lg text-gray-600 mt-2">A history of your appointments with Santaan.in.</p>
      </div>

      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map(appt => (
            <div key={appt._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div>
                        <p className="font-bold text-lg text-indigo-700">{appt.serviceName}</p>
                        <p className="text-sm text-gray-600">{new Date(appt.slotStartTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">For: <span className="font-semibold text-gray-700">{appt.patientContext}</span></p>
                    </div>
                    <div className="flex items-center space-x-4 self-start sm:self-center">
                        <StatusBadge status={appt.status} />
                        {appt.status === 'Completed' && appt.notes && (
                            <button onClick={() => setExpandedNoteId(expandedNoteId === appt._id ? null : appt._id)} className="flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium">
                                <DocumentTextIcon className="h-5 w-5 mr-1" />
                                {expandedNoteId === appt._id ? 'Hide Notes' : 'View Notes'}
                            </button>
                        )}
                    </div>
                </div>
                {expandedNoteId === appt._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-white p-4 rounded-md shadow-inner">
                        <h4 className="font-semibold text-gray-700 mb-2">Consultation Notes:</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{appt.notes}</p>
                    </div>
                )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">You have no appointments booked yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsView;
