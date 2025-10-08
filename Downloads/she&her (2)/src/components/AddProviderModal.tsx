import React, { useState } from 'react';
import { Provider } from '../types';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: Provider) => void;
}

const AddProviderModal: React.FC<AddProviderModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newProvider: Provider = {
      id: `prov_${Date.now()}`,
      name,
    };
    onSave(newProvider);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800">Add New Provider</h3>
        
        <input type="text" placeholder="Provider Name (e.g., Santaan.in @ Mumbai)" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
        
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Save Provider</button>
        </div>
      </form>
    </div>
  );
};

export default AddProviderModal;
