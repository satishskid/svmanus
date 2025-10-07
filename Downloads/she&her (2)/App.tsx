import React, { useState, useEffect } from 'react';

import WelcomePage from './components/WelcomePage';
import OnboardingFlow from './components/OnboardingFlow';
import MainAppView from './components/MainAppView';
import ApiKeyModal from './components/ApiKeyModal';
import SecureAuth from './components/SecureAuth';
import DemoAccess from './components/DemoAccess';
import { FullPageSpinner } from './components/LoadingSpinner';
import { LoginForm, SignupForm } from './components/AuthForms';
import { DemoSeeder } from './components/DemoSeeder';
import { useAuth } from './components/AuthContext';
import { api } from 'convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [showDemoSeeder, setShowDemoSeeder] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Use Convex authentication for registered users
  const getCurrentUserProfile = useQuery(api.userProfiles.getCurrentUserProfile);
  const signInWithPassword = useMutation(api.auth.signInWithPassword);
  const signUpWithPassword = useMutation(api.auth.signUpWithPassword);
  const createUserProfile = useMutation(api.userProfiles.createUserProfile);

  useEffect(() => {
    if (isAuthenticated && getCurrentUserProfile) {
      setCurrentUser(getCurrentUserProfile);
    }
  }, [isAuthenticated, getCurrentUserProfile]);

  const handleSecureAuthGranted = () => {
    // Authentication is handled by useAuth hook
    // This function is called when secure auth succeeds
  };

  const handleDemoAccessGranted = () => {
    // Keep demo access for backward compatibility during transition
    setDemoMode(true);
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithPassword({ email, password });
      // Reload to get updated auth state
      window.location.reload();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      await signUpWithPassword({ email, password });
      await createUserProfile({ name });
      // Reload to get updated auth state
      window.location.reload();
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      logout(); // Use the logout from useAuth hook
      // Also clear any demo-related storage
      localStorage.removeItem('demo-auth');
      localStorage.removeItem('sheher_demo_access');
      localStorage.removeItem('sheher_demo_timestamp');
      // Reload to get updated auth state
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  // Show secure auth screen if not authenticated and not in demo mode
  if (!isAuthenticated && !demoMode) {
    return <SecureAuth onAccessGranted={handleSecureAuthGranted} />;
  }

  // Demo mode for testing without database
  if (demoMode) {
    return (
      <>
        <DemoApp />
        {showDemoSeeder && <DemoSeeder onClose={() => setShowDemoSeeder(false)} />}
      </>
    );
  }

  if (isAuthenticated && currentUser) {
    return (
      <>
        <AuthenticatedApp
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
        {showDemoSeeder && <DemoSeeder onClose={() => setShowDemoSeeder(false)} />}
      </>
    );
  }

  return (
    <UnauthenticatedApp
      onShowDemo={() => setShowDemoSeeder(true)}
      onEnableDemo={() => setDemoMode(true)}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
    />
  );
};

// Demo app component for testing without database
const DemoApp: React.FC = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const demoUser = {
    _id: "demo-user",
    _creationTime: Date.now(),
    name: "Demo User",
    userId: "demo-user",
    role: "USER" as const,
    corporatePlanId: undefined,
    clerkId: "demo-clerk-id",
  };

  const handleSignOut = async () => {
    localStorage.removeItem('demo-auth');
    localStorage.removeItem('sheher_demo_access');
    localStorage.removeItem('sheher_demo_timestamp');
    window.location.reload();
  };

  return (
    <>
      <MainAppView
        currentUser={demoUser}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onSignOut={handleSignOut}
      />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />

      {/* Demo Access Indicator */}
      <div className="fixed top-4 left-4 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium shadow-lg z-50">
        🎭 Demo Access Granted
      </div>
    </>
  );
};

interface UnauthenticatedAppProps {
  onShowDemo: () => void;
  onEnableDemo: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
}

const UnauthenticatedApp: React.FC<UnauthenticatedAppProps> = ({ onShowDemo, onEnableDemo, onSignIn, onSignUp }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onShowDemo}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Demo Data
        </button>
      </div>

      {authMode === 'login' ? (
        <LoginForm
          onToggleMode={() => setAuthMode('signup')}
          onSuccess={(email: string, password: string) => onSignIn(email, password)}
        />
      ) : (
        <SignupForm
          onToggleMode={() => setAuthMode('login')}
          onSuccess={(email: string, password: string, name: string) => onSignUp(email, password, name)}
        />
      )}
    </div>
  );
};

interface AuthenticatedAppProps {
  currentUser: any;
  onSignOut: () => Promise<void>;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ currentUser, onSignOut }) => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <>
      <MainAppView
        currentUser={currentUser}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onSignOut={onSignOut}
      />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
    </>
  );
};

export default App;
