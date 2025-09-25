import React, { useState, useEffect } from 'react';
import { Service, Provider, LifeStageKey } from '../types';
import { LIFE_STAGES_DATA } from '../constants';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  providers: Provider[];
  serviceToEdit: Service | null;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, onSave, providers, serviceToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'In-Clinic' | 'Telemedicine' | 'At-Home'>('In-Clinic');
  const [price, setPrice] = useState<number | ''>('');
  const [corporatePrice, setCorporatePrice] = useState<number | ''>('');
  const [providerId, setProviderId] = useState<string>('');
  const [relevantStages, setRelevantStages] = useState<Set<LifeStageKey>>(new Set());

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setDescription(serviceToEdit.description);
      setType(serviceToEdit.type);
      setPrice(serviceToEdit.price);
      setCorporatePrice(serviceToEdit.corporatePrice || '');
      setProviderId(serviceToEdit.providerId || '');
      setRelevantStages(new Set(serviceToEdit.relevantStages || []));
    } else {
        setName('');
        setDescription('');
        setType('In-Clinic');
        setPrice('');
        setCorporatePrice('');
        setProviderId('');
        setRelevantStages(new Set());
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleStageToggle = (stageKey: LifeStageKey) => {
    setRelevantStages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(stageKey)) {
            newSet.delete(stageKey);
        } else {
            newSet.add(stageKey);
        }
        return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '') return;

    const newService: Service = {
      id: serviceToEdit ? serviceToEdit.id : `serv_${Date.now()}`,
      name,
      description,
      type,
      price: Number(price),
      corporatePrice: corporatePrice !== '' ? Number(corporatePrice) : undefined,
      providerId: providerId || undefined,
      icon: serviceToEdit?.icon || (() => null), // Placeholder icon
      relevantStages: Array.from(relevantStages),
    };
    onSave(newService);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800">{serviceToEdit ? 'Edit Service' : 'Add New Service'}</h3>
        
        {/* Basic Info */}
        <input type="text" placeholder="Service Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" rows={3}></textarea>
        
        {/* Type & Provider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded bg-white">
                <option value="In-Clinic">In-Clinic</option>
                <option value="Telemedicine">Telemedicine</option>
                <option value="At-Home">At-Home</option>
            </select>
            <select value={providerId} onChange={e => setProviderId(e.target.value)} className="w-full p-2 border rounded bg-white">
                <option value="">Assign a Provider</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" placeholder="Standard Price (e.g., 3000)" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border rounded" required />
            <input type="number" placeholder="Corporate Price (optional)" value={corporatePrice} onChange={e => setCorporatePrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border rounded" />
        </div>

        {/* Relevant Stages */}
        <div>
            <h4 className="font-semibold text-gray-700 mb-2">Relevant Life Stages (optional)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LIFE_STAGES_DATA.map(stage => (
                    <label key={stage.key} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <input type="checkbox" checked={relevantStages.has(stage.key)} onChange={() => handleStageToggle(stage.key)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
                        <span className="text-sm">{stage.title}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Save Service</button>
        </div>
      </form>
    </div>
  );
};

export default AddServiceModal;
