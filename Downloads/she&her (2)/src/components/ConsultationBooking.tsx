import React, { useState, useMemo } from 'react';
import { Service, ProviderSlot, CorporatePlan, ChatMessage, Concern, Stage } from '../types';
import { ArrowLeftIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon, UserIcon } from './Icons';

interface ConsultationBookingProps {
  concern: Concern;
  stage: Stage;
  chatMessages: ChatMessage[];
  availableServices: Service[];
  slots: ProviderSlot[];
  onConfirmBooking: (service: Service, slot: ProviderSlot, consultSummary: string) => void;
  onBack: () => void;
  currentPlan?: CorporatePlan;
}

const ConsultationBooking: React.FC<ConsultationBookingProps> = ({
  concern,
  stage,
  chatMessages,
  availableServices,
  slots,
  onConfirmBooking,
  onBack,
  currentPlan
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ProviderSlot | null>(null);

  // Generate pre-consult summary from conversation
  const consultSummary = useMemo(() => {
    const userMessages = chatMessages.filter(msg => msg.sender === 'user');
    const lastFewMessages = userMessages.slice(-3); // Last 3 user messages for context

    return `Patient Concern: ${concern.text}

Conversation Context:
${lastFewMessages.map(msg => `User: ${msg.text}`).join('\n')}

Life Stage: ${stage.title}
Category: ${concern.details || 'General health concern'}

This consultation request stems from an ongoing conversation about ${concern.text}. The patient has been discussing their concerns with our AI assistant and now seeks professional medical guidance.`;
  }, [chatMessages, concern, stage]);

  const relevantServices = availableServices.filter(service =>
    service.relevantStages.some(serviceStage =>
      serviceStage === stage.key
    )
  );

  const availableSlots = slots.filter(slot =>
    !slot.isBooked &&
    slot.startTime > new Date()
    // For now, show all available slots - in a real app, this would filter by provider
  );

  const isCovered = selectedService && currentPlan?.coveredServices.includes(selectedService.id);
  const isDiscounted = selectedService && currentPlan?.discountedServices.includes(selectedService.id) && selectedService.corporatePrice !== undefined;

  let finalPrice = selectedService?.price || 0;
  if (isCovered) finalPrice = 0;
  else if (isDiscounted) finalPrice = selectedService!.corporatePrice!;

  const handleConfirmBooking = () => {
    if (selectedService && selectedSlot) {
      onConfirmBooking(selectedService, selectedSlot, consultSummary);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Chat
      </button>

      {/* Conversation Context Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-3">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Consultation Context</h3>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>Concern:</strong> {concern.text}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Life Stage:</strong> {stage.title}
          </p>
          {chatMessages.filter(msg => msg.sender === 'user').length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Conversation Summary:</strong> Based on your discussion with Asha about {concern.text}
            </p>
          )}
        </div>
        <p className="text-xs text-blue-600 mt-3 flex items-center">
          <UserIcon className="h-4 w-4 mr-1" />
          This context will be shared with your healthcare provider for continuity of care
        </p>
      </div>

      <div className="flex items-start space-x-4 mb-6">
        <div className={`p-3 rounded-full ${stage.color} text-white`}>
            {React.createElement(stage.icon, { className: "h-10 w-10" })}
        </div>
        <div>
            <h2 className={`text-2xl font-bold ${stage.color.replace('bg-', 'text-')}`}>
              Book Consultation: {concern.text}
            </h2>
            <p className="text-gray-600 mt-1">
              Continue your conversation with a healthcare professional
            </p>
        </div>
      </div>

      {/* Service Selection */}
      {!selectedService ? (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Choose a Consultation Service
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantServices.map(service => {
              const servicePrice = currentPlan?.coveredServices.includes(service.id) ? 0 :
                                 currentPlan?.discountedServices.includes(service.id) ? service.corporatePrice || service.price :
                                 service.price;

              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all text-left bg-white"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                      {React.createElement(service.icon, { className: "h-6 w-6" })}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-800">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-indigo-600">₹{servicePrice.toLocaleString()}</span>
                        {currentPlan?.coveredServices.includes(service.id) && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Covered
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Selected Service Info */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-full ${stage.color} text-white`}>
                {React.createElement(selectedService.icon, { className: "h-6 w-6" })}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{selectedService.name}</h4>
                <p className="text-sm text-gray-600">{selectedService.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-700">
                  Your Price: <span className="text-indigo-600 font-bold text-xl ml-2">₹{finalPrice.toLocaleString()}</span>
                </p>
                {isCovered && <p className="text-green-600 text-sm mt-1 flex items-center"><CheckBadgeIcon className="h-4 w-4 mr-1" />Fully covered by your corporate plan.</p>}
                {isDiscounted && <p className="text-purple-600 text-sm mt-1">Includes corporate discount.</p>}
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Change Service
              </button>
            </div>
          </div>

          {/* Time Slot Selection */}
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Select Consultation Time</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {availableSlots.length > 0 ? (
              availableSlots.slice(0, 20).map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 text-center rounded-lg shadow-sm border transition-all duration-200 font-medium ${
                    selectedSlot?.id === slot.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}
                >
                  <p className="text-sm">{slot.startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="font-bold">{slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </button>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-4">No available slots for this service. Please select a different service or try again later.</p>
            )}
          </div>

          {/* Booking Confirmation */}
          {selectedSlot && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Ready to Book?</h4>
              <p className="text-sm text-gray-600 mb-4">
                You'll have a {selectedService.type.toLowerCase()} consultation with our healthcare provider.
                Your conversation context will be shared for personalized care.
              </p>
              <button
                onClick={handleConfirmBooking}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Confirm Consultation Booking
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Your conversation context will be securely shared with your healthcare provider
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConsultationBooking;
