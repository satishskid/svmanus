import React from 'react';
import { Service, CorporatePlan } from '../types';
import { CalendarDaysIcon, CheckBadgeIcon } from './Icons';

interface ServiceCardProps {
  service: Service;
  onSelectService: (service: Service) => void;
  currentPlan?: CorporatePlan;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelectService, currentPlan }) => {
  const IconComponent = service.icon;

  const typeColorClasses = {
    'In-Clinic': 'bg-blue-100 text-blue-800',
    'Telemedicine': 'bg-purple-100 text-purple-800',
    'At-Home': 'bg-green-100 text-green-800',
  };

  const isCovered = currentPlan?.coveredServices.includes(service.id);
  const isDiscounted = currentPlan?.discountedServices.includes(service.id) && service.corporatePrice !== undefined;
  
  const renderPrice = () => {
    if (isCovered) {
      return (
        <div className="flex items-center space-x-2">
           <p className="text-lg font-bold text-green-600">Covered by Plan</p>
           <CheckBadgeIcon className="h-6 w-6 text-green-600" />
        </div>
      );
    }
    if (isDiscounted) {
      return (
         <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">₹{service.corporatePrice?.toLocaleString()}</p>
            <p className="text-sm text-gray-500 line-through">₹{service.price.toLocaleString()}</p>
        </div>
      );
    }
    return <p className="text-lg font-bold text-gray-800">₹{service.price.toLocaleString()}</p>;
  }

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <IconComponent className="h-8 w-8" />
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColorClasses[service.type]}`}>{service.type}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{service.name}</h3>
        <p className="text-sm text-gray-600 flex-grow">{service.description}</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-b-xl mt-auto border-t">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-600">Price:</p>
          {renderPrice()}
        </div>
        <button
          onClick={() => onSelectService(service)}
          className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
          aria-label={`Book appointment for ${service.name}`}
        >
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;