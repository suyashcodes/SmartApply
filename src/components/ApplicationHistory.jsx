import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { FileText, Eye, Copy, Download, Calendar, Filter } from 'lucide-react';

export default function ApplicationHistory() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          resumes (file_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterType === 'all') return true;
    return app.requested_outputs.includes(filterType);
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const downloadAsText = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedApplication) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Application History</h1>
            <p className="text-gray-600 mt-2">View and manage all your AI-generated job application content.</p>
          </div>

          {/* Filter */}
          <div className="mb-6 flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Applications</option>
              <option value="resume_suggestions">Resume Suggestions</option>
              <option value="cover_letter">Cover Letters</option>
              <option value="cold_email">Cold Emails</option>
            </select>
            <span className="text-sm text-gray-500">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">Start creating applications to see them here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">
                          {application.resumes?.file_name || 'Unknown Resume'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {application.job_description.substring(0, 150)}...
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {application.requested_outputs.map((output) => (
                          <span
                            key={output}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {output.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Application Detail View
  const outputOptions = {
    resume_suggestions: 'Resume Suggestions',
    cover_letter: 'Cover Letter',
    cold_email: 'Cold Email'
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedApplication(null)}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back to History
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>Resume: {selectedApplication.resumes?.file_name}</span>
            <span>•</span>
            <span>Created: {new Date(selectedApplication.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.job_description}</p>
          </div>
        </div>

        {/* Generated Content */}
        <div className="space-y-6">
          {selectedApplication.results && Object.entries(selectedApplication.results).map(([key, content]) => (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{outputOptions[key]}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(content)}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsText(content, `${key}_${new Date().toISOString().split('T')[0]}.txt`)}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{content}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}