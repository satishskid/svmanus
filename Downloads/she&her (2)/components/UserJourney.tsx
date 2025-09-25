

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { LifeStageKey, Service, Concern, ChatMessage, UserJourneyState, CorporatePlan, User, ProviderSlot, Appointment, PatientContext, ProductKnowledge } from '../types';
import { LIFE_STAGES_DATA, SYSTEM_INSTRUCTION_BASE, GEMINI_MODEL_NAME, SERVICES_DATA, PRODUCT_KNOWLEDGE_DATA } from '../constants';
import StageSelector from './StageSelector';
import StageDetails from './StageDetails';
import ChatInterface from './ChatInterface';
import ServicesView from './ServicesView';
import BookingView from './BookingView';
import MyAppointmentsView from './MyAppointmentsView';

interface UserJourneyProps {
  currentUser: User;
  currentPlan?: CorporatePlan;
  providerSlots: ProviderSlot[];
  userAppointments: Appointment[];
  patientContext: PatientContext;
}

const UserJourney: React.FC<UserJourneyProps> = (props) => {
  const { currentUser, currentPlan, providerSlots, userAppointments, patientContext } = props;
  const bookAppointment = useMutation(api.appointments.bookAppointment);

  const [appState, setAppState] = useState<UserJourneyState>({
    currentStageKey: null,
    selectedConcern: null,
    chatMessages: [],
    isLoading: false,
    chatSession: null,
    error: null,
    view: 'stages',
    lastBookedServiceInfo: null,
    serviceToBook: null,
  });

  useEffect(() => {
    // Fix: Cast import.meta to any to resolve TypeScript error.
    const userApiKey = localStorage.getItem('gemini_api_key');
    const fallbackKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!fallbackKey && !userApiKey) {
      setAppState(prev => ({ ...prev, error: "AI functionality is disabled. Please provide an API Key in settings (key icon in the header)." }));
    }
  }, []);
  
  // Reset view when user or context changes
  useEffect(() => {
    setAppState(prev => ({
      ...prev, // Keep error state
      currentStageKey: null,
      selectedConcern: null,
      chatMessages: [],
      isLoading: false,
      chatSession: null,
      view: 'stages',
      lastBookedServiceInfo: null,
      serviceToBook: null,
    }));
  }, [currentUser, patientContext]);

  const handleSelectStage = useCallback((stageKey: LifeStageKey) => {
    setAppState(prev => ({
      ...prev,
      currentStageKey: stageKey,
      view: 'details',
      lastBookedServiceInfo: null,
    }));
  }, []);

  const handleSelectConcern = useCallback((concern: Concern) => {
    setAppState(prev => ({ ...prev, selectedConcern: concern, view: 'chat', chatMessages: [], chatSession: null }));
  }, []);

  const initializeChatSession = useCallback(() => {
    const userApiKey = localStorage.getItem('gemini_api_key');
    // Fix: Cast import.meta to any to resolve TypeScript error.
    const apiKey = userApiKey || (import.meta as any).env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setAppState(prev => ({ ...prev, error: "API Key not found. Please add a key in Settings to chat.", isLoading: false }));
      return null;
    }
    
    const localAi = new GoogleGenAI({ apiKey });
    const currentStage = LIFE_STAGES_DATA.find(s => s.key === appState.currentStageKey);
    if (!currentStage) return null;

    let systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\nFocus on: ${currentStage.title}.`;
    if (patientContext !== 'SELF') systemInstruction += ` The user is helping their ${patientContext.toLowerCase()}.`;
    if (appState.selectedConcern) systemInstruction += ` They are interested in: ${appState.selectedConcern.text}.`;
    
    try {
      const newChatSession = localAi.chats.create({ model: GEMINI_MODEL_NAME, config: { systemInstruction } });
      setAppState(prev => ({ ...prev, chatSession: newChatSession, error: null }));
      return newChatSession;
    } catch (e) {
      console.error("Failed to initialize chat session:", e);
      setAppState(prev => ({ ...prev, error: "Could not start chat.", isLoading: false }));
      return null;
    }
  }, [appState.currentStageKey, appState.selectedConcern, patientContext]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    setAppState(prev => ({ ...prev, isLoading: true, error: null, chatMessages: [...prev.chatMessages, { id: Date.now().toString(), sender: 'user', text: userInput, timestamp: new Date() }] }));

    let activeChatSession = appState.chatSession || initializeChatSession();
    if (!activeChatSession) {
         setAppState(prev => ({ ...prev, isLoading: false }));
         return;
    }
    
    try {
      const resultStream = await activeChatSession.sendMessageStream({ message: userInput });
      let botResponseText = "";
      const botMessageId = `bot-streaming-${Date.now()}`; // Make ID unique
      setAppState(prev => ({...prev, chatMessages: [...prev.chatMessages, {id: botMessageId, sender: 'bot', text: '', timestamp: new Date()}]}));

      for await (const chunk of resultStream) {
        botResponseText += chunk.text;
        setAppState(prev => ({...prev, chatMessages: prev.chatMessages.map(msg => msg.id === botMessageId ? { ...msg, text: botResponseText } : msg)}));
      }

      // Replace the streaming message with a final message
      setAppState(prev => ({
        ...prev,
        chatMessages: prev.chatMessages.map(msg =>
          msg.id === botMessageId
            ? { ...msg, id: `bot-final-${Date.now()}`, text: botResponseText }
            : msg
        )
      }));
    } catch (error) {
      console.error("Error with Gemini:", error);
      const errorMessage = "Asha is unavailable. Check your API key or network and try again.";
      setAppState(prev => ({ ...prev, error: errorMessage, chatMessages: [...prev.chatMessages, { id: Date.now().toString(), sender: 'bot', text: errorMessage, timestamp: new Date() }] }));
    } finally {
        setAppState(prev => ({ ...prev, isLoading: false }));
    }
  }, [appState.chatSession, initializeChatSession]);

  const handleConfirmBooking = async (service: Service, slot: ProviderSlot) => {
      let pricePaid = service.price;
      if (currentPlan) {
          if (currentPlan.coveredServices.includes(service.id)) pricePaid = 0;
          else if (currentPlan.discountedServices.includes(service.id) && service.corporatePrice) pricePaid = service.corporatePrice;
      }
      await bookAppointment({
          serviceId: service.id,
          slotStartTime: slot.startTime.getTime(),
          patientContext,
          pricePaid,
      });
      setAppState(prev => ({
        ...prev, 
        view: 'details', 
        lastBookedServiceInfo: { serviceName: service.name, slotTime: slot.startTime },
        serviceToBook: null,
      }));
  };
  
  const currentStage = LIFE_STAGES_DATA.find(s => s.key === appState.currentStageKey);
  const availableStages = useMemo(() => {
    if (patientContext === 'DAUGHTER') return LIFE_STAGES_DATA.filter(s => s.key === LifeStageKey.GROOMING);
    if (patientContext === 'MOTHER') return LIFE_STAGES_DATA.filter(s => [LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED].includes(s.key));
    return LIFE_STAGES_DATA;
  }, [patientContext]);

  if (appState.error && !appState.chatSession) {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md my-8 text-center" role="alert">
            <p className="font-bold text-lg">AI Assistant Offline</p>
            <p className="mt-2">{appState.error}</p>
        </div>
    );
  }
  
  const renderView = () => {
    switch(appState.view) {
      case 'stages':
        return <StageSelector stages={availableStages} onSelectStage={handleSelectStage} />;
      case 'details':
        return currentStage ? <StageDetails stage={currentStage} onSelectConcern={handleSelectConcern} onBack={() => setAppState(p=>({...p, view: 'stages'}))} lastBookedServiceInfo={appState.lastBookedServiceInfo} /> : null;
      case 'chat':
        return (currentStage && appState.selectedConcern) ? <ChatInterface stage={currentStage} concern={appState.selectedConcern} chatMessages={appState.chatMessages} onSendMessage={handleSendMessage} isLoading={appState.isLoading} onBack={() => setAppState(p=>({...p, view: 'details'}))} onShowServices={() => setAppState(p=>({...p, view: 'services'}))} onShowAppointments={() => setAppState(p=>({...p, view: 'my_appointments'}))} /> : null;
      case 'services':
        // Fix: Pass the required 'currentUser' prop to ServicesView.
        return <ServicesView currentUser={currentUser} onSelectService={(s) => setAppState(p => ({...p, serviceToBook: s, view: 'booking'}))} onBack={() => setAppState(p=>({...p, view: 'chat'}))} currentPlan={currentPlan} currentStageKey={appState.currentStageKey} allServices={SERVICES_DATA}/>;
      case 'booking':
        return appState.serviceToBook ? <BookingView service={appState.serviceToBook} slots={providerSlots} onConfirmBooking={handleConfirmBooking} onBack={() => setAppState(p => ({...p, view: 'services'}))} currentPlan={currentPlan} /> : null;
      case 'my_appointments':
          return <MyAppointmentsView appointments={userAppointments} onBack={() => setAppState(p=>({...p, view: 'chat'}))} />;
      default:
        return <StageSelector stages={availableStages} onSelectStage={handleSelectStage} />;
    }
  }

  return <>{renderView()}</>;
};

export default UserJourney;
