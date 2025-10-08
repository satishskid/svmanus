
import React from 'react';
import { ChatMessage } from '../types';
import { UserCircleIcon, SparklesIcon as BotIcon } from './Icons'; // Using Sparkles for bot

interface ChatMessageBubbleProps {
  message: ChatMessage;
  stageColor: string;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, stageColor }) => {
  const isUser = message.sender === 'user';
  const bubbleColor = isUser ? stageColor : 'bg-gray-200';
  const textColor = isUser ? 'text-white' : 'text-gray-800';
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const Icon = isUser ? UserCircleIcon : BotIcon;
  const iconColor = isUser ? 'text-white opacity-70' : stageColor.replace('bg-','text-');


  return (
    <div className={`flex items-end space-x-2 ${alignment}`}>
      {!isUser && (
        <div className={`flex-shrink-0 p-1 rounded-full ${stageColor.replace('bg-','bg-opacity-20')}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-xl shadow ${bubbleColor} ${textColor}`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300 border-opacity-50">
            <p className="text-xs font-semibold mb-1">Sources:</p>
            <ul className="list-disc list-inside space-y-1">
              {message.sources.map((source, index) => (
                <li key={index} className="text-xs">
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    title={source.title}
                  >
                    {source.title || new URL(source.uri).hostname}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {isUser && (
        <div className={`flex-shrink-0 p-1 rounded-full ${stageColor.replace('bg-','bg-opacity-20')}`}>
         <UserCircleIcon className={`h-6 w-6 ${iconColor}`} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
