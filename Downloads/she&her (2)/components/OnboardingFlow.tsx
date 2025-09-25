
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { CorporatePlan } from '../types';
import { HeartIcon } from './Icons';
import { CORPORATE_PLANS_DATA } from '../constants';

const OnboardingFlow: React.FC = () => {
  const { user: clerkUser } = useUser();
  const createUserProfile = useMutation(api.userProfiles.createUserProfile);
  const [step, setStep] =useState(1);
  const [userType, setUserType] = useState<'DIRECT' | 'CORPORATE' | null>(null);
  const [name, setName] = useState(clerkUser?.fullName || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinishOnboarding = async (planId?: string) => {
    if (!clerkUser || !name.trim()) return;
    setIsLoading(true);
    try {
      await createUserProfile({
        name: name.trim(),
        corporatePlanId: planId,
      });
      // The app will automatically transition to MainAppView as `useQuery(api.userProfiles.getCurrentUserProfile)` will no longer be null.
    } catch (error) {
      console.error("Failed to create user profile:", error);
      alert("There was an error setting up your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUserTypeSelect = (type: 'DIRECT' | 'CORPORATE') => {
    setUserType(type);
    if (type === 'DIRECT') {
      setSelectedPlanId('');
    }
    setStep(2);
  };
  
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (userType === 'DIRECT') {
        handleFinishOnboarding();
      } else {
        setStep(3);
      }
    }
  };
  
  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFinishOnboarding(selectedPlanId === 'NONE' ? undefined : selectedPlanId);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-6">How are you joining us today?</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => handleUserTypeSelect('DIRECT')} className="w-full text-lg p-6 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105">As a Direct Consumer</button>
              <button onClick={() => handleUserTypeSelect('CORPORATE')} className="w-full text-lg p-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105">As a Corporate Employee</button>
            </div>
          </div>
        );
      case 2:
        return (
          <form onSubmit={handleNameSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Glad to have you!</h2>
            <p className="text-gray-600 mb-6">What name should Asha use to address you?</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-lg"
              required
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading} className="w-full mt-6 p-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition disabled:opacity-50">Continue</button>
          </form>
        );
      case 3:
        return (
             <form onSubmit={handlePlanSubmit}>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Corporate Wellness</h2>
                <p className="text-gray-600 mb-6">Please select your company's wellness plan to unlock your benefits.</p>
                <select 
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-lg bg-white"
                    required
                    disabled={isLoading}
                >
                    <option value="" disabled>Select your company...</option>
                    {CORPORATE_PLANS_DATA.map(plan => (
                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                     <option value="NONE">My company is not listed</option>
                </select>
                <button type="submit" disabled={isLoading} className="w-full mt-6 p-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition disabled:opacity-50">Enter the JourneyMap</button>
             </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/50">
        <div className="text-center mb-6">
            <HeartIcon className="h-12 w-12 text-pink-500 mx-auto" />
        </div>
        {renderStep()}
        <p className="text-xs text-gray-500 mt-8 text-center">
            This information helps us personalize your journey. Your privacy is our priority.
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
