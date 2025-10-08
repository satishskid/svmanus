
import React from 'react';

interface FooterProps {
  referralUrl: string;
}

const Footer: React.FC<FooterProps> = ({ referralUrl }) => {
  return (
    <footer className="bg-gray-800 text-gray-300 p-6 text-center mt-auto shadow-inner">
      <div className="container mx-auto">
        <p className="text-sm mb-2">
          <strong>Disclaimer:</strong> This application provides information for educational and supportive purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this application.
        </p>
        <p className="text-sm">
          For emergency situations, please contact your local emergency services. For expert consultations, advanced AI-powered screenings, and in-clinic services, we partner with{' '}
          <a href={referralUrl} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 underline font-semibold">
            Santaan.in
          </a>.
        </p>
        <p className="text-sm mt-4 text-gray-400">
          Made by greybrain.ai
        </p>
      </div>
    </footer>
  );
};

export default Footer;