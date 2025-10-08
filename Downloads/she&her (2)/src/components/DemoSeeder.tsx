import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { SheHerLogo, SparklesIcon } from './Icons';

interface DemoSeederProps {
  onClose: () => void;
}

export const DemoSeeder: React.FC<DemoSeederProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const seedDemoData = useMutation(api.demoData.seedDemoData);
  const clearDemoData = useMutation(api.demoData.clearDemoData);

  const handleSeedData = async () => {
    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const result = await seedDemoData();
      setMessage(`✅ ${result.message} Created ${result.users} users, ${result.appointments} appointments, and ${result.messages} messages.`);
      setIsSuccess(true);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const result = await clearDemoData();
      setMessage(`🗑️ ${result.message} Deleted ${result.deletedUsers} users, ${result.deletedAppointments} appointments, and ${result.deletedMessages} messages.`);
      setIsSuccess(true);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/50">
        <div className="flex justify-center items-center gap-4 mb-6">
          <SheHerLogo className="h-12 w-12 text-pink-500" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">
            Demo Data
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          Seed Database with Demo Data
        </h2>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Demo Accounts Created:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>Sarah Johnson</strong> - Regular User (USER)</li>
              <li><strong>Dr. Emily Chen</strong> - Healthcare Provider (PROVIDER)</li>
              <li><strong>HR Manager</strong> - HR Representative (HR)</li>
              <li><strong>System Admin</strong> - System Administrator (MANAGER)</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Demo Data Includes:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ Sample appointments with different statuses</li>
              <li>✅ Consultation messages between users and providers</li>
              <li>✅ Corporate wellness programs</li>
              <li>✅ Various patient contexts (self, daughter, mother)</li>
            </ul>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            isSuccess
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSeedData}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Seeding...' : 'Seed Demo Data'}
          </button>

          <button
            onClick={handleClearData}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Clearing...' : 'Clear Data'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
