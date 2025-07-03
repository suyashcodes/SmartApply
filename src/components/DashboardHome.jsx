import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { FileText, Plus, BarChart3, Clock } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    resumeCount: 0,
    applicationCount: 0,
    recentApplications: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get resume count
      const { count: resumeCount } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get application count
      const { count: applicationCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get recent applications
      const { data: recentApplications } = await supabase
        .from('applications')
        .select(`
          *,
          resumes (file_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        resumeCount: resumeCount || 0,
        applicationCount: applicationCount || 0,
        recentApplications: recentApplications || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your job application activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resumes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resumeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.applicationCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.recentApplications.filter(app => {
                  const appDate = new Date(app.created_at);
                  const now = new Date();
                  return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to apply?</h3>
          <p className="text-blue-100 mb-4">Start a new application with AI-powered content generation.</p>
          <button
            onClick={() => navigate('/dashboard/new-application')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Resume</h3>
          <p className="text-gray-600 mb-4">Add more resumes to your collection for different job types.</p>
          <button
            onClick={() => navigate('/dashboard/upload')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Upload Resume
          </button>
        </div>
      </div>

      {/* Recent Applications */}
      {stats.recentApplications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentApplications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {application.resumes?.file_name || 'Unknown Resume'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {application.job_description.substring(0, 100)}...
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                      {application.requested_outputs && (
                        <div className="flex space-x-1">
                          {application.requested_outputs.map((output, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                            >
                              {output}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={() => navigate('/dashboard/history')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View all applications →
            </button>
          </div>
        </div>
      )}

      {stats.recentApplications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">Start by uploading a resume and creating your first application.</p>
          <button
            onClick={() => navigate('/dashboard/upload')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      )}
    </div>
  );
}