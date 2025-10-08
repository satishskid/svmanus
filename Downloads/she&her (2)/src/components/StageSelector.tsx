
import React from 'react';
import { Stage, LifeStageKey } from '../types';
import StageCard from './StageCard';

interface StageSelectorProps {
  stages: Stage[];
  onSelectStage: (stageKey: LifeStageKey) => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({ stages, onSelectStage }) => {
  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center text-gray-700 mb-4">Welcome to Your JourneyMap</h2>
      <p className="text-lg text-center text-gray-600 mb-10">
        Please select the life stage that best represents your current journey. We're here to support you.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {stages.map((stage) => (
          <StageCard key={stage.key} stage={stage} onSelectStage={onSelectStage} />
        ))}
      </div>
    </div>
  );
};

export default StageSelector;
