-- SmartApply Semantic Search Setup
-- Execute these SQL queries in your Supabase SQL Editor

-- 1. Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Add embedding columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding_updated_at timestamp DEFAULT now();

-- 3. Add embedding column to user_profiles table for user preference embeddings
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preference_embedding vector(1536);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preference_text text;

-- 4. Create semantic job search function
CREATE OR REPLACE FUNCTION semantic_job_search(
  query_embedding vector(1536),
  user_id_param uuid DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20,
  filter_experience_level text DEFAULT NULL,
  filter_employment_type text DEFAULT NULL,
  filter_industry text DEFAULT NULL,
  filter_location text DEFAULT NULL
)
RETURNS TABLE (
  job_id uuid,
  title text,
  company text,
  location text,
  experience_level text,
  employment_type text,
  industry text,
  description text,
  salary_min numeric,
  salary_max numeric,
  currency text,
  work_type text,
  posted_date timestamp,
  is_active boolean,
  semantic_similarity float,
  job_match_score jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_matches AS (
    SELECT 
      j.*,
      1 - (j.embedding <=> query_embedding) as similarity_score
    FROM jobs j
    WHERE 
      j.is_active = true
      AND j.embedding IS NOT NULL
      AND (1 - (j.embedding <=> query_embedding)) >= match_threshold
      AND (filter_experience_level IS NULL OR j.experience_level = filter_experience_level)
      AND (filter_employment_type IS NULL OR j.employment_type = filter_employment_type)
      AND (filter_industry IS NULL OR j.industry = filter_industry)
      AND (filter_location IS NULL OR j.location ILIKE '%' || filter_location || '%')
    ORDER BY similarity_score DESC
    LIMIT match_count
  ),
  scored_jobs AS (
    SELECT 
      sm.*,
      CASE 
        WHEN user_id_param IS NOT NULL THEN 
          calculate_advanced_job_match_score(user_id_param, sm.id)
        ELSE 
          jsonb_build_object('overall_score', 75, 'skills_match', 70, 'experience_match', 75, 'industry_match', 80, 'location_match', 75, 'title_match', 70)
      END as match_score
    FROM semantic_matches sm
  )
  SELECT 
    sj.id as job_id,
    sj.title,
    sj.company,
    sj.location,
    sj.experience_level,
    sj.employment_type,
    sj.industry,
    sj.description,
    sj.salary_min,
    sj.salary_max,
    sj.currency,
    sj.work_type,
    sj.posted_date,
    sj.is_active,
    sj.similarity_score as semantic_similarity,
    sj.match_score as job_match_score
  FROM scored_jobs sj
  ORDER BY 
    (sj.similarity_score * 0.4 + (sj.match_score->>'overall_score')::numeric / 100 * 0.6) DESC;
END;
$$;

-- 5. Create hybrid search function (combines semantic + keyword search)
CREATE OR REPLACE FUNCTION hybrid_job_search(
  search_query text,
  query_embedding vector(1536),
  user_id_param uuid DEFAULT NULL,
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 20,
  filter_experience_level text DEFAULT NULL,
  filter_employment_type text DEFAULT NULL,
  filter_industry text DEFAULT NULL,
  filter_location text DEFAULT NULL
)
RETURNS TABLE (
  job_id uuid,
  title text,
  company text,
  location text,
  experience_level text,
  employment_type text,
  industry text,
  description text,
  salary_min numeric,
  salary_max numeric,
  currency text,
  work_type text,
  posted_date timestamp,
  is_active boolean,
  semantic_similarity float,
  keyword_relevance float,
  combined_score float,
  job_match_score jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_matches AS (
    SELECT 
      j.*,
      1 - (j.embedding <=> query_embedding) as similarity_score
    FROM jobs j
    WHERE 
      j.is_active = true
      AND j.embedding IS NOT NULL
      AND (filter_experience_level IS NULL OR j.experience_level = filter_experience_level)
      AND (filter_employment_type IS NULL OR j.employment_type = filter_employment_type)
      AND (filter_industry IS NULL OR j.industry = filter_industry)
      AND (filter_location IS NULL OR j.location ILIKE '%' || filter_location || '%')
  ),
  keyword_matches AS (
    SELECT 
      sm.*,
      CASE 
        WHEN search_query IS NOT NULL AND search_query != '' THEN
          ts_rank(
            to_tsvector('english', COALESCE(sm.title, '') || ' ' || COALESCE(sm.description, '') || ' ' || COALESCE(sm.company, '')),
            plainto_tsquery('english', search_query)
          )
        ELSE 0.5
      END as keyword_score
    FROM semantic_matches sm
  ),
  combined_results AS (
    SELECT 
      km.*,
      (km.similarity_score * 0.7 + km.keyword_score * 0.3) as combined_relevance,
      CASE 
        WHEN user_id_param IS NOT NULL THEN 
          calculate_advanced_job_match_score(user_id_param, km.id)
        ELSE 
          jsonb_build_object('overall_score', 75, 'skills_match', 70, 'experience_match', 75, 'industry_match', 80, 'location_match', 75, 'title_match', 70)
      END as match_score
    FROM keyword_matches km
    WHERE km.similarity_score >= match_threshold OR km.keyword_score > 0.1
    ORDER BY combined_relevance DESC
    LIMIT match_count
  )
  SELECT 
    cr.id as job_id,
    cr.title,
    cr.company,
    cr.location,
    cr.experience_level,
    cr.employment_type,
    cr.industry,
    cr.description,
    cr.salary_min,
    cr.salary_max,
    cr.currency,
    cr.work_type,
    cr.posted_date,
    cr.is_active,
    cr.similarity_score as semantic_similarity,
    cr.keyword_score as keyword_relevance,
    cr.combined_relevance as combined_score,
    cr.match_score as job_match_score
  FROM combined_results cr
  ORDER BY 
    (cr.combined_relevance * 0.4 + (cr.match_score->>'overall_score')::numeric / 100 * 0.6) DESC;
END;
$$;

-- 6. Create function to find similar jobs to a given job
CREATE OR REPLACE FUNCTION find_similar_jobs(
  job_id_param uuid,
  similarity_threshold float DEFAULT 0.8,
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  similar_job_id uuid,
  title text,
  company text,
  similarity_score float
)
LANGUAGE plpgsql
AS $$
DECLARE
  target_embedding vector(1536);
BEGIN
  -- Get the embedding of the target job
  SELECT embedding INTO target_embedding 
  FROM jobs 
  WHERE id = job_id_param AND embedding IS NOT NULL;
  
  IF target_embedding IS NULL THEN
    RAISE EXCEPTION 'Job not found or no embedding available';
  END IF;
  
  RETURN QUERY
  SELECT 
    j.id as similar_job_id,
    j.title,
    j.company,
    1 - (j.embedding <=> target_embedding) as similarity_score
  FROM jobs j
  WHERE 
    j.id != job_id_param 
    AND j.is_active = true
    AND j.embedding IS NOT NULL
    AND (1 - (j.embedding <=> target_embedding)) >= similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$;

-- 7. Create function to update user preference embedding
CREATE OR REPLACE FUNCTION update_user_preference_embedding(
  user_id_param uuid,
  preference_text_param text,
  preference_embedding_param vector(1536)
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    preference_text = preference_text_param,
    preference_embedding = preference_embedding_param
  WHERE user_id = user_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
END;
$$;

-- 8. Create function to get personalized job recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  user_id_param uuid,
  recommendation_count int DEFAULT 15
)
RETURNS TABLE (
  job_id uuid,
  title text,
  company text,
  location text,
  experience_level text,
  employment_type text,
  industry text,
  preference_similarity float,
  job_match_score jsonb,
  recommendation_score float
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_embedding vector(1536);
BEGIN
  -- Get user preference embedding
  SELECT preference_embedding INTO user_embedding 
  FROM user_profiles 
  WHERE user_id = user_id_param;
  
  IF user_embedding IS NULL THEN
    RAISE EXCEPTION 'User preference embedding not found. Please update user preferences first.';
  END IF;
  
  RETURN QUERY
  WITH preference_matches AS (
    SELECT 
      j.*,
      1 - (j.embedding <=> user_embedding) as pref_similarity
    FROM jobs j
    WHERE 
      j.is_active = true
      AND j.embedding IS NOT NULL
    ORDER BY pref_similarity DESC
    LIMIT recommendation_count * 2
  ),
  scored_recommendations AS (
    SELECT 
      pm.*,
      calculate_advanced_job_match_score(user_id_param, pm.id) as match_score
    FROM preference_matches pm
  )
  SELECT 
    sr.id as job_id,
    sr.title,
    sr.company,
    sr.location,
    sr.experience_level,
    sr.employment_type,
    sr.industry,
    sr.pref_similarity as preference_similarity,
    sr.match_score as job_match_score,
    (sr.pref_similarity * 0.3 + (sr.match_score->>'overall_score')::numeric / 100 * 0.7) as recommendation_score
  FROM scored_recommendations sr
  ORDER BY recommendation_score DESC
  LIMIT recommendation_count;
END;
$$;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS jobs_embedding_idx ON jobs USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS jobs_active_idx ON jobs (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS jobs_experience_level_idx ON jobs (experience_level);
CREATE INDEX IF NOT EXISTS jobs_employment_type_idx ON jobs (employment_type);
CREATE INDEX IF NOT EXISTS jobs_industry_idx ON jobs (industry);

-- 10. Create text search index for hybrid search
CREATE INDEX IF NOT EXISTS jobs_text_search_idx ON jobs USING gin(to_tsvector('english', title || ' ' || description || ' ' || company));

-- 11. Create trigger to update embedding timestamp when embedding is modified
CREATE OR REPLACE FUNCTION update_embedding_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.embedding_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_embedding_update_trigger ON jobs;
CREATE TRIGGER jobs_embedding_update_trigger
  BEFORE UPDATE OF embedding ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_embedding_timestamp();
