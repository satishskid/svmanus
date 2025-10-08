
import React from 'react';
import { Concern } from '../types';
import { ChatBubbleLeftRightIcon } from './Icons'; // Or other relevant icon

interface ConcernButtonProps {
  concern: Concern;
  onClick: () => void;
  color: string; // Tailwind bg color like 'bg-pink-500'
}

const ConcernButton: React.FC<ConcernButtonProps> = ({ concern, onClick, color }) => {
  // Generate hover and focus colors based on the base color
  const hoverColor = color.replace('bg-', 'hover:bg-').replace('500', '600');
  const ringColor = color.replace('bg-', 'focus:ring-').replace('500', '500');

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between text-left p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 
                  ${color} text-white ${hoverColor} 
                  focus:outline-none focus:ring-4 ${ringColor} focus:ring-opacity-50`}
      aria-label={`Discuss ${concern.text}`}
    >
      <span className="font-medium">{concern.text}</span>
      <ChatBubbleLeftRightIcon className="h-6 w-6 opacity-80" />
    </button>
  );
};

export default ConcernButton;
