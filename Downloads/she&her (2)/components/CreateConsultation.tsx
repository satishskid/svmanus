import React, { useState } from 'react';
import { User } from '../types';

interface CreateConsultationProps {
  currentUser: User;
  onCreateConsultation: (title: string, category: string, priority: string, symptoms: string) => void;
  onCancel: () => void;
}

const CreateConsultation: React.FC<CreateConsultationProps> = ({
  currentUser,
  onCreateConsultation,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [symptoms, setSymptoms] = useState('');

  const categories = [
    { value: 'general', label: 'General Health', icon: '🏥' },
    { value: 'gynecology', label: 'Gynecology', icon: '👩‍⚕️' },
    { value: 'mental-health', label: 'Mental Health', icon: '🧠' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'follow-up', label: 'Follow-up', icon: '📋' },
    { value: 'preventive', label: 'Preventive Care', icon: '🛡️' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateConsultation(title, category, priority, symptoms);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Start New Consultation</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Menstrual Health Concerns"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      category === cat.value
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-sm font-medium">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority Level
              </label>
              <div className="flex space-x-3">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      priority === p.value
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                      <span className="font-medium">{p.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms or concerns
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Please describe your symptoms in detail. The more specific you are, the better our AI can assist you..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Include details like duration, severity, and any patterns you've noticed
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Start Consultation
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-xl">ℹ️</div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">How AI Consultation Works</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 🤖 AI analyzes your symptoms and provides initial assessment</li>
              <li>• 💬 Chat with our AI assistant for immediate guidance</li>
              <li>• 👩‍⚕️ Healthcare providers can join the conversation if needed</li>
              <li>• 📊 Get personalized recommendations and risk assessments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateConsultation;
