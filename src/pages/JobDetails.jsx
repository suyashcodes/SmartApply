import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSemanticSearch } from '../hooks/useSemanticSearch';
import { supabase } from '../lib/supabase';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Bookmark, 
  BookmarkCheck,
  Building,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Globe,
  Star,
  CheckCircle,
  Share,
  Flag,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Brain,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { findSimilarJobs } = useSemanticSearch();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [jobMatch, setJobMatch] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [similarJobsLoading, setSimilarJobsLoading] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchUserProfile();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Check if job is bookmarked
      if (user) {
        const { data: savedJob, error: savedError } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('user_id', user.id)
          .eq('job_id', jobId)
          .single();

        setIsBookmarked(!savedError && savedJob);

        // Calculate job match using the same RPC function as Jobs component
        try {
          const { data: matchData, error: matchError } = await supabase
            .rpc('calculate_advanced_job_match_score', {
              user_id_param: user.id,
              job_id_param: jobId
            });

          if (!matchError && matchData) {
            setJobMatch(matchData);
          }
        } catch (matchError) {
          console.error('Error calculating job match:', matchError);
        }
      }

    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);
      
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);

        if (error) throw error;
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{
            user_id: user.id,
            job_id: jobId
          }]);

        if (error) throw error;
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!user) return;

    try {
      // Add to applied jobs
      const { error } = await supabase
        .from('applied_jobs')
        .insert([{
          user_id: user.id,
          job_id: jobId,
          status: 'applied',
          applied_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      // Redirect to external application if available
      if (job.external_url) {
        window.open(job.external_url, '_blank');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const loadSimilarJobs = async () => {
    if (!job || similarJobsLoading) return;

    try {
      setSimilarJobsLoading(true);
      const similar = await findSimilarJobs(job.id, 0.7, 5);
      setSimilarJobs(similar || []);
    } catch (error) {
      console.error('Error loading similar jobs:', error);
    } finally {
      setSimilarJobsLoading(false);
    }
  };

  useEffect(() => {
    if (job) {
      loadSimilarJobs();
    }
  }, [job]);

  const getMatchLabel = (score) => {
    if (score >= 80) return { text: 'Excellent Match', color: 'text-green-600' };
    if (score >= 60) return { text: 'Good Match', color: 'text-blue-600' };
    if (score >= 40) return { text: 'Fair Match', color: 'text-yellow-600' };
    return { text: 'Poor Match', color: 'text-red-600' };
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatSalary = (salaryMin, salaryMax) => {
    if (!salaryMin && !salaryMax) return 'Salary not specified';
    if (salaryMin && salaryMax) {
      return `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}`;
    }
    return salaryMin ? `From $${salaryMin.toLocaleString()}` : `Up to $${salaryMax.toLocaleString()}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const matchLabel = jobMatch ? getMatchLabel(jobMatch.overall_score) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBookmark}
                disabled={saving}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                {isBookmarked ? 'Saved' : 'Save Job'}
              </button>
              
              <button
                onClick={handleApply}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Building className="w-5 h-5 mr-2" />
                    <span className="font-medium">{job.company}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                </div>
                
                {jobMatch && (
                  <div className="text-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke={jobMatch.overall_score >= 80 ? "#10B981" : 
                                 jobMatch.overall_score >= 60 ? "#3B82F6" : 
                                 jobMatch.overall_score >= 40 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${jobMatch.overall_score * 2.827}, 282.7`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {jobMatch.overall_score}%
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-medium mt-2 ${matchLabel.color}`}>
                      {matchLabel.text}
                    </p>
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-sm">{formatSalary(job.salary_min, job.salary_max)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{job.employment_type || 'Full-time'}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm">{job.experience_required || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Industry and Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {job.industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Globe className="w-3 h-3 mr-1" />
                    {job.industry}
                  </span>
                )}
                
                {job.experience_level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {job.experience_level}
                  </span>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700">
                {job.description ? (
                  <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
                ) : (
                  <p>No description available.</p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-red-500" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          jobMatch?.matching_skills?.includes(skill.name || skill)
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {jobMatch?.matching_skills?.includes(skill.name || skill) && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {skill.name || skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.nice_to_have_skills && job.nice_to_have_skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-500" />
                    Nice to Have
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.nice_to_have_skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          jobMatch?.matching_skills?.includes(skill.name || skill)
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {jobMatch?.matching_skills?.includes(skill.name || skill) && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {skill.name || skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Match Score Breakdown */}
            {jobMatch && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Match Analysis
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Skills Match', value: jobMatch.skills_match, weight: '35%' },
                    { label: 'Experience', value: jobMatch.experience_match, weight: '25%' },
                    { label: 'Industry', value: jobMatch.industry_match, weight: '15%' },
                    { label: 'Location', value: jobMatch.location_match, weight: '10%' },
                    { label: 'Job Title', value: jobMatch.title_match, weight: '15%' }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="text-gray-500">({item.weight})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.value >= 80 ? 'bg-green-500' :
                            item.value >= 60 ? 'bg-blue-500' :
                            item.value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-gray-600 mt-1">
                        {item.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Company: </span>
                  <span className="text-sm text-gray-600">{job.company}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Industry: </span>
                  <span className="text-sm text-gray-600">{job.industry || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Location: </span>
                  <span className="text-sm text-gray-600">{job.location}</span>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Similar Jobs
              </h3>
              
              {similarJobsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : similarJobs.length > 0 ? (
                <div className="space-y-3">
                  {similarJobs.slice(0, 3).map((similarJob) => (
                    <div
                      key={similarJob.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/dashboard/jobs/${similarJob.id}`)}
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{similarJob.title}</h4>
                      <p className="text-xs text-gray-600">{similarJob.company}</p>
                      <p className="text-xs text-gray-500">{similarJob.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No similar jobs found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
