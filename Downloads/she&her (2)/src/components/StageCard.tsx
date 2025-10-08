
import React from 'react';
import { Stage, LifeStageKey } from '../types';

interface StageCardProps {
  stage: Stage;
  onSelectStage: (stageKey: LifeStageKey) => void;
}

const StageCard: React.FC<StageCardProps> = ({ stage, onSelectStage }) => {
  const IconComponent = stage.icon;
  return (
    <button
      onClick={() => onSelectStage(stage.key)}
      className={`group flex flex-col items-center p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${stage.color.replace('bg-', 'focus:ring-')} ${stage.color.replace('bg-', 'border-2 border-')} border-opacity-0 hover:border-opacity-100 ${stage.color.replace('bg-','hover:bg-opacity-10')} bg-white`}
      aria-label={`Select stage: ${stage.title}`}
    >
      <div className={`p-4 rounded-full ${stage.color} mb-4 text-white group-hover:scale-110 transition-transform`}>
        <IconComponent className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-transparent bg-clip-text ${stage.color.replace('bg-','bg-gradient-to-r from-').replace('-500', '-600 via-purple-500 to-pink-500')}">{stage.title}</h3>
      <p className="text-sm text-gray-600 text-center px-2">{stage.description}</p>
    </button>
  );
};

export default StageCard;
