import React, { useState, useRef, useEffect } from 'react';
import { Stage, Concern, ChatMessage } from '../types';
import ChatMessageBubble from './ChatMessageBubble';
import { PaperAirplaneIcon, ArrowLeftIcon, CalendarDaysIcon, ClipboardDocCheckIcon, SparklesIcon } from './Icons';

interface ChatInterfaceProps {
  stage: Stage;
  concern: Concern;
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onBack: () => void;
  onShowServices: () => void;
  onShowAppointments: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  stage,
  concern,
  chatMessages,
  onSendMessage,
  isLoading,
  onBack,
  onShowServices,
  onShowAppointments
}) => {
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSendMessage(userInput);
      setUserInput('');
    }
  };

  const stageColor = stage.color || 'bg-indigo-500';
  const stageTextColor = stageColor.replace('bg-', 'text-');
  const stageBorderColor = stageColor.replace('bg-', 'border-');

  const showThinkingBubble = isLoading &&
                             chatMessages.length > 0 &&
                             chatMessages[chatMessages.length - 1].sender === 'bot' &&
                             chatMessages[chatMessages.length - 1].text === '';

  // Get suggested questions based on the concern
  const getSuggestedQuestions = (concernId: string) => {
    const suggestions: Record<string, string[]> = {
      'g1': [
        'What should I expect during my first period?',
        'How can I track my menstrual cycle?',
        'What products should I use for my period?'
      ],
      'g2': [
        'What nutrients are important for hormonal balance?',
        'How does diet affect my menstrual cycle?',
        'What are natural ways to balance hormones?'
      ],
      'g3': [
        'What are the symptoms of PCOS?',
        'How is PCOS diagnosed?',
        'What lifestyle changes help with PCOS?'
      ],
      'g4': [
        'How can I improve my body image?',
        'What are healthy ways to use social media?',
        'How do I deal with comparison on social media?'
      ],
      'g5': [
        'How can I manage mood swings during adolescence?',
        'What are normal emotional changes during puberty?',
        'When should I seek help for anxiety?'
      ],
      'm1': [
        'How can I prepare for pregnancy?',
        'What are the signs of fertility?',
        'How does intimacy change during different life stages?'
      ],
      'm2': [
        'What causes performance anxiety?',
        'How can I reduce anxiety about intimacy?',
        'What are normal expectations for intimacy?'
      ],
      'm3': [
        'What are my options for unplanned pregnancy?',
        'How effective is emergency contraception?',
        'What should I do if I think I might be pregnant?'
      ],
      'm4': [
        'When should I see a doctor about fertility?',
        'What tests are available for fertility?',
        'What lifestyle factors affect fertility?'
      ],
      'm5': [
        'How can I balance work and relationship?',
        'What are healthy boundaries in relationships?',
        'How do I maintain my career while planning a family?'
      ],
      'm6': [
        'How can I manage stress in my relationship?',
        'What are healthy ways to communicate in relationships?',
        'When should couples seek counseling?'
      ],
      'mh1': [
        'What prenatal care do I need?',
        'How often should I see my doctor during pregnancy?',
        'What tests are recommended during pregnancy?'
      ],
      'mh2': [
        'How do cultural beliefs affect parenting?',
        'What are different parenting styles?',
        'How can I incorporate my culture into parenting?'
      ],
      'mh3': [
        'What are the signs of postpartum depression?',
        'How can I get help for postpartum depression?',
        'What support is available for new mothers?'
      ],
      'mh4': [
        'How can I balance work and motherhood?',
        'What are my rights as a working mother?',
        'How do I ask for flexible work arrangements?'
      ],
      'mh5': [
        'How can I manage anxiety as a new mother?',
        'What are normal worries for new parents?',
        'When should I seek help for parental anxiety?'
      ],
      'mh6': [
        'How long should I wait between pregnancies?',
        'What are the risks of having children close in age?',
        'How can I prepare my body for another pregnancy?'
      ],
      'bf1': [
        'How can I find fulfillment in homemaking?',
        'What are realistic expectations for homemakers?',
        'How can I create a positive home environment?'
      ],
      'bf2': [
        'How can I use my time productively as children grow?',
        'What are good activities for personal growth?',
        'How can I pursue hobbies while raising children?'
      ],
      'bf3': [
        'What are the early signs of diabetes?',
        'How can I prevent hypertension?',
        'What lifestyle changes help with chronic conditions?'
      ],
      'bf4': [
        'How can I monitor my children\'s health?',
        'What are normal childhood illnesses?',
        'When should I be concerned about my child\'s health?'
      ],
      's1': [
        'How can I adjust to an empty nest?',
        'What activities can fill my time after children leave?',
        'How do I maintain relationships with adult children?'
      ],
      's2': [
        'How can I manage diabetes effectively?',
        'What are the best treatments for hypertension?',
        'How do I prevent complications from chronic conditions?'
      ],
      's3': [
        'What are the symptoms of perimenopause?',
        'How long does perimenopause last?',
        'What treatments are available for perimenopause?'
      ],
      'lc1': [
        'How can I find companionship in later life?',
        'What are healthy ways to meet new people?',
        'How do I know if I\'m ready for a new relationship?'
      ],
      'lc2': [
        'How can I build good relationships with my grandchildren?',
        'What are healthy boundaries with adult children?',
        'How can I support my family without overstepping?'
      ],
      'lc3': [
        'How can I manage multiple chronic conditions?',
        'What should I know about elderly healthcare?',
        'How can I stay independent as I age?'
      ],
      'lc4': [
        'What causes osteoporosis after menopause?',
        'How can I prevent osteoporosis?',
        'What treatments are available for osteoporosis?'
      ],
      'lc5': [
        'How can I combat loneliness in later life?',
        'What activities help with social isolation?',
        'When should I seek help for loneliness?'
      ]
    };

    return suggestions[concernId] || [
      'What are the common symptoms?',
      'How is this condition diagnosed?',
      'What treatment options are available?',
      'How can I manage this at home?',
      'When should I see a doctor?'
    ];
  };

  const suggestedQuestions = getSuggestedQuestions(concern.id);

  return (
    <div className={`bg-white rounded-xl shadow-2xl flex flex-col h-[80vh] max-h-[800px] border-t-8 ${stageBorderColor}`}>
      <div className={`p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10`}>
         <button
            onClick={onBack}
            className={`flex items-center text-sm ${stageTextColor} hover:opacity-80 font-medium mb-2 transition-colors`}
          >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Concerns for {stage.title}
        </button>
        <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
                <h2 className={`text-xl font-semibold ${stageTextColor}`}>Chat about: {concern.text}</h2>
                <p className="text-sm text-gray-500 mt-1">
                You are chatting with Asha, your AI assistant.
                </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                  onClick={onShowAppointments}
                  className="flex-shrink-0 flex items-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
              >
                  <ClipboardDocCheckIcon className="h-5 w-5 mr-2" />
                  My Appointments
              </button>
              <button
                  onClick={onShowServices}
                  className="flex-shrink-0 flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
              >
                  <CalendarDaysIcon className="h-5 w-5 mr-2" />
                  Book Services
              </button>
            </div>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {chatMessages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} stageColor={stageColor} />
        ))}
        {chatMessages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-10 space-y-4">
                <p>Hello! I'm Asha. How can I help you today regarding "{concern.text}"?</p>
                <p className="text-xs mt-2">I can provide information and support. For specific medical advice or services, please use the booking buttons above.</p>

                {/* Suggested Questions */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-3">
                    <SparklesIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm font-semibold text-gray-700">💡 Common questions about this topic:</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => onSendMessage(question)}
                        className="text-xs bg-white hover:bg-blue-100 text-gray-700 px-3 py-2 rounded-full transition-all duration-200 border border-blue-300 shadow-sm hover:shadow-md font-medium"
                        disabled={isLoading}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-3">
                    Click any question to ask Asha, or type your own question below
                  </p>
                </div>
            </div>
        )}
        {showThinkingBubble && (
           <div className="flex justify-start">
            <div className={`${stageColor.replace('bg-','bg-opacity-10')} ${stageTextColor.replace('text-','text-opacity-80')} p-3 rounded-lg max-w-xs lg:max-w-md animate-pulse`}>
              Asha is thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your question here..."
            className={`flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 ${stageColor.replace('bg-','focus:ring-')} focus:border-transparent outline-none transition-shadow`}
            disabled={isLoading}
            aria-label="Your message"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className={`p-3 rounded-lg text-white ${stageColor} ${stageColor.replace('bg-','hover:bg-').replace('500','600')} disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 ${stageColor.replace('bg-','focus:ring-')} focus:ring-opacity-50`}
            aria-label="Send message"
          >
            {isLoading && (!showThinkingBubble || userInput.trim()) ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PaperAirplaneIcon className="h-6 w-6" />
            )}
          </button>
        </div>
        {isLoading && <p className="text-xs text-gray-500 mt-2 text-center">Asha is responding...</p>}
      </form>
    </div>
  );
};

export default ChatInterface;