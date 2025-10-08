import React, { useState, useEffect, useRef } from 'react';
import { User, Consultation, ConsultationMessage } from '../types';
import { FullPageSpinner } from './LoadingSpinner';

interface ConsultationChatProps {
  consultation: Consultation;
  currentUser: User;
  onSendMessage: (content: string, messageType: string) => void;
  onCloseConsultation: () => void;
}

const ConsultationChat: React.FC<ConsultationChatProps> = ({
  consultation,
  currentUser,
  onSendMessage,
  onCloseConsultation,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ConsultationMessage[]>(consultation.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages(consultation.messages || []);
  }, [consultation.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsTyping(true);
    await onSendMessage(message, 'text');
    setMessage('');
    setIsTyping(false);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMessageBubbleClass = (authorRole: string, isCurrentUser: boolean) => {
    const baseClasses = 'max-w-xs lg:max-w-md px-4 py-2 rounded-lg';

    if (authorRole === 'AI') {
      return `${baseClasses} bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-4`;
    } else if (authorRole === 'PROVIDER') {
      return `${baseClasses} bg-blue-500 text-white ml-4`;
    } else if (isCurrentUser) {
      return `${baseClasses} bg-pink-500 text-white ml-auto`;
    } else {
      return `${baseClasses} bg-gray-200 text-gray-800 mr-4`;
    }
  };

  const getAuthorName = (authorRole: string, authorId: string) => {
    if (authorRole === 'AI') return 'AI Assistant 🤖';
    if (authorRole === 'PROVIDER') return 'Healthcare Provider 👩‍⚕️';
    if (authorId === currentUser._id) return 'You';
    return 'Patient 👤';
  };

  if (!consultation) {
    return <FullPageSpinner />;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{consultation.title}</h2>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                consultation.status === 'active' ? 'bg-green-100 text-green-800' :
                consultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                consultation.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {consultation.status.toUpperCase()}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                consultation.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                consultation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                consultation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {consultation.priority.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">{consultation.category}</span>
            </div>
          </div>
          <button
            onClick={onCloseConsultation}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg">Start a conversation with our AI assistant</p>
            <p className="text-sm mt-2">Describe your symptoms or health concerns</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.authorId === currentUser._id;
            const showAvatar = index === 0 || messages[index - 1].authorRole !== msg.authorRole;

            return (
              <div key={msg._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                  {showAvatar && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      msg.authorRole === 'AI' ? 'bg-gradient-to-r from-purple-500 to-blue-500' :
                      msg.authorRole === 'PROVIDER' ? 'bg-blue-500' :
                      isCurrentUser ? 'bg-pink-500' : 'bg-gray-400'
                    } text-white`}>
                      {msg.authorRole === 'AI' ? '🤖' :
                       msg.authorRole === 'PROVIDER' ? '👩‍⚕️' :
                       isCurrentUser ? '👤' : '👥'}
                    </div>
                  )}
                  <div className="flex flex-col">
                    {showAvatar && (
                      <span className="text-xs text-gray-500 mb-1">
                        {getAuthorName(msg.authorRole, msg.authorId)}
                      </span>
                    )}
                    <div className={getMessageBubbleClass(msg.authorRole, isCurrentUser)}>
                      <p className="text-sm">{msg.content}</p>
                      {msg.confidenceScore && (
                        <p className="text-xs opacity-75 mt-1">
                          Confidence: {(msg.confidenceScore * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
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
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          💡 Tip: Be specific about your symptoms for better AI assistance
        </div>
      </div>
    </div>
  );
};

export default ConsultationChat;
