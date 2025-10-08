import React, { useState } from 'react';
import { CorporatePlan, Service } from '../types';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: CorporatePlan) => void;
  services: Service[];
}

const AddPlanModal: React.FC<AddPlanModalProps> = ({ isOpen, onClose, onSave, services }) => {
  const [name, setName] = useState('');
  const [coveredServices, setCoveredServices] = useState<Set<string>>(new Set());
  const [discountedServices, setDiscountedServices] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleToggle = (serviceId: string, type: 'covered' | 'discounted') => {
    const [state, setState] = type === 'covered' ? [coveredServices, setCoveredServices] : [discountedServices, setDiscountedServices];
    const otherState = type === 'covered' ? discountedServices : coveredServices;
    
    const newSet = new Set(state);
    if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
    } else {
        newSet.add(serviceId);
        // A service can't be both covered and discounted
        otherState.delete(serviceId);
    }
    setState(newSet);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const newPlan: CorporatePlan = {
      id: `plan_${Date.now()}`,
      name,
      coveredServices: Array.from(coveredServices),
      discountedServices: Array.from(discountedServices),
    };
    onSave(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800">Add New Corporate Plan</h3>
        
        <input type="text" placeholder="Plan Name (e.g., Synergy Corp. HealthFirst)" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
        
        <div className="flex-grow overflow-y-auto border-t border-b py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {services.map(service => (
                    <div key={service.id} className="p-2 rounded-md hover:bg-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{service.name}</span>
                        <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1 cursor-pointer">
                                <input type="checkbox" checked={coveredServices.has(service.id)} onChange={() => handleToggle(service.id, 'covered')} className="form-checkbox h-4 w-4 text-green-600 rounded"/>
                                <span className="text-xs text-green-700">Cover</span>
                            </label>
                             <label className="flex items-center space-x-1 cursor-pointer">
                                <input type="checkbox" checked={discountedServices.has(service.id)} onChange={() => handleToggle(service.id, 'discounted')} className="form-checkbox h-4 w-4 text-purple-600 rounded"/>
                                <span className="text-xs text-purple-700">Discount</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-auto pt-4 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Save Plan</button>
        </div>
      </form>
    </div>
  );
};

export default AddPlanModal;
