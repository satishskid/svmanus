import React from 'react';
import { PatientContext } from '../types';
import { UserGroupIcon } from './Icons';

interface PatientContextSwitcherProps {
  currentContext: PatientContext;
  onContextChange: (context: PatientContext) => void;
}

const CONTEXTS: { id: PatientContext, label: string }[] = [
    { id: 'SELF', label: 'Myself' },
    { id: 'DAUGHTER', label: 'My Daughter' },
    { id: 'MOTHER', label: 'My Mother' },
];

const ContextButton: React.FC<{
  context: PatientContext;
  currentContext: PatientContext;
  onClick: (context: PatientContext) => void;
  children: React.ReactNode;
}> = ({ context, currentContext, onClick, children }) => {
  const isActive = context === currentContext;
  return (
    <button
      onClick={() => onClick(context)}
      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-white text-purple-700 shadow'
          : 'bg-transparent text-white hover:bg-white/20'
      }`}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
};

const PatientContextSwitcher: React.FC<PatientContextSwitcherProps> = ({ currentContext, onContextChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="context-switcher" className="text-sm font-semibold text-white/80 hidden sm:flex items-center">
        <UserGroupIcon className="h-5 w-5 mr-2" />
        Care For:
      </label>
      <div id="context-switcher" className="flex items-center space-x-1 p-1 bg-white/10 rounded-lg" role="tablist" aria-label="Care context selection">
        {CONTEXTS.map(ctx => (
            <ContextButton key={ctx.id} context={ctx.id} currentContext={currentContext} onClick={onContextChange}>
                {ctx.label}
            </ContextButton>
        ))}
      </div>
    </div>
  );
};

export default PatientContextSwitcher;
