import React, { useState } from 'react';
// import MetaPrompts from './MetaPrompts'; // Temporarily commented out due to import error

interface SecureAuthProps {
  onAccessGranted: () => void;
}

const SecureAuth: React.FC<SecureAuthProps> = ({ onAccessGranted }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('');

  // Get client IP address (for IP whitelisting if needed)
  React.useEffect(() => {
    const getIP = async () => {
      try {
        // Try multiple methods to get IP address without service worker issues
        const methods = [
          // Method 1: Try our own API endpoint first
          () => fetch('/api/ip', {
            method: 'GET',
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          }),
          // Method 2: Try direct API call with cache busting
          () => fetch(`https://api.ipify.org/?format=json&_t=${Date.now()}`, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          }),
          // Method 3: Try alternative IP service
          () => fetch(`https://api.ip.sb/ip`, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          })
        ];

        for (const method of methods) {
          try {
            const response = await method();
            if (response.ok) {
              const data = await response.json();
              const ip = data.ip || 'unknown';
              setIpAddress(ip);
              return; // Success, exit the loop
            }
          } catch (err) {
            // Try next method
            continue;
          }
        }

        // If all methods fail, set unknown
        console.log('Could not get IP address from any service');
        setIpAddress('unknown');
      } catch (err) {
        console.log('Could not get IP address - all methods failed');
        setIpAddress('unknown');
      }
    };

    // Delay IP detection to avoid service worker conflicts
    const timer = setTimeout(getIP, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if running locally (no Netlify functions available)
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isLocal) {
        // Local development mode - accept password "SheHerSecure2025!" or any password for testing
        if (password === 'SheHerSecure2025!' || password.length > 0) {
          console.log('Local development mode - granting access');
          // Store a mock token for local development
          localStorage.setItem('sheher_access_token', 'local-dev-token');
          localStorage.setItem('sheher_token_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
          onAccessGranted();
          return;
        } else {
          setError('Please enter the correct password');
          return;
        }
      }

      // Production mode - use Netlify functions
      const response = await fetch('/.netlify/functions/auth-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          ip: ipAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store access token in localStorage
        localStorage.setItem('sheher_access_token', data.accessToken);
        localStorage.setItem('sheher_token_expiry', data.expiresAt.toString());

        onAccessGranted();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);

      // For local development, allow access with any password if Netlify functions fail
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Local development mode - granting access due to network error');
        localStorage.setItem('sheher_access_token', 'local-dev-token');
        localStorage.setItem('sheher_token_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        onAccessGranted();
        return;
      }

      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
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

        {/* Secure Access Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-pink-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure Access</h2>
            <p className="text-sm text-gray-600">
              Enter the secure password to access the platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                placeholder="Enter secure password"
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
              disabled={isLoading || !password.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Access Platform'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔒 This platform is protected by secure authentication
            </p>
            {ipAddress && (
              <p className="text-xs text-gray-400 text-center mt-1">
                Your IP: {ipAddress}
              </p>
            )}
          </div>

          {/* Common Questions Help - Temporarily disabled */}
          {/* <div className="mt-4">
            <MetaPrompts context="auth" />
          </div> */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>She&Her Healthcare Platform - Secure Access</p>
          <p className="mt-1">Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};

export default SecureAuth;
