import React, { useState } from 'react';
import { User, Consultation } from '../types';
import ConsultationList from './ConsultationList';
import ConsultationChat from './ConsultationChat';
import CreateConsultation from './CreateConsultation';
// import { useMutation } from 'convex/react';
// import { api } from 'convex/_generated/api';

interface ConsultationPortalProps {
  currentUser: User;
}

type ViewState = 'list' | 'create' | 'chat';

const ConsultationPortal: React.FC<ConsultationPortalProps> = ({ currentUser }) => {
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  // const sendConsultationMessage = useMutation(api.consultations.sendConsultationMessage);

  const handleCreateConsultation = (title: string, category: string, priority: string, symptoms: string) => {
    // In a real app, this would call the Convex mutation
    console.log('Creating consultation:', { title, category, priority, symptoms });

    // Mock consultation creation
    const newConsultation: Consultation = {
      _id: `consultation-${Date.now()}`,
      _creationTime: Date.now(),
      userId: currentUser._id,
      title,
      status: 'active',
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      category: category as 'general' | 'gynecology' | 'mental-health' | 'emergency' | 'follow-up' | 'preventive',
      initialSymptoms: symptoms,
      messages: [],
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    setSelectedConsultation(newConsultation);
    setCurrentView('chat');
  };

  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setCurrentView('chat');
  };

  const handleSendMessage = async (content: string, messageType: string) => {
    if (!selectedConsultation) return;

    try {
      // Get user's API key from localStorage
      const userApiKey = localStorage.getItem('gemini_api_key');

      // Mock message sending (replace with actual Convex call when backend is available)
      // await sendConsultationMessage({
      //   consultationId: selectedConsultation._id as any,
      //   messageType: messageType as any,
      //   content,
      //   userApiKey: userApiKey || undefined,
      // });

      console.log('Message sent successfully');

      // Mock response for demo
      const aiResponse = {
        _id: `message-${Date.now()}`,
        consultationId: selectedConsultation._id,
        authorId: 'ai-assistant' as any,
        authorRole: 'AI' as const,
        messageType: 'text' as any,
        content: 'Thank you for your message. I understand your concern and will provide helpful information. For medical emergencies, please consult a healthcare professional immediately.',
        isAiGenerated: true,
        created_at: Date.now(),
      };

      // Update selected consultation with new messages
      setSelectedConsultation({
        ...selectedConsultation,
        messages: [...(selectedConsultation.messages || []), aiResponse],
        updated_at: Date.now(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to mock behavior for demo
      const newMessage = {
        _id: `message-${Date.now()}`,
        consultationId: selectedConsultation._id,
        authorId: currentUser._id as any,
        authorRole: 'USER' as const,
        messageType: messageType as any,
        content,
        isAiGenerated: false,
        created_at: Date.now(),
      };

      // Update selected consultation with new message
      setSelectedConsultation({
        ...selectedConsultation,
        messages: [...(selectedConsultation.messages || []), newMessage],
        updated_at: Date.now(),
      });
    }
  };

  const handleCloseConsultation = () => {
    setCurrentView('list');
    setSelectedConsultation(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedConsultation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToList}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentView === 'chat'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'hidden'
                }`}
              >
                ← Back to Consultations
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === 'list' && 'AI Consultation Portal'}
                {currentView === 'create' && 'New Consultation'}
                {currentView === 'chat' && selectedConsultation?.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">AI Assistant Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <ConsultationList
            currentUser={currentUser}
            onSelectConsultation={handleSelectConsultation}
            onCreateConsultation={() => setCurrentView('create')}
          />
        )}

        {currentView === 'create' && (
          <CreateConsultation
            currentUser={currentUser}
            onCreateConsultation={handleCreateConsultation}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {currentView === 'chat' && selectedConsultation && (
          <ConsultationChat
            consultation={selectedConsultation}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onCloseConsultation={handleCloseConsultation}
          />
        )}
      </div>
    </div>
  );
};

export default ConsultationPortal;
