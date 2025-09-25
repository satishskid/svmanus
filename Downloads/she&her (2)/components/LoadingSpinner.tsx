
import React from 'react';
import { SheHerLogo } from './Icons';

export const FullPageSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <SheHerLogo className="h-20 w-20 text-pink-500 animate-pulse" />
        <p className="text-gray-600 mt-4">Loading Your Journey...</p>
    </div>
  );
};
