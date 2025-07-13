// Semantic Search Hook for SmartApply
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// OpenAI API configuration - you'll need to add your API key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.REACT_APP_OPENAI_API_KEY;

export const useSemanticSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate embedding using OpenAI with rate limiting
  const generateEmbedding = useCallback(async (text) => {
    const maxRetries = 3;
    const baseDelay = 5000; // 5 seconds base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`🤖 Attempt ${attempt + 1}/${maxRetries} for OpenAI API...`);
        
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: text,
            model: 'text-embedding-3-small',
          }),
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const waitTime = baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`⏳ Rate limited. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error('OpenAI API Error:', response.status, errorData);
          throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        if (data && data.data && data.data[0] && data.data[0].embedding) {
          console.log('✅ Successfully generated embedding');
          return data.data[0].embedding;
        } else {
          throw new Error('Invalid embedding response from OpenAI');
        }
        
      } catch (err) {
        console.error(`❌ Attempt ${attempt + 1} failed:`, err);
        
        if (attempt === maxRetries - 1) {
          // Last attempt failed
          throw err;
        }
        
        // Wait before retry
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }, []);

  // Semantic job search
  const searchJobs = useCallback(async ({
    query,
    userId = null,
    matchThreshold = 0.7,
    matchCount = 20,
    filters = {}
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Generate embedding for the search query
      const queryEmbedding = await generateEmbedding(query);

      // Call the semantic search function
      const { data, error: searchError } = await supabase.rpc('semantic_job_search', {
        query_embedding: queryEmbedding,
        user_id_param: userId,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_experience_level: filters.experienceLevel || null,
        filter_employment_type: filters.employmentType || null,
        filter_industry: filters.industry || null,
        filter_location: filters.location || null,
      });

      if (searchError) {
        console.error('Semantic search error:', searchError);
        // Fallback to regular search if semantic search fails
        const { data: fallbackData, error: fallbackError } = await supabase.rpc('fallback_job_search', {
          user_id_param: userId,
          match_count: matchCount,
          filter_experience_level: filters.experienceLevel || null,
          filter_employment_type: filters.employmentType || null,
          filter_industry: filters.industry || null,
          filter_location: filters.location || null,
        });
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('Semantic search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [generateEmbedding]);

  // Hybrid search (semantic + keyword)
  const hybridSearch = useCallback(async ({
    query,
    userId = null,
    matchThreshold = 0.6,
    matchCount = 20,
    filters = {}
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Generate embedding for the search query
      const queryEmbedding = await generateEmbedding(query);

      // Call the hybrid search function
      const { data, error: searchError } = await supabase.rpc('hybrid_job_search', {
        search_query: query,
        query_embedding: queryEmbedding,
        user_id_param: userId,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_experience_level: filters.experienceLevel || null,
        filter_employment_type: filters.employmentType || null,
        filter_industry: filters.industry || null,
        filter_location: filters.location || null,
      });

      if (searchError) throw searchError;

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('Hybrid search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [generateEmbedding]);

  // Find similar jobs
  const findSimilarJobs = useCallback(async (jobId, similarityThreshold = 0.8, limitCount = 10) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase.rpc('find_similar_jobs', {
        job_id_param: jobId,
        similarity_threshold: similarityThreshold,
        limit_count: limitCount,
      });

      if (searchError) throw searchError;

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('Similar jobs search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(async (userId, recommendationCount = 15) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase.rpc('get_personalized_recommendations', {
        user_id_param: userId,
        recommendation_count: recommendationCount,
      });

      if (searchError) {
        console.error('Personalized recommendations error:', searchError);
        
        // If user preferences don't exist, try to initialize them first
        if (searchError.message && searchError.message.includes('preference embedding not found')) {
          console.log('🔧 Initializing user preferences...');
          
          const { error: initError } = await supabase.rpc('initialize_user_preferences', {
            user_id_param: userId,
          });
          
          if (initError) {
            console.error('Failed to initialize preferences:', initError);
          } else {
            console.log('✅ User preferences initialized');
          }
        }
        
        // Fallback to regular job recommendations
        const { data: fallbackData, error: fallbackError } = await supabase.rpc('fallback_job_search', {
          user_id_param: userId,
          match_count: recommendationCount,
        });
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }

      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('Personalized recommendations error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user preference embedding
  const updateUserPreferences = useCallback(async (userId, preferenceText) => {
    setLoading(true);
    setError(null);

    try {
      // Generate embedding for user preferences
      const preferenceEmbedding = await generateEmbedding(preferenceText);

      // Update user profile with preference embedding
      const { error: updateError } = await supabase.rpc('update_user_preference_embedding', {
        user_id_param: userId,
        preference_text_param: preferenceText,
        preference_embedding_param: preferenceEmbedding,
      });

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Update user preferences error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [generateEmbedding]);

  // Generate and store job embeddings (admin function)
  const generateJobEmbedding = useCallback(async (jobId, jobTitle, jobDescription, jobSkills = []) => {
    try {
      console.log(`🔧 Generating embedding for: ${jobTitle}`);
      
      // Combine job information into a single text
      const jobText = `${jobTitle} ${jobDescription} ${jobSkills.join(' ')}`;
      console.log(`📝 Job text length: ${jobText.length} characters`);
      
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found');
      }
      
      // Generate embedding
      console.log('🤖 Calling OpenAI API...');
      const embedding = await generateEmbedding(jobText);
      
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Failed to generate valid embedding');
      }
      
      console.log(`📊 Generated embedding with ${embedding.length} dimensions`);

      // Update job with embedding
      console.log('💾 Saving embedding to database...');
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          embedding,
          embedding_updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw updateError;
      }

      console.log('✅ Embedding saved successfully');
      return true;
    } catch (err) {
      console.error(`❌ Generate job embedding error for ${jobTitle}:`, err);
      return false;
    }
  }, [generateEmbedding]);

  // Batch generate embeddings for all jobs without embeddings
  const batchGenerateJobEmbeddings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching jobs without embeddings...');
      
      // First, check if embedding column exists
      const { data: columnCheck, error: columnError } = await supabase
        .from('jobs')
        .select('id')
        .limit(1);
      
      if (columnError) {
        console.error('❌ Database access error:', columnError);
        throw new Error(`Database access error: ${columnError.message}`);
      }

      // First check if embedding column exists by trying to select it
      console.log('🔍 Checking if embedding column exists...');
      const { data: schemaCheck, error: schemaError } = await supabase
        .from('jobs')
        .select('id, embedding')
        .limit(1);
      
      if (schemaError) {
        console.error('❌ Schema check error - embedding column might not exist:', schemaError);
        if (schemaError.message.includes('column "embedding" does not exist')) {
          throw new Error('The embedding column does not exist in the jobs table. Please run the semantic_search_setup.sql file first.');
        }
        throw schemaError;
      }
      
      console.log('✅ Embedding column exists');

      // Check total jobs first
      const { data: totalJobs, error: totalError } = await supabase
        .from('jobs')
        .select('id, title, is_active, embedding')
        .limit(100);
        
      if (totalError) {
        console.error('❌ Error fetching total jobs:', totalError);
        throw totalError;
      }
      
      console.log(`� Total jobs in database: ${totalJobs?.length || 0}`);
      const activeJobs = totalJobs?.filter(job => job.is_active) || [];
      console.log(`🟢 Active jobs: ${activeJobs.length}`);
      const jobsWithEmbeddings = activeJobs.filter(job => job.embedding) || [];
      const jobsWithoutEmbeddings = activeJobs.filter(job => !job.embedding) || [];
      console.log(`✅ Jobs with embeddings: ${jobsWithEmbeddings.length}`);
      console.log(`❌ Jobs without embeddings: ${jobsWithoutEmbeddings.length}`);

      // Get jobs without embeddings
      const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, title, description, required_skills, nice_to_have_skills, embedding, is_active')
        .is('embedding', null)
        .eq('is_active', true)
        .limit(1); // Process one job at a time to avoid rate limits

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }

      console.log(`� Found ${jobs?.length || 0} jobs without embeddings for processing`);
      
      if (!jobs || jobs.length === 0) {
        console.log('🎯 Analysis: No jobs need embedding generation');
        if (jobsWithoutEmbeddings.length > 0) {
          console.log('⚠️ Found inactive jobs without embeddings - they will be skipped');
        }
        return { 
          processed: 0, 
          total: 0, 
          message: `All active jobs already have embeddings. Total active jobs: ${activeJobs.length}, Jobs with embeddings: ${jobsWithEmbeddings.length}` 
        };
      }

      console.log(`🚀 Processing ${jobs.length} jobs...`);
      console.log('🔑 API Key available:', !!OPENAI_API_KEY);

      let processed = 0;
      for (const job of jobs) {
        console.log(`📝 Processing job: ${job.title} (ID: ${job.id})`);
        
        const skills = [
          ...(job.required_skills || []).map(s => s.name || s),
          ...(job.nice_to_have_skills || []).map(s => s.name || s)
        ];
        
        try {
          const success = await generateJobEmbedding(
            job.id,
            job.title || '',
            job.description || '',
            skills
          );
          
          if (success) {
            processed++;
            console.log(`✅ Successfully processed job: ${job.title}`);
          } else {
            console.log(`❌ Failed to process job: ${job.title}`);
          }
        } catch (jobError) {
          console.error(`❌ Error processing job ${job.title}:`, jobError);
        }
        
        // Add much longer delay to avoid rate limiting (OpenAI free tier allows ~3 requests per minute)
        await new Promise(resolve => setTimeout(resolve, 25000)); // 25 seconds between requests
      }

      console.log(`🎉 Completed: ${processed}/${jobs.length} jobs processed`);
      return { processed, total: jobs.length };
    } catch (err) {
      setError(err.message);
      console.error('❌ Batch generate embeddings error:', err);
      return { processed: 0, total: 0, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [generateJobEmbedding]);

  // Check if semantic search is properly set up
  const checkSemanticSearchSetup = useCallback(async () => {
    try {
      console.log('🔍 Checking semantic search setup...');
      
      // Check if embedding column exists
      const { data: jobs, error: jobError } = await supabase
        .from('jobs')
        .select('embedding')
        .limit(1);
        
      if (jobError) {
        if (jobError.message.includes('column "embedding" does not exist')) {
          return {
            isSetup: false,
            error: 'Embedding column does not exist. Please run semantic_search_setup.sql',
            details: 'The database schema needs to be updated with vector embeddings support.'
          };
        }
        throw jobError;
      }
      
      // Check if user_profiles has preference_embedding column
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('preference_embedding')
        .limit(1);
        
      if (profileError && profileError.message.includes('column "preference_embedding" does not exist')) {
        return {
          isSetup: false,
          error: 'User preference embedding column does not exist. Please run semantic_search_setup.sql',
          details: 'The user_profiles table needs the preference_embedding column.'
        };
      }
      
      // Check if semantic search functions exist
      const { data: functions, error: functionError } = await supabase.rpc('semantic_job_search', {
        query_embedding: new Array(1536).fill(0),
        match_count: 1
      });
      
      if (functionError && functionError.message.includes('function semantic_job_search does not exist')) {
        return {
          isSetup: false,
          error: 'Semantic search functions do not exist. Please run semantic_search_setup.sql',
          details: 'The database functions for semantic search have not been created.'
        };
      }
      
      console.log('✅ Semantic search setup appears to be complete');
      return {
        isSetup: true,
        message: 'Semantic search is properly configured'
      };
      
    } catch (err) {
      console.error('Setup check error:', err);
      return {
        isSetup: false,
        error: err.message,
        details: 'Error occurred while checking setup'
      };
    }
  }, []);

  // Initialize user preferences with default values
  const initializeUserPreferences = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      // Initialize basic preferences
      const { error: initError } = await supabase.rpc('initialize_user_preferences', {
        user_id_param: userId,
      });

      if (initError) throw initError;

      // Get the initialized preference text
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('preference_text')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Generate embedding for the preference text
      if (userProfile?.preference_text) {
        const success = await updateUserPreferences(userId, userProfile.preference_text);
        return success;
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Initialize user preferences error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateUserPreferences]);

  return {
    loading,
    error,
    searchJobs,
    hybridSearch,
    findSimilarJobs,
    getPersonalizedRecommendations,
    updateUserPreferences,
    initializeUserPreferences,
    checkSemanticSearchSetup,
    generateJobEmbedding,
    batchGenerateJobEmbeddings,
  };
};
