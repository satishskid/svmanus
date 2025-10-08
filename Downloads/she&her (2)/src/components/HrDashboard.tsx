
import React from 'react';
import { Appointment } from '../types';
import { UsersIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, BanknotesIcon } from './Icons';

interface HrDashboardProps {
  userCount: number;
  sessionCount: number;
  appointments: Appointment[];
}

const StatCard: React.FC<{ icon: React.FC<any>, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const HrDashboard: React.FC<HrDashboardProps> = ({ userCount, sessionCount, appointments }) => {
  const serviceCounts = appointments.reduce((acc, appt) => {
    acc[appt.serviceName] = (acc[appt.serviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedServices = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a);

  const totalWellnessInvestment = appointments.reduce((total, appt) => {
      // In a real DB-driven app, appt.service would be populated.
      // Here we rely on pricePaid being calculated correctly on booking.
      return total + appt.pricePaid; 
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">HR Wellness Dashboard</h2>
        <p className="text-gray-600 mt-1">An overview of your employees' engagement with She&Her.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={UsersIcon} title="Active Users" value={userCount} color="bg-blue-500" />
        <StatCard icon={ChatBubbleLeftRightIcon} title="Total AI Sessions" value={sessionCount} color="bg-purple-500" />
        <StatCard icon={CalendarDaysIcon} title="Appointments Booked" value={appointments.length} color="bg-green-500" />
        <StatCard 
            icon={BanknotesIcon} 
            title="Total Wellness Investment" 
            value={`₹${totalWellnessInvestment.toLocaleString()}`} 
            color="bg-pink-500" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Booked Services</h3>
        {sortedServices.length > 0 ? (
          <ul className="space-y-3">
            {sortedServices.map(([name, count]) => (
              <li key={name} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <p className="font-medium text-gray-700">{name}</p>
                <p className="font-bold text-lg text-indigo-600">{count}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">No appointments have been booked yet.</p>
        )}
      </div>
    </div>
  );
};

export default HrDashboard;
