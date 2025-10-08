import React from 'react';
import { Stage, Concern } from '../types';
import ConcernButton from './ConcernButton';
import { ArrowLeftIcon, CheckCircleIcon } from './Icons';

interface StageDetailsProps {
  stage: Stage;
  onSelectConcern: (concern: Concern) => void;
  onBack: () => void;
  lastBookedServiceInfo: { serviceName: string, slotTime: Date } | null;
}

const StageDetails: React.FC<StageDetailsProps> = ({ stage, onSelectConcern, onBack, lastBookedServiceInfo }) => {
  const IconComponent = stage.icon;
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Stages
      </button>

      {lastBookedServiceInfo && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow" role="alert">
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 mr-3 text-green-600"/>
            <div>
              <p className="font-bold">Appointment Confirmed!</p>
              <p>Your appointment for "{lastBookedServiceInfo.serviceName}" is booked for {lastBookedServiceInfo.slotTime.toLocaleString()}. You can view details in "My Appointments".</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center mb-6 md:mb-8">
        <div className={`p-3 rounded-lg ${stage.color} text-white mr-0 md:mr-6 mb-4 md:mb-0`}>
          <IconComponent className="h-12 w-12" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${stage.color.replace('bg-', 'text-')}`}>{stage.title}</h2>
          <p className="text-gray-600 mt-1">{stage.description}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg mb-8 shadow-inner border border-gray-200">
        <p className="text-gray-700 font-serif leading-relaxed text-base italic">
          {stage.richDescription}
        </p>
      </div>

      <h3 className="text-xl font-semibold text-gray-700 mb-4">Common Concerns & Topics:</h3>
      <p className="text-gray-600 mb-6">
        Select a concern below to learn more or ask questions. Asha, our AI assistant, is here to provide information and support.
      </p>
      <div className="space-y-3">
        {stage.concerns.map((concern) => (
          <ConcernButton 
            key={concern.id} 
            concern={concern} 
            onClick={() => onSelectConcern(concern)}
            color={stage.color}
          />
        ))}
      </div>
    </div>
  );
};

export default StageDetails;