import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Bookmark, 
  BookmarkCheck,
  Filter,
  Search,
  Building,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Globe
} from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experience_level: '',
    employment_type: '',
    industry: ''
  });
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [jobMatches, setJobMatches] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchUserProfile();
      fetchSavedJobs();
    }
  }, [user]);

  useEffect(() => {
    if (jobs.length > 0 && userProfile) {
      calculateJobMatches();
    }
  }, [jobs, userProfile]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
      }

      if (filters.employment_type) {
        query = query.eq('employment_type', filters.employment_type);
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('user_id', user.id)
        .eq('status', 'saved');

      if (!error && data) {
        setSavedJobs(new Set(data.map(item => item.job_id)));
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const calculateJobMatches = async () => {
    const matches = {};
    
    for (const job of jobs) {
      try {
        const { data, error } = await supabase
          .rpc('calculate_job_match_score', {
            user_id_param: user.id,
            job_id_param: job.id
          });

        if (!error && data) {
          matches[job.id] = data;
        }
      } catch (error) {
        console.error(`Error calculating match for job ${job.id}:`, error);
      }
    }
    
    setJobMatches(matches);
  };

  const toggleSaveJob = async (jobId) => {
    try {
      if (savedJobs.has(jobId)) {
        // Remove from saved
        await supabase
          .from('job_applications')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId)
          .eq('status', 'saved');
        
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        // Add to saved
        await supabase
          .from('job_applications')
          .insert({
            user_id: user.id,
            job_id: jobId,
            status: 'saved'
          });
        
        setSavedJobs(prev => new Set([...prev, jobId]));
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .upsert({
          user_id: user.id,
          job_id: jobId,
          status: 'applied'
        });

      if (!error) {
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to submit application');
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const formatSalary = (min, max, currency = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `${formatter.format(min)}+`;
    }
    return 'Salary not specified';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Job Recommendations</h1>
        <p className="text-gray-600">Discover opportunities tailored to your skills and experience</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            <select
              value={filters.experience_level}
              onChange={(e) => setFilters(prev => ({ ...prev, experience_level: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead Level</option>
            </select>

            <select
              value={filters.employment_type}
              onChange={(e) => setFilters(prev => ({ ...prev, employment_type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <button
              onClick={fetchJobs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          jobs.map((job) => {
            const match = jobMatches[job.id];
            const isSaved = savedJobs.has(job.id);
            
            return (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {job.company_logo ? (
                          <img 
                            src={job.company_logo} 
                            alt={job.company}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600 font-medium">{job.company}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                        {job.work_type !== 'onsite' && (
                          <span className="ml-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {job.work_type}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applicant_count} applicants</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(job.posted_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Job Description Preview */}
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {job.description.substring(0, 200)}...
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {job.industry}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {job.experience_level}
                      </span>
                      {job.department && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {job.department}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => applyToJob(job.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Now
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Match Score */}
                  {match && (
                    <div className="ml-6 flex-shrink-0">
                      <div className="bg-gray-900 rounded-lg p-4 text-white text-center min-w-[140px]">
                        <div className="relative w-16 h-16 mx-auto mb-3">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#374151"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeDasharray={`${match.overall_score}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold">{match.overall_score}%</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium mb-3">{getMatchLabel(match.overall_score)}</p>
                        
                        {/* Detailed Metrics */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              <span>Skills</span>
                            </div>
                            <span className={getMatchColor(match.skill_match)}>{match.skill_match}%</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Experience</span>
                            </div>
                            <span className={getMatchColor(match.experience_match)}>{match.experience_match}%</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              <span>Industry</span>
                            </div>
                            <span className={getMatchColor(match.industry_match)}>{match.industry_match}%</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <span>Location</span>
                            </div>
                            <span className={getMatchColor(match.location_match)}>{match.location_match}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}