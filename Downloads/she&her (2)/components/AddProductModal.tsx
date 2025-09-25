import React, { useState, useEffect } from 'react';
import { ProductKnowledge } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductKnowledge) => void;
  productToEdit: ProductKnowledge | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [staffTrainingInfo, setStaffTrainingInfo] = useState('');
  const [patientFacingInfo, setPatientFacingInfo] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setStaffTrainingInfo(productToEdit.staffTrainingInfo);
      setPatientFacingInfo(productToEdit.patientFacingInfo);
    } else {
        setName('');
        setDescription('');
        setStaffTrainingInfo('');
        setPatientFacingInfo('');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !staffTrainingInfo || !patientFacingInfo) {
        alert("Please fill all fields.");
        return;
    };

    const newProduct: ProductKnowledge = {
      id: productToEdit ? productToEdit.id : `prod_${Date.now()}`,
      name,
      description,
      staffTrainingInfo,
      patientFacingInfo,
    };
    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800">{productToEdit ? 'Edit Product Knowledge' : 'Add New Product'}</h3>
        
        <input type="text" placeholder="Product Name (e.g., Niramai)" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Short Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" required />

        <div>
            <label htmlFor="staff-info" className="block text-sm font-medium text-gray-700 mb-1">Staff Training Information</label>
            <textarea id="staff-info" placeholder="Detailed info for provider staff..." value={staffTrainingInfo} onChange={e => setStaffTrainingInfo(e.target.value)} className="w-full p-2 border rounded" rows={8} required></textarea>
        </div>
        
        <div>
            <label htmlFor="patient-info" className="block text-sm font-medium text-gray-700 mb-1">Patient-Facing Information</label>
            <textarea id="patient-info" placeholder="Simplified info for Asha to use with patients..." value={patientFacingInfo} onChange={e => setPatientFacingInfo(e.target.value)} className="w-full p-2 border rounded" rows={4} required></textarea>
        </div>


        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Save Product</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal;