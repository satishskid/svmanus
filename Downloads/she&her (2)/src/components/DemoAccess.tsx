import React, { useState } from 'react';

interface DemoAccessProps {
  onAccessGranted: () => void;
}

const DEMO_CODES = import.meta.env.VITE_DEMO_CODES?.split(',') || [
  'SHEHER2025',      // Main demo code
  'HEALTHCARE',      // Healthcare demo
  'ENTERPRISE',      // Enterprise demo
  'CORPORATE',       // Corporate demo
  'PROVIDER',        // Provider demo
  'MANAGER',         // Manager demo
  'HRDEMO',          // HR demo
  'USERDEMO',        // User demo
  'SATISH',          // Personal demo code
  'DEMO123',         // Simple demo code
];

const DemoAccess: React.FC<DemoAccessProps> = ({ onAccessGranted }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check if the entered code matches any of the demo codes
    if (DEMO_CODES.includes(accessCode.toUpperCase())) {
      // Store demo access in localStorage for persistence
      localStorage.setItem('sheher_demo_access', accessCode.toUpperCase());
      localStorage.setItem('sheher_demo_timestamp', Date.now().toString());

      // Grant access
      onAccessGranted();
    } else {
      setError('Invalid demo access code. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">S&H</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">She&Her</h1>
          <p className="text-gray-600">Healthcare Platform</p>
        </div>

        {/* Demo Access Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-pink-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Demo Access</h2>
            <p className="text-sm text-gray-600">
              Enter the demo access code to explore the full platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Demo Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors uppercase tracking-wider"
                placeholder="ENTER DEMO CODE"
                maxLength={20}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !accessCode.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Access Demo Platform'}
            </button>
          </form>

          {/* Demo Code Hints */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Codes (case-insensitive):</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {DEMO_CODES.slice(0, 6).map((code) => (
                <span key={code} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>She&Her Healthcare Platform - Demo Access</p>
          <p className="mt-1">For demonstration purposes only</p>
        </div>
      </div>
    </div>
  );
};

export default DemoAccess;
