import React, { useState, useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('sheher_access_token');
      const expiry = localStorage.getItem('sheher_token_expiry');

      if (!token || !expiry) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (Date.now() > parseInt(expiry)) {
        localStorage.removeItem('sheher_access_token');
        localStorage.removeItem('sheher_token_expiry');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with server
      const response = await fetch('/.netlify/functions/verify-auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('sheher_access_token');
        localStorage.removeItem('sheher_token_expiry');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('sheher_access_token');
    localStorage.removeItem('sheher_token_expiry');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    checkAuthStatus,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <>{children}</>;
};
