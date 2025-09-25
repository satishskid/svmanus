import React, { useState, useEffect } from 'react';

import WelcomePage from './components/WelcomePage';
import OnboardingFlow from './components/OnboardingFlow';
import MainAppView from './components/MainAppView';
import ApiKeyModal from './components/ApiKeyModal';
import { FullPageSpinner } from './components/LoadingSpinner';
import { LoginForm, SignupForm } from './components/AuthForms';
import { DemoSeeder } from './components/DemoSeeder';

const App: React.FC = () => {
  const [showDemoSeeder, setShowDemoSeeder] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for demo authentication in localStorage
    const demoAuth = localStorage.getItem('demo-auth');
    if (demoAuth) {
      const userData = JSON.parse(demoAuth);
      setIsAuthenticated(true);
      setCurrentUser({
        _id: "demo-user",
        _creationTime: Date.now(),
        name: userData.name,
        userId: userData.email,
        role: "USER" as const,
        corporatePlanId: undefined,
        clerkId: "demo-clerk-id",
      });
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  // For now, let's use demo mode to bypass the authentication issues
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
        <AuthenticatedApp currentUser={currentUser} />
        {showDemoSeeder && <DemoSeeder onClose={() => setShowDemoSeeder(false)} />}
      </>
    );
  }

  return <UnauthenticatedApp onShowDemo={() => setShowDemoSeeder(true)} onEnableDemo={() => setDemoMode(true)} />;
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

  return (
    <>
      <MainAppView
        currentUser={demoUser}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
    </>
  );
};

interface UnauthenticatedAppProps {
  onShowDemo: () => void;
  onEnableDemo: () => void;
}

const UnauthenticatedApp: React.FC<UnauthenticatedAppProps> = ({ onShowDemo, onEnableDemo }) => {
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
          onSuccess={() => window.location.reload()}
        />
      ) : (
        <SignupForm
          onToggleMode={() => setAuthMode('login')}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};

interface AuthenticatedAppProps {
  currentUser: any;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ currentUser }) => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <>
      <MainAppView
        currentUser={currentUser}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
    </>
  );
};

export default App;
