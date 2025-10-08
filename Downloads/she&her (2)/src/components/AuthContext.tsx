import React, { useState, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, expiry: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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

      // Check if this is a local development token
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isLocal && token === 'local-dev-token') {
        // Accept local development tokens without server verification
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // For production tokens, verify with server
      try {
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
        // For local development, if server verification fails, accept the token
        if (isLocal) {
          setIsAuthenticated(true);
        } else {
          console.error('Token verification failed:', error);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  };

  const login = (token: string, expiry: string) => {
    localStorage.setItem('sheher_access_token', token);
    localStorage.setItem('sheher_token_expiry', expiry);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('sheher_access_token');
    localStorage.removeItem('sheher_token_expiry');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout,
      checkAuthStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
