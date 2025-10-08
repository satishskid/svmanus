import React from 'react';
import { Service, User, CorporatePlan, LifeStageKey } from '../types';
import { ArrowLeftIcon } from './Icons';
import ServiceCard from './ServiceCard';

interface ServicesViewProps {
  onSelectService: (service: Service) => void;
  onBack: () => void;
  currentUser: User;
  currentPlan?: CorporatePlan;
  currentStageKey: LifeStageKey | null;
  allServices: Service[];
}

const ServicesView: React.FC<ServicesViewProps> = ({ onSelectService, onBack, currentUser, currentPlan, currentStageKey, allServices }) => {
  
  const filteredServices = allServices.filter(service => {
    // If no stage is selected, or if a service has no specific stages, show it.
    if (!currentStageKey || !service.relevantStages || service.relevantStages.length === 0) {
      return true;
    }
    // Otherwise, only show services relevant to the current life stage.
    return service.relevantStages.includes(currentStageKey);
  });
  
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Chat
      </button>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Book In-Clinic & Telemedicine Services</h2>
        <p className="text-lg text-gray-600 mt-2">
          Select a service to book an appointment with our trusted partners.
        </p>
         {filteredServices.length !== allServices.length && (
            <p className="text-sm text-gray-500 mt-2 italic">
                Showing services relevant to the selected life stage.
            </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filteredServices.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onSelectService={onSelectService}
            currentPlan={currentPlan}
          />
        ))}
        {filteredServices.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-8">
                There are no specific services recommended for this stage. Please contact support for more options.
            </p>
        )}
      </div>
    </div>
  );
};

export default ServicesView;
