import React, { useState, useEffect } from 'react';

import WelcomePage from './components/WelcomePage';
import OnboardingFlow from './components/OnboardingFlow';
import MainAppView from './components/MainAppView';
import ApiKeyModal from './components/ApiKeyModal';
import { FullPageSpinner } from './components/LoadingSpinner';
import { LoginForm, SignupForm } from './components/AuthForms';
import { DemoSeeder } from './components/DemoSeeder';
import { api } from 'convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';

const App: React.FC = () => {
  const [showDemoSeeder, setShowDemoSeeder] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use Convex authentication
  const getCurrentUserProfile = useQuery(api.userProfiles.getCurrentUserProfile);
  const signInWithPassword = useMutation(api.auth.signInWithPassword);
  const signUpWithPassword = useMutation(api.auth.signUpWithPassword);
  const createUserProfile = useMutation(api.userProfiles.createUserProfile);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const userProfile = getCurrentUserProfile;
        if (userProfile) {
          setIsAuthenticated(true);
          setCurrentUser(userProfile);
        }
      } catch (error) {
        console.log('Not authenticated');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [getCurrentUserProfile]);

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
      // Clear local storage and reload
      localStorage.removeItem('demo-auth');
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading) {
    return <FullPageSpinner />;
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
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={onShowDemo}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Demo Data
        </button>
        <button
          onClick={onEnableDemo}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Demo Mode
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
