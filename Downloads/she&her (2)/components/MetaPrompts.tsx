import React from 'react';
import HelpCenter from './HelpCenter';

interface MetaPromptProps {
  currentSection?: string;
  context?: 'auth' | 'demo' | 'main' | 'profile' | 'settings';
}

const MetaPrompts: React.FC<MetaPromptProps> = ({ currentSection, context = 'main' }) => {
  const [showHelpCenter, setShowHelpCenter] = React.useState(false);

  const getCommonQuestions = (): Array<{question: string, section: string}> => {
    switch (context) {
      case 'auth':
        return [
          { question: "How do I reset my password?", section: "auth" },
          { question: "Why am I being asked for a password?", section: "auth" },
          { question: "Can I access this from multiple devices?", section: "auth" },
          { question: "How long does my login session last?", section: "auth" },
          { question: "I forgot my password, what should I do?", section: "auth" }
        ];
      case 'demo':
        return [
          { question: "What's included in the demo?", section: "demo" },
          { question: "How do I access demo features?", section: "demo" },
          { question: "Can I save my demo progress?", section: "demo" },
          { question: "How long does demo access last?", section: "demo" },
          { question: "Can I convert from demo to full account?", section: "demo" }
        ];
      case 'main':
        return [
          { question: "How do I navigate the platform?", section: "navigation" },
          { question: "Where can I find my profile settings?", section: "profile" },
          { question: "How do I contact support?", section: "support" },
          { question: "What features are available?", section: "features" },
          { question: "How do I log out securely?", section: "auth" }
        ];
      case 'profile':
        return [
          { question: "How do I update my personal information?", section: "profile" },
          { question: "Can I change my username?", section: "profile" },
          { question: "How do I delete my account?", section: "profile" },
          { question: "Where is my account data stored?", section: "privacy" },
          { question: "How do I manage notifications?", section: "settings" }
        ];
      default:
        return [
          { question: "How can I get help?", section: "support" },
          { question: "What should I do next?", section: "navigation" },
          { question: "Where are the main features?", section: "features" }
        ];
    }
  };

  const commonQuestions = getCommonQuestions();

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Common Questions</h3>
              <p className="text-xs text-blue-700">Quick access to frequently asked questions</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelpCenter(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Full Help →
          </button>
        </div>

        <div className="space-y-2">
          {commonQuestions.slice(0, 3).map((item, index) => (
            <button
              key={index}
              className="w-full text-left text-sm text-blue-800 hover:text-blue-900 hover:bg-blue-100 rounded-md p-2 transition-colors duration-200"
              onClick={() => {
                console.log(`Navigate to: ${item.section} - ${item.question}`);
              }}
            >
              <span className="font-medium">{item.question}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600 text-center">
            💡 Need more help? Click "Full Help →" above
          </p>
        </div>
      </div>
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
    </>
  );
};

export default MetaPrompts;
