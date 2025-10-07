import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Consultation, ChatMessage } from '../types';
import { PaperAirplaneIcon, UserCircleIcon, DocumentTextIcon, CheckCircleIcon, CheckBadgeIcon } from './Icons';

interface ProviderConsultationProps {
  consultation: any;
  currentUser: User;
  onSendMessage: (content: string, messageType: string) => void;
  onEndConsultation: () => void;
}

const ProviderConsultation: React.FC<ProviderConsultationProps> = ({
  consultation,
  currentUser,
  onSendMessage,
  onEndConsultation,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(consultation.conversationHistory || []);
  const [isTyping, setIsTyping] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionContent, setPrescriptionContent] = useState('');
  const [aiPrescription, setAiPrescription] = useState('');
  const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);

  const ai = useMemo(() => {
    const apiKey = localStorage.getItem('gemini_api_key') || (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsTyping(true);
    await onSendMessage(message, 'text');
    setMessage('');
    setIsTyping(false);
  };

  const generatePrescription = async () => {
    if (!ai || !consultation) return;

    setIsGeneratingPrescription(true);
    try {
      const conversationSummary = messages.slice(-10).map(msg =>
        `${msg.sender === 'user' ? 'Patient' : 'Provider'}: ${msg.text}`
      ).join('\n');

      const prompt = `
Based on the following consultation conversation, generate a professional medical prescription in medical language:

Conversation Summary:
${conversationSummary}

Patient Information:
- Name: ${consultation.patientName}
- Service: ${consultation.serviceName}
- Context: ${consultation.context}

Please generate a prescription that includes:
1. Patient demographics and visit details
2. Chief complaint and history of present illness
3. Assessment and diagnosis
4. Treatment plan with medications, dosages, and instructions
5. Follow-up recommendations
6. Any additional notes or recommendations

Format the prescription in proper medical format with clear sections.
`;

      const result = await ai.models.generateContent({
        model: "gemini-pro",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // Mock prescription generation for demo
      const mockPrescription = `
PRESCRIPTION

Patient Name: ${consultation.patientName}
Date: ${new Date().toLocaleDateString()}
Doctor: Dr. Healthcare Provider

CHIEF COMPLAINT:
Patient presented with symptoms discussed during consultation.

ASSESSMENT:
Based on consultation and patient history.

MEDICATIONS:
1. Medication Name - Dosage: X mg, Frequency: X times daily, Duration: X days
   Instructions: Take with food

FOLLOW-UP:
Please schedule follow-up appointment in 2 weeks if symptoms persist.

Additional Notes:
Continue current lifestyle modifications as discussed.
`;

      setAiPrescription(mockPrescription);
      setPrescriptionContent(mockPrescription);
      setShowPrescriptionModal(true);
    } catch (error) {
      console.error('Error generating prescription:', error);
      setAiPrescription('Error generating prescription. Please try again.');
    }
    setIsGeneratingPrescription(false);
  };

  const handleApprovePrescription = () => {
    // Here you would save the prescription to the patient's record
    console.log('Prescription approved and saved:', prescriptionContent);
    setShowPrescriptionModal(false);
    setAiPrescription('');
    setPrescriptionContent('');
  };

  const handleRejectPrescription = () => {
    setShowPrescriptionModal(false);
    setAiPrescription('');
    setPrescriptionContent('');
  };

  const formatTimestamp = (timestamp: Date | number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMessageBubbleClass = (sender: string) => {
    const baseClasses = 'max-w-xs lg:max-w-md px-4 py-2 rounded-lg';
    if (sender === 'user') {
      return `${baseClasses} bg-pink-500 text-white ml-auto`;
    } else {
      return `${baseClasses} bg-blue-500 text-white mr-auto`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Consultation: {consultation.patientName}
            </h2>
            <div className="flex items-center space-x-4 mt-1">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active Consultation
              </span>
              <span className="text-sm text-gray-500">{consultation.serviceName}</span>
              {consultation.patientContext !== 'SELF' && (
                <span className="text-sm text-gray-500">
                  (for {consultation.patientContext.toLowerCase()})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={generatePrescription}
              disabled={isGeneratingPrescription}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              {isGeneratingPrescription ? 'Generating...' : 'Generate Prescription'}
            </button>
            <button
              onClick={onEndConsultation}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              End Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Patient Context */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <UserCircleIcon className="h-8 w-8 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-800">Patient Context</h3>
            <p className="text-sm text-blue-700 mt-1">{consultation.context}</p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Previous conversation context is available. Patient had AI consultation before booking.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg">Start the consultation conversation</p>
            <p className="text-sm mt-2">Ask about symptoms and concerns</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  msg.sender === 'user' ? 'bg-pink-500' : 'bg-blue-500'
                } text-white`}>
                  {msg.sender === 'user' ? '👤' : '👩‍⚕️'}
                </div>
                <div className="flex flex-col">
                  <div className={getMessageBubbleClass(msg.sender)}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg mr-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to the patient..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </form>
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
          <span>💡 Use this chat for consultation notes and patient communication</span>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">AI-Generated Prescription</h3>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CheckBadgeIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Patient:</strong> {consultation.patientName} | <strong>Service:</strong> {consultation.serviceName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Generated:</strong> {new Date().toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {aiPrescription}
              </pre>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleApprovePrescription}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Approve & Send to Patient
              </button>
              <button
                onClick={handleRejectPrescription}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center justify-center"
              >
                <CheckBadgeIcon className="h-5 w-5 mr-2" />
                Edit Prescription
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This prescription was generated by AI based on the consultation conversation.
                Please review carefully before approving. The patient will receive this as their official prescription.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderConsultation;
