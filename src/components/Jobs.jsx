import { useState, useEffect } from 'react';
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
  Filter,
  Search,
  Building,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Globe,
  Star,
  CheckCircle,
  X,
  Share,
  Flag,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Brain,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('hybrid'); // 'traditional', 'semantic', 'hybrid'
  const [filters, setFilters] = useState({
    location: '',
    experience_level: '',
    employment_type: '',
    industry: ''
  });
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [jobMatches, setJobMatches] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [hoveredJob, setHoveredJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState({});
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    loading: semanticLoading,
    error: semanticError,
    searchJobs,
    hybridSearch,
    findSimilarJobs,
    getPersonalizedRecommendations,
    updateUserPreferences,
    checkSemanticSearchSetup,
    batchGenerateJobEmbeddings
  } = useSemanticSearch();

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

  // New useEffect for personalized recommendations
  useEffect(() => {
    if (user && userProfile) {
      loadPersonalizedRecommendations();
    }
  }, [user, userProfile]);

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

  // Enhanced fetchJobs function with semantic search
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      if (searchTerm && searchMode !== 'traditional') {
        // Use semantic or hybrid search
        let results = [];
        
        if (searchMode === 'semantic') {
          results = await searchJobs({
            query: searchTerm,
            userId: user?.id,
            matchThreshold: 0.7,
            matchCount: 20,
            filters: {
              experienceLevel: filters.experience_level,
              employmentType: filters.employment_type,
              industry: filters.industry,
              location: filters.location
            }
          });
        } else if (searchMode === 'hybrid') {
          results = await hybridSearch({
            query: searchTerm,
            userId: user?.id,
            matchThreshold: 0.6,
            matchCount: 20,
            filters: {
              experienceLevel: filters.experience_level,
              employmentType: filters.employment_type,
              industry: filters.industry,
              location: filters.location
            }
          });
        }
        
        // Transform semantic search results to match existing job structure
        const transformedJobs = results.map(result => ({
          id: result.job_id,
          title: result.title,
          company: result.company,
          location: result.location,
          experience_level: result.experience_level,
          employment_type: result.employment_type,
          industry: result.industry,
          description: result.description,
          salary_min: result.salary_min,
          salary_max: result.salary_max,
          currency: result.currency,
          work_type: result.work_type,
          posted_date: result.posted_date,
          is_active: result.is_active,
          semantic_similarity: result.semantic_similarity,
          combined_score: result.combined_score,
          applicant_count: Math.floor(Math.random() * 100) + 10, // Mock data
          required_skills: [], // These would need to be fetched separately
          nice_to_have_skills: []
        }));
        
        setJobs(transformedJobs);
        
        // Set job matches from semantic search results
        const matches = {};
        results.forEach(result => {
          if (result.job_match_score) {
            matches[result.job_id] = result.job_match_score;
          }
        });
        setJobMatches(matches);
        
      } else {
        // Traditional search
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
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load personalized recommendations
  const loadPersonalizedRecommendations = async () => {
    try {
      const recommendations = await getPersonalizedRecommendations(user.id, 10);
      setPersonalizedRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
    }
  };

  // Load similar jobs for a specific job
  const loadSimilarJobs = async (jobId) => {
    try {
      const similar = await findSimilarJobs(jobId, 0.8, 5);
      setSimilarJobs(prev => ({
        ...prev,
        [jobId]: similar
      }));
    } catch (error) {
      console.error('Error loading similar jobs:', error);
    }
  };

  // Update user preferences
  const handleUpdatePreferences = async () => {
    if (!userProfile) return;
    
    const preferenceText = `
      Looking for ${userProfile.job_titles || 'opportunities'} 
      in ${userProfile.industry || 'technology'} industry.
      Preferred work type: ${userProfile.work_preference || 'any'}.
      Experience level: ${userProfile.experience_years || 0} years.
      Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'various skills'}.
    `;
    
    const success = await updateUserPreferences(user.id, preferenceText);
    if (success) {
      loadPersonalizedRecommendations();
    }
  };

  // Check semantic search setup
  const handleCheckSetup = async () => {
    const setupResult = await checkSemanticSearchSetup();
    console.log('Setup check result:', setupResult);
    
    if (setupResult.isSetup) {
      alert('✅ Semantic search is properly set up!');
    } else {
      alert(`❌ Setup Issue: ${setupResult.error}\n\nDetails: ${setupResult.details}\n\nPlease run the semantic_search_setup.sql file in your Supabase SQL Editor.`);
    }
  };

  // Generate embeddings for jobs (admin function)
  const handleGenerateEmbeddings = async () => {
    // First check if setup is complete
    const setupResult = await checkSemanticSearchSetup();
    if (!setupResult.isSetup) {
      alert(`❌ Setup Required: ${setupResult.error}\n\nPlease run the semantic_search_setup.sql file first.`);
      return;
    }
    
    const result = await batchGenerateJobEmbeddings();
    console.log('Embedding generation result:', result);
    
    let message = `Generated embeddings for ${result.processed} out of ${result.total} jobs`;
    if (result.message) {
      message += `\n\n${result.message}`;
    }
    if (result.error) {
      message += `\n\nError: ${result.error}`;
    }
    
    alert(message);
  };

  const calculateJobMatches = async () => {
    const matches = {};
    
    for (const job of jobs) {
      try {
        const { data, error } = await supabase
          .rpc('calculate_advanced_job_match_score', {
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

  const renderSkillBadges = (skills, type = 'required') => {
    if (!skills || skills.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h4 className={`text-xs font-medium mb-2 ${type === 'required' ? 'text-red-700' : 'text-green-700'}`}>
          {type === 'required' ? 'Required Skills' : 'Nice to Have'}
        </h4>
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                type === 'required' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {skill.name}
              {skill.required_level && (
                <span className="ml-1 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-2 w-2 ${
                        i < skill.required_level ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </span>
              )}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{skills.length - 4} more
            </span>
          )}
        </div>
      </div>
    );
  };

  // Hover Metrics Component
  const HoverMetrics = ({ match, job }) => {
    if (!match) return null;

    return (
      <div className="absolute top-0 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Why This Job Is A Match</h3>
          <div className="flex items-center space-x-2">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={match.overall_score >= 80 ? "#10B981" : match.overall_score >= 60 ? "#3B82F6" : match.overall_score >= 40 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="3"
                  strokeDasharray={`${match.overall_score}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{match.overall_score}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{getMatchLabel(match.overall_score)}</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          {job.company} is seeking a {job.title}. They are looking for someone with your background...
        </p>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray={`${match.experience_match}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{match.experience_match}%</span>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700">Experience Level</p>
          </div>

          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray={`${match.skills_match}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{match.skills_match}%</span>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700">Skills</p>
          </div>

          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray={`${match.industry_match}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{match.industry_match}%</span>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700">Industry Experience</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">{job.applicant_count}+ applicants</span>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
              <X className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 rounded-full">
              <BookmarkCheck className="h-4 w-4" />
            </button>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-1 inline" />
              ASK ORION
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              APPLY NOW
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jobs List View with enhanced semantic search
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Job Recommendations</h1>
          <p className="text-gray-600">Discover opportunities with AI-powered semantic search</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpdatePreferences}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
          >
            <Brain className="h-4 w-4" />
            Update AI Preferences
          </button>
          <button
            onClick={() => navigate('/dashboard/job-match-score-info')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
          >
            <Sparkles className="h-5 w-5" />
            How is the job match score calculated?
          </button>
        </div>
      </div>

      {/* Personalized Recommendations */}
      {personalizedRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="h-5 w-5 text-purple-600 mr-2" />
              AI-Powered Recommendations
            </h2>
            <button
              onClick={loadPersonalizedRecommendations}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizedRecommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                <h3 className="font-medium text-gray-900 mb-1">{rec.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{rec.company}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {Math.round(rec.recommendation_score * 100)}% match
                  </span>
                  <button
                    onClick={() => navigate(`/job/${rec.job_id}`)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSearchMode('traditional')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                searchMode === 'traditional' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Traditional
            </button>
            <button
              onClick={() => setSearchMode('semantic')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                searchMode === 'semantic' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-1" />
              Semantic
            </button>
            <button
              onClick={() => setSearchMode('hybrid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                searchMode === 'hybrid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-1" />
              Hybrid
            </button>
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={
                searchMode === 'semantic' 
                  ? "Describe what you're looking for (e.g., 'remote AI internship for students')"
                  : searchMode === 'hybrid'
                  ? "Search with natural language or keywords..."
                  : "Search jobs, companies, or keywords..."
              }
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
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Search Mode Description */}
        <div className="mt-3 text-sm text-gray-600">
          {searchMode === 'semantic' && (
            <p>🧠 <strong>Semantic Search:</strong> AI understands the meaning behind your query and finds relevant jobs even with different keywords.</p>
          )}
          {searchMode === 'hybrid' && (
            <p>⚡ <strong>Hybrid Search:</strong> Combines AI semantic understanding with traditional keyword matching for best results.</p>
          )}
          {searchMode === 'traditional' && (
            <p>🔍 <strong>Traditional Search:</strong> Classic keyword-based search that matches exact words and phrases.</p>
          )}
        </div>

        {semanticError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <strong>Search Error:</strong> {semanticError}
            </p>
          </div>
        )}
      </div>

      {/* Admin Controls (hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Admin Controls (Development Only)</h3>
          <div className="flex gap-3">
            <button
              onClick={handleCheckSetup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Check Setup
            </button>
            <button
              onClick={handleGenerateEmbeddings}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Generate Job Embeddings
            </button>
          </div>
        </div>
      )}

      {/* Jobs List - enhanced with semantic search indicators */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria or use different search mode</p>
          </div>
        ) : (
          jobs.map((job) => {
            const match = jobMatches[job.id];
            const isSaved = savedJobs.has(job.id);
            return (
              <div 
                key={job.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
                onMouseEnter={() => setHoveredJob(job.id)}
                onMouseLeave={() => setHoveredJob(null)}
              >
                <div className="flex flex-row justify-between items-start">
                  {/* Left: Job Info and Actions */}
                  <div className="flex-1 min-w-0">
                    {/* Semantic Search Indicators */}
                    {(job.semantic_similarity || job.combined_score) && (
                      <div className="mb-3 flex gap-2">
                        {job.semantic_similarity && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <Brain className="h-3 w-3 mr-1" />
                            {Math.round(job.semantic_similarity * 100)}% semantic match
                          </span>
                        )}
                        {job.combined_score && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <Zap className="h-3 w-3 mr-1" />
                            {Math.round(job.combined_score * 100)}% combined score
                          </span>
                        )}
                      </div>
                    )}

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
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                              onClick={() => navigate(`/job/${job.id}`)}>
                            {job.title}
                          </h3>
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

                    {/* Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {renderSkillBadges(job.required_skills, 'required')}
                      {renderSkillBadges(job.nice_to_have_skills, 'nice')}
                    </div>

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
                      <button 
                        onClick={() => navigate(`/job/${job.id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => loadSimilarJobs(job.id)}
                        className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-1"
                      >
                        <Brain className="h-4 w-4" />
                        Similar
                      </button>
                    </div>
                  </div>
                  {/* Right: Match Score and Hover Metrics - same as before */}
                  {match && (
                    <div className="ml-6 flex-shrink-0 flex flex-col items-end relative min-w-[200px]">
                      <div className="bg-gray-900 rounded-lg p-4 text-white text-center min-w-[160px]">
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
                              stroke={match.overall_score >= 80 ? "#10B981" : match.overall_score >= 60 ? "#3B82F6" : match.overall_score >= 40 ? "#F59E0B" : "#EF4444"}
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
                            <span className={getMatchColor(match.skills_match)}>{match.skills_match}%</span>
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
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Title</span>
                            </div>
                            <span className={getMatchColor(match.title_match)}>{match.title_match}%</span>
                          </div>
                        </div>
                      </div>
                      {/* Show metrics popup only in this right section, not covering the card */}
                      {hoveredJob === job.id && (
                        <div className="absolute top-0 right-0 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 mt-2">
                          <div className="text-sm font-semibold mb-2 text-gray-900">Match Breakdown</div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span>Skills</span>
                              <span className={getMatchColor(match.skills_match)}>{match.skills_match}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Experience</span>
                              <span className={getMatchColor(match.experience_match)}>{match.experience_match}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Industry</span>
                              <span className={getMatchColor(match.industry_match)}>{match.industry_match}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Location</span>
                              <span className={getMatchColor(match.location_match)}>{match.location_match}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Title</span>
                              <span className={getMatchColor(match.title_match)}>{match.title_match}%</span>
                            </div>
                          </div>
                        </div>
                      )}
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