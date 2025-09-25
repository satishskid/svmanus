import React, { useState, useEffect } from 'react';
import { User, Consultation } from '../types';
import { FullPageSpinner } from './LoadingSpinner';

interface ConsultationListProps {
  currentUser: User;
  onSelectConsultation: (consultation: Consultation) => void;
  onCreateConsultation: () => void;
}

const ConsultationList: React.FC<ConsultationListProps> = ({
  currentUser,
  onSelectConsultation,
  onCreateConsultation,
}) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadConsultations();
  }, [filter]);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      // Mock data for demo - in real app, this would call the Convex functions
      const mockConsultations: Consultation[] = [
        {
          _id: "consultation-1",
          _creationTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          userId: currentUser._id as any,
          title: "Menstrual Health Concerns",
          status: "active",
          priority: "medium",
          category: "gynecology",
          initialSymptoms: "Irregular periods and cramps",
          aiSummary: "Patient experiencing irregular menstrual cycles with moderate cramping",
          messages: [
            {
              _id: "msg-1",
              consultationId: "consultation-1",
              authorId: currentUser._id as any,
              authorRole: "USER",
              messageType: "text",
              content: "I've been having irregular periods for the past 3 months",
              isAiGenerated: false,
              created_at: Date.now() - 2 * 60 * 60 * 1000,
            },
            {
              _id: "msg-2",
              consultationId: "consultation-1",
              authorId: currentUser._id as any,
              authorRole: "AI",
              messageType: "text",
              content: "I understand your concern about irregular periods. This can be caused by various factors. Can you tell me more about your symptoms?",
              isAiGenerated: true,
              confidenceScore: 0.9,
              created_at: Date.now() - 1.5 * 60 * 60 * 1000,
            },
          ],
          created_at: Date.now() - 2 * 60 * 60 * 1000,
          updated_at: Date.now() - 1.5 * 60 * 60 * 1000,
        },
        {
          _id: "consultation-2",
          _creationTime: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
          userId: currentUser._id as any,
          title: "General Health Check",
          status: "completed",
          priority: "low",
          category: "general",
          initialSymptoms: "Just a routine check-up",
          aiSummary: "Routine health consultation completed successfully",
          messages: [],
          created_at: Date.now() - 24 * 60 * 60 * 1000,
          updated_at: Date.now() - 23 * 60 * 60 * 1000,
          closed_at: Date.now() - 23 * 60 * 60 * 1000,
        },
      ];

      let filteredConsultations = mockConsultations;
      if (filter === 'active') {
        filteredConsultations = mockConsultations.filter(c => c.status === 'active');
      } else if (filter === 'completed') {
        filteredConsultations = mockConsultations.filter(c => c.status === 'completed');
      }

      setConsultations(filteredConsultations);
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Consultations</h2>
        <button
          onClick={onCreateConsultation}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
        >
          + New Consultation
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: 'all', label: 'All', count: consultations.length },
          { key: 'active', label: 'Active', count: consultations.filter(c => c.status === 'active').length },
          { key: 'completed', label: 'Completed', count: consultations.filter(c => c.status === 'completed').length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Consultations List */}
      {consultations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No consultations yet</h3>
          <p className="text-gray-500 mb-4">Start your first AI-powered consultation</p>
          <button
            onClick={onCreateConsultation}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Create Consultation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <div
              key={consultation._id}
              onClick={() => onSelectConsultation(consultation)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{consultation.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {consultation.aiSummary || consultation.initialSymptoms || 'No summary available'}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatDate(consultation.created_at)}</span>
                    <span>{consultation.messages?.length || 0} messages</span>
                    <span className="capitalize">{consultation.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(consultation.status)}`}>
                      {consultation.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(consultation.priority)}`}>
                      {consultation.priority}
                    </span>
                  </div>
                  {consultation.status === 'active' && (
                    <div className="flex items-center text-green-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      <span className="text-xs">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationList;
