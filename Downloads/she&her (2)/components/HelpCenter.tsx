import React, { useState } from 'react';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const helpSections = {
    'getting-started': {
      title: 'Getting Started',
      questions: [
        {
          q: 'How do I access the platform?',
          a: 'Enter the password "SheHerSecure2025!" on the login screen. This is the secure access password for the She&Her Healthcare Platform.'
        },
        {
          q: 'I forgot the password, what should I do?',
          a: 'Contact your system administrator or development team. The password can be changed in the Netlify dashboard under Environment Variables.'
        },
        {
          q: 'Can I access this from multiple devices?',
          a: 'Yes, you can access the platform from any device. Each login session is valid for 24 hours, after which you\'ll need to re-authenticate.'
        }
      ]
    },
    'authentication': {
      title: 'Authentication & Security',
      questions: [
        {
          q: 'How long does my login session last?',
          a: 'Your authentication token is valid for 24 hours. After this period, you\'ll need to log in again for security purposes.'
        },
        {
          q: 'Is my connection secure?',
          a: 'Yes, the platform uses HTTPS encryption and secure authentication tokens. All data transmission is encrypted.'
        },
        {
          q: 'Can I change my password?',
          a: 'Password changes must be made by the system administrator through the Netlify dashboard or by contacting the development team.'
        }
      ]
    },
    'demo-access': {
      title: 'Demo Access',
      questions: [
        {
          q: 'What\'s included in the demo?',
          a: 'The demo includes full access to all platform features with sample data. It\'s designed to showcase the platform\'s capabilities.'
        },
        {
          q: 'How do I access demo mode?',
          a: 'Demo mode is available during development and testing. Contact the development team for demo access codes.'
        },
        {
          q: 'Can I save my demo progress?',
          a: 'Demo data is temporary and resets periodically. For persistent data, please use the full platform with proper authentication.'
        }
      ]
    },
    'troubleshooting': {
      title: 'Troubleshooting',
      questions: [
        {
          q: 'I\'m having trouble logging in',
          a: 'Ensure you\'re using the correct password "SheHerSecure2025!". If issues persist, check your internet connection and try again.'
        },
        {
          q: 'The page isn\'t loading',
          a: 'Try refreshing the page or clearing your browser cache. If the problem continues, contact support.'
        },
        {
          q: 'I\'m getting an error message',
          a: 'Note the exact error message and contact the development team with details about when and where the error occurred.'
        }
      ]
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Help Center</h2>
                <p className="text-pink-100">Find answers to common questions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[60vh]">
          {/* Sidebar */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <nav className="p-4">
              {Object.entries(helpSections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
                    activeSection === key
                      ? 'bg-pink-100 text-pink-800 border border-pink-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm opacity-75">{section.questions.length} questions</div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {helpSections[activeSection as keyof typeof helpSections]?.title}
              </h3>
            </div>

            <div className="space-y-6">
              {helpSections[activeSection as keyof typeof helpSections]?.questions.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.q}</h4>
                  <p className="text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Need More Help?</h4>
              <p className="text-blue-800 text-sm mb-3">
                Can't find what you're looking for? Contact our support team for assistance.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
