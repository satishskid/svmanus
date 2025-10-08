import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AnalyticsDashboardProps {
  currentUser: User;
}

interface ConsultationStats {
  totalConsultations: number;
  activeConsultations: number;
  completedConsultations: number;
  averageResponseTime: number;
  satisfactionScore: number;
  topCategories: Array<{ category: string; count: number }>;
  monthlyTrend: Array<{ month: string; consultations: number }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data - in real app, this would call Convex functions
      const mockStats: ConsultationStats = {
        totalConsultations: 47,
        activeConsultations: 12,
        completedConsultations: 35,
        averageResponseTime: 2.3, // minutes
        satisfactionScore: 4.6,
        topCategories: [
          { category: 'Gynecology', count: 18 },
          { category: 'Mental Health', count: 12 },
          { category: 'General', count: 10 },
          { category: 'Emergency', count: 7 },
        ],
        monthlyTrend: [
          { month: 'Jan', consultations: 23 },
          { month: 'Feb', consultations: 28 },
          { month: 'Mar', consultations: 35 },
          { month: 'Apr', consultations: 42 },
          { month: 'May', consultations: 47 },
        ],
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: { value: number; label: string };
    color: string;
  }> = ({ title, value, subtitle, icon, trend, color }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-sm mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '↗' : '↘'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Analytics Available</h3>
        <p className="text-gray-500">Complete some consultations to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultation Analytics</h2>
          <p className="text-gray-600 mt-1">Insights from your AI consultation system</p>
        </div>
        <div className="flex space-x-2">
          {[
            { key: '7d', label: 'Last 7 days' },
            { key: '30d', label: 'Last 30 days' },
            { key: '90d', label: 'Last 90 days' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === key
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Consultations"
          value={stats.totalConsultations}
          subtitle="All time"
          icon="💬"
          trend={{ value: 12, label: 'vs last month' }}
          color="border-l-4 border-l-blue-500"
        />
        <StatCard
          title="Active Consultations"
          value={stats.activeConsultations}
          subtitle="Currently ongoing"
          icon="🔄"
          color="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.averageResponseTime}m`}
          subtitle="AI response speed"
          icon="⚡"
          trend={{ value: -8, label: 'improvement' }}
          color="border-l-4 border-l-purple-500"
        />
        <StatCard
          title="Satisfaction Score"
          value={stats.satisfactionScore}
          subtitle="Out of 5.0"
          icon="⭐"
          trend={{ value: 5, label: 'rating increase' }}
          color="border-l-4 border-l-yellow-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Trend</h3>
          <div className="space-y-3">
            {stats.monthlyTrend.map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(item.consultations / Math.max(...stats.monthlyTrend.map(m => m.consultations))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 font-medium w-8">{item.consultations}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-4">
            {stats.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-blue-500 text-white' :
                    index === 1 ? 'bg-green-500 text-white' :
                    index === 2 ? 'bg-yellow-500 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(category.count / Math.max(...stats.topCategories.map(c => c.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
            <p className="text-sm text-gray-600">Accuracy Rate</p>
            <p className="text-xs text-gray-500 mt-1">Symptom analysis precision</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1.8s</div>
            <p className="text-sm text-gray-600">Average Response</p>
            <p className="text-xs text-gray-500 mt-1">Time to generate response</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
            <p className="text-sm text-gray-600">User Engagement</p>
            <p className="text-xs text-gray-500 mt-1">Users who continue conversations</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Consultations</h3>
        <div className="space-y-3">
          {[
            { title: 'Menstrual Health Concerns', category: 'Gynecology', time: '2 hours ago', status: 'active' },
            { title: 'Anxiety Management', category: 'Mental Health', time: '5 hours ago', status: 'completed' },
            { title: 'General Check-up', category: 'General', time: '1 day ago', status: 'completed' },
            { title: 'Emergency Consultation', category: 'Emergency', time: '2 days ago', status: 'completed' },
          ].map((consultation, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{consultation.title}</p>
                  <p className="text-sm text-gray-600">{consultation.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{consultation.time}</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  consultation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {consultation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
