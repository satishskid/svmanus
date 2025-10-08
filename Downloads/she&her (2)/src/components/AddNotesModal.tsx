
import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';

interface AddNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  appointment: Appointment;
}

const AddNotesModal: React.FC<AddNotesModalProps> = ({ isOpen, onClose, onSave, appointment }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
    }
  }, [appointment]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Consultation Notes</h3>
        <p className="text-sm text-gray-600 mb-4">
          {/* Fix: Use `new Date(appointment.slotStartTime)` to correctly access and format the date from the timestamp. */}
          For: <strong>{appointment.user.name}</strong> regarding <strong>{appointment.service.name}</strong> on {new Date(appointment.slotStartTime).toLocaleDateString()}
        </p>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          placeholder="Enter consultation summary, findings, and next steps..."
        />

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNotesModal;
