import React, { useState, useEffect } from 'react';
import { GEMINI_MODEL_NAME } from '../constants';
import { KeyIcon } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(storedKey);
      setSaveStatus('IDLE');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setSaveStatus('SUCCESS');
    setTimeout(() => {
        onClose();
        window.location.reload(); // Reload to re-initialize the AI session with the new key
    }, 1500); 
  };
  
  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center space-x-3 mb-4">
          <KeyIcon className="h-8 w-8 text-indigo-500" />
          <h3 className="text-2xl font-bold text-gray-800">AI Settings</h3>
        </div>
        
        <div className="text-sm text-gray-600 bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
            <p className="font-semibold mb-1">Bring Your Own Key (BYOK)</p>
            <p>For maximum privacy and to use your own free-tier quota from Google, you can provide your personal Gemini API key. Your key is saved securely in your browser and never sent to our servers.</p>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium mt-2 inline-block">
              Get your API Key from Google AI Studio &rarr;
            </a>
        </div>
        
        <div className="mt-6 space-y-4">
            <div>
                <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-1">Your Gemini API Key</label>
                <input
                    id="api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your API key here"
                />
            </div>
             <div>
                <label htmlFor="model-display" className="block text-sm font-medium text-gray-700 mb-1">Chat Model</label>
                 <input
                    id="model-display"
                    type="text"
                    value={GEMINI_MODEL_NAME}
                    readOnly
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Using the recommended model for optimal performance.</p>
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
           <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium transition"
          >
            Clear and Use Guest Mode
          </button>
          <div className="flex items-center space-x-3">
             <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`px-5 py-2 text-white rounded-md font-semibold transition-colors w-28 ${
                    saveStatus === 'SUCCESS' ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {saveStatus === 'SUCCESS' ? 'Saved!' : 'Save'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
