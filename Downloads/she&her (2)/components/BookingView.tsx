
import React from 'react';
import { Service, ProviderSlot, CorporatePlan } from '../types';
import { ArrowLeftIcon, CheckBadgeIcon } from './Icons';

interface BookingViewProps {
  service: Service;
  slots: ProviderSlot[];
  onConfirmBooking: (service: Service, slot: ProviderSlot) => void;
  onBack: () => void;
  currentPlan?: CorporatePlan;
}

const BookingView: React.FC<BookingViewProps> = ({ service, slots, onConfirmBooking, onBack, currentPlan }) => {
  const availableSlots = slots.filter(slot => !slot.isBooked && slot.startTime > new Date());
  const IconComponent = service.icon;
  
  const isCovered = currentPlan?.coveredServices.includes(service.id);
  const isDiscounted = currentPlan?.discountedServices.includes(service.id) && service.corporatePrice !== undefined;
  
  let finalPrice = service.price;
  if (isCovered) finalPrice = 0;
  else if (isDiscounted) finalPrice = service.corporatePrice!;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Services
      </button>

      <div className="flex items-start space-x-4 mb-6">
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
            <IconComponent className="h-10 w-10" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{service.name}</h2>
            <p className="text-gray-600 mt-1">{service.description}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
          <p className="font-semibold text-gray-700">Your Price: <span className="text-indigo-600 font-bold text-xl ml-2">₹{finalPrice.toLocaleString()}</span></p>
          {isCovered && <p className="text-green-600 text-sm mt-1 flex items-center"><CheckBadgeIcon className="h-5 w-5 mr-1" />This service is fully covered by your corporate plan.</p>}
          {isDiscounted && <p className="text-purple-600 text-sm mt-1">Includes your corporate discount (Standard price: ₹{service.price.toLocaleString()}).</p>}
      </div>

      <h3 className="text-xl font-semibold text-gray-700 mb-4">Select an Available Slot:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {availableSlots.length > 0 ? (
            availableSlots.slice(0, 20).map(slot => (
                <button
                    key={slot.id}
                    onClick={() => onConfirmBooking(service, slot)}
                    className="p-3 text-center bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg shadow-sm border border-indigo-200 transition-all duration-200 font-medium"
                >
                    <p className="text-sm">{slot.startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="font-bold">{slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </button>
            ))
        ) : (
            <p className="text-gray-500 col-span-full text-center py-4">No available slots in the next 7 days. Please check back later.</p>
        )}
      </div>
    </div>
  );
};

export default BookingView;
