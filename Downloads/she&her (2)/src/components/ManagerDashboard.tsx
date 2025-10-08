
import React, { useState } from 'react';
import { Service, Provider, CorporatePlan, ProductKnowledge } from '../types';
import { ESCALATION_MATRIX_DATA, GUIDING_PRINCIPLES_DATA, SERVICES_DATA, PROVIDERS_DATA, CORPORATE_PLANS_DATA, PRODUCT_KNOWLEDGE_DATA } from '../constants';
import UserManagement from './UserManagement';

const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'products' | 'providers' | 'plans' | 'oversight' | 'users'>('services');
  const [showUserManagement, setShowUserManagement] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Platform Services</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {SERVICES_DATA.map(service => (
                        <li key={service.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{service.name}</p>
                                <p className="text-sm text-gray-500">Price: ₹{service.price} | Corp: ₹{service.corporatePrice || 'N/A'}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        );
      case 'products':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Product Knowledge Base</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {PRODUCT_KNOWLEDGE_DATA.map(product => (
                        <li key={product.id} className="p-4">
                            <div>
                                <p className="font-semibold text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        );
      case 'providers':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Network Providers</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {PROVIDERS_DATA.map(provider => (
                        <li key={provider.id} className="p-4">
                           <p className="font-semibold text-gray-800">{provider.name}</p>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        );
      case 'plans':
        return (
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Corporate Plans</h3>
                 <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {CORPORATE_PLANS_DATA.map(plan => (
                            <li key={plan.id} className="p-4">
                               <p className="font-semibold text-gray-800">{plan.name}</p>
                               <p className="text-sm text-gray-500">Covered: {plan.coveredServices.length} services | Discounted: {plan.discountedServices.length} services</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
      case 'users':
        return showUserManagement ? (
          <UserManagement onClose={() => setShowUserManagement(false)} />
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">User Management</h3>
              <p className="text-gray-600 mb-6">Create and manage user accounts, roles, and permissions</p>
              <button
                onClick={() => setShowUserManagement(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Open User Management
              </button>
            </div>
          </div>
        );
      case 'oversight':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Platform Governance & Safety</h3>
            <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Guiding & Safety Principles</h4>
                <div className="text-sm text-gray-700 space-y-4 whitespace-pre-wrap font-sans">{GUIDING_PRINCIPLES_DATA}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Escalation Matrix</h4>
                <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-600 whitespace-pre-wrap font-sans">{ESCALATION_MATRIX_DATA}</pre>
            </div>
        </div>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabId: typeof activeTab, children: React.ReactNode }> = ({ tabId, children }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tabId ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
      {children}
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Manager Dashboard</h2>
        <p className="text-gray-600 mt-1">Platform administration and oversight. (Data is read-only in this demo)</p>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <TabButton tabId="services">Services</TabButton>
          <TabButton tabId="products">Products</TabButton>
          <TabButton tabId="providers">Providers</TabButton>
          <TabButton tabId="plans">Corporate Plans</TabButton>
          <TabButton tabId="users">Users</TabButton>
          <TabButton tabId="oversight">Oversight</TabButton>
        </nav>
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default ManagerDashboard;
