/*
  # Create skill similarity and job matching functions

  1. Functions Created
    - skill_similarity: Compares skill names with semantic understanding
    - industry_similarity: Compares industries with hierarchy support
    - calculate_distance: Calculates geographic distance between coordinates
    - calculate_advanced_job_match_score: Main job matching algorithm

  2. Extensions
    - pg_trgm: For text similarity functions

  3. Tables
    - industry_hierarchy: For industry relationship mapping

  4. Performance
    - Indexes for optimized matching queries
*/

-- Enable similarity extension for text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create industry hierarchy table if it doesn't exist
CREATE TABLE IF NOT EXISTS industry_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_name text NOT NULL,
  parent_industry text,
  similarity_score decimal(3,2) DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

-- Insert industry hierarchy data
INSERT INTO industry_hierarchy (industry_name, parent_industry, similarity_score) VALUES
('Technology', NULL, 1.0),
('Software', 'Technology', 0.9),
('SaaS', 'Software', 0.85),
('AI/ML', 'Technology', 0.8),
('Fintech', 'Technology', 0.75),
('Healthcare', NULL, 1.0),
('Biotech', 'Healthcare', 0.8),
('Pharma', 'Healthcare', 0.85),
('Finance', NULL, 1.0),
('Banking', 'Finance', 0.9),
('Investment', 'Finance', 0.85),
('Insurance', 'Finance', 0.8),
('Education', NULL, 1.0),
('EdTech', 'Education', 0.8),
('Marketing', NULL, 1.0),
('Digital Marketing', 'Marketing', 0.9),
('Sales', NULL, 1.0),
('Design', NULL, 1.0),
('UX/UI', 'Design', 0.9),
('Operations', NULL, 1.0)
ON CONFLICT DO NOTHING;

-- Create skill similarity function
CREATE OR REPLACE FUNCTION skill_similarity(skill1 text, skill2 text)
RETURNS decimal(3,2) AS $$
DECLARE
  similarity_score decimal(3,2);
  normalized_skill1 text;
  normalized_skill2 text;
BEGIN
  -- Handle null inputs
  IF skill1 IS NULL OR skill2 IS NULL THEN
    RETURN 0.0;
  END IF;
  
  -- Normalize skills (lowercase, trim, remove special characters)
  normalized_skill1 := lower(trim(regexp_replace(skill1, '[^a-zA-Z0-9\s]', '', 'g')));
  normalized_skill2 := lower(trim(regexp_replace(skill2, '[^a-zA-Z0-9\s]', '', 'g')));
  
  -- Exact match
  IF normalized_skill1 = normalized_skill2 THEN
    RETURN 1.0;
  END IF;
  
  -- Common skill mappings and aliases
  IF (normalized_skill1 = 'javascript' AND normalized_skill2 = 'js') OR 
     (normalized_skill1 = 'js' AND normalized_skill2 = 'javascript') THEN
    RETURN 1.0;
  END IF;
  
  IF (normalized_skill1 = 'typescript' AND normalized_skill2 = 'ts') OR 
     (normalized_skill1 = 'ts' AND normalized_skill2 = 'typescript') THEN
    RETURN 1.0;
  END IF;
  
  -- React ecosystem
  IF (normalized_skill1 LIKE '%react%' AND normalized_skill2 LIKE '%react%') THEN
    RETURN 0.9;
  END IF;
  
  -- Python ecosystem
  IF (normalized_skill1 LIKE '%python%' AND normalized_skill2 LIKE '%python%') OR
     (normalized_skill1 = 'django' AND normalized_skill2 LIKE '%python%') OR
     (normalized_skill1 = 'flask' AND normalized_skill2 LIKE '%python%') OR
     (normalized_skill1 LIKE '%python%' AND normalized_skill2 = 'django') OR
     (normalized_skill1 LIKE '%python%' AND normalized_skill2 = 'flask') THEN
    RETURN 0.85;
  END IF;
  
  -- Java ecosystem
  IF (normalized_skill1 LIKE '%java%' AND normalized_skill2 LIKE '%java%' AND 
      normalized_skill1 NOT LIKE '%javascript%' AND normalized_skill2 NOT LIKE '%javascript%') THEN
    RETURN 0.9;
  END IF;
  
  -- Database similarities
  IF (normalized_skill1 LIKE '%sql%' AND normalized_skill2 LIKE '%sql%') OR
     (normalized_skill1 = 'mysql' AND normalized_skill2 = 'postgresql') OR
     (normalized_skill1 = 'postgresql' AND normalized_skill2 = 'mysql') THEN
    RETURN 0.8;
  END IF;
  
  -- Cloud platform similarities
  IF (normalized_skill1 = 'aws' AND normalized_skill2 = 'azure') OR
     (normalized_skill1 = 'azure' AND normalized_skill2 = 'aws') OR
     (normalized_skill1 = 'gcp' AND normalized_skill2 = 'aws') OR
     (normalized_skill1 = 'aws' AND normalized_skill2 = 'gcp') THEN
    RETURN 0.7;
  END IF;
  
  -- Frontend framework similarities
  IF (normalized_skill1 = 'angular' AND normalized_skill2 = 'vue') OR
     (normalized_skill1 = 'vue' AND normalized_skill2 = 'angular') OR
     (normalized_skill1 = 'react' AND normalized_skill2 = 'vue') OR
     (normalized_skill1 = 'vue' AND normalized_skill2 = 'react') THEN
    RETURN 0.75;
  END IF;
  
  -- Use PostgreSQL similarity function for general text similarity
  similarity_score := similarity(normalized_skill1, normalized_skill2);
  
  -- Return similarity if above threshold, otherwise 0
  IF similarity_score > 0.6 THEN
    RETURN similarity_score;
  END IF;
  
  RETURN 0.0;
END;
$$ LANGUAGE plpgsql;

-- Create industry similarity function
CREATE OR REPLACE FUNCTION industry_similarity(user_industry text, job_industry text)
RETURNS decimal(3,2) AS $$
DECLARE
  similarity_score decimal(3,2) := 0.3;
BEGIN
  -- Handle null cases
  IF user_industry IS NULL OR job_industry IS NULL THEN
    RETURN 0.5;
  END IF;
  
  -- Exact match
  IF lower(user_industry) = lower(job_industry) THEN
    RETURN 1.0;
  END IF;
  
  -- Check hierarchy relationships
  SELECT COALESCE(MAX(ih.similarity_score), 0.3) INTO similarity_score
  FROM industry_hierarchy ih
  WHERE (lower(ih.industry_name) = lower(user_industry) AND lower(ih.parent_industry) = lower(job_industry))
     OR (lower(ih.industry_name) = lower(job_industry) AND lower(ih.parent_industry) = lower(user_industry))
     OR (ih.parent_industry IS NOT NULL AND 
         lower(ih.parent_industry) = (SELECT lower(parent_industry) FROM industry_hierarchy WHERE lower(industry_name) = lower(user_industry)));
  
  RETURN similarity_score;
END;
$$ LANGUAGE plpgsql;

-- Create distance calculation function
CREATE OR REPLACE FUNCTION calculate_distance(lat1 decimal, lon1 decimal, lat2 decimal, lon2 decimal)
RETURNS decimal AS $$
DECLARE
  earth_radius decimal := 6371; -- Earth radius in kilometers
  dlat decimal;
  dlon decimal;
  a decimal;
  c decimal;
BEGIN
  -- Handle null coordinates
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN 1000; -- Default distance for unknown locations
  END IF;
  
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Create enhanced job title similarity function
CREATE OR REPLACE FUNCTION job_title_similarity(user_titles text[], job_title text)
RETURNS decimal(3,2) AS $$
DECLARE
  user_title text;
  max_similarity decimal(3,2) := 0.0;
  current_similarity decimal(3,2);
  normalized_user_title text;
  normalized_job_title text;
  
  -- Keywords for different role categories
  dev_keywords text[] := ARRAY['developer', 'engineer', 'programmer', 'coder', 'dev'];
  frontend_keywords text[] := ARRAY['frontend', 'front-end', 'front end', 'ui', 'client-side'];
  backend_keywords text[] := ARRAY['backend', 'back-end', 'back end', 'server-side', 'api'];
  fullstack_keywords text[] := ARRAY['fullstack', 'full-stack', 'full stack', 'full-stack developer'];
  senior_keywords text[] := ARRAY['senior', 'sr', 'lead', 'principal', 'staff', 'architect'];
  junior_keywords text[] := ARRAY['junior', 'jr', 'entry', 'associate', 'trainee', 'intern'];
  manager_keywords text[] := ARRAY['manager', 'lead', 'head', 'director', 'supervisor', 'team lead'];
  
  -- Specialty keywords
  mobile_keywords text[] := ARRAY['mobile', 'ios', 'android', 'react native', 'flutter'];
  data_keywords text[] := ARRAY['data', 'analytics', 'scientist', 'analyst', 'ml', 'ai'];
  devops_keywords text[] := ARRAY['devops', 'sre', 'infrastructure', 'cloud', 'platform'];
  qa_keywords text[] := ARRAY['qa', 'test', 'quality', 'automation'];
  design_keywords text[] := ARRAY['design', 'ux', 'ui', 'product design', 'visual'];
  
  keyword text;
  user_has_keyword boolean;
  job_has_keyword boolean;
  category_match_count integer;
BEGIN
  -- Handle null cases
  IF user_titles IS NULL OR array_length(user_titles, 1) IS NULL OR job_title IS NULL THEN
    RETURN 0.3; -- Lower default for missing data
  END IF;
  
  normalized_job_title := lower(trim(regexp_replace(job_title, '[^a-zA-Z0-9\s]', ' ', 'g')));
  
  -- Check each user title against job title
  FOREACH user_title IN ARRAY user_titles
  LOOP
    normalized_user_title := lower(trim(regexp_replace(user_title, '[^a-zA-Z0-9\s]', ' ', 'g')));
    
    -- Exact match (after normalization)
    IF normalized_user_title = normalized_job_title THEN
      RETURN 1.0;
    END IF;
    
    -- High similarity using PostgreSQL similarity
    current_similarity := similarity(normalized_user_title, normalized_job_title);
    IF current_similarity >= 0.8 THEN
      max_similarity := GREATEST(max_similarity, current_similarity);
      CONTINUE;
    END IF;
    
    -- Semantic category matching
    category_match_count := 0;
    
    -- Check development roles
    user_has_keyword := FALSE;
    job_has_keyword := FALSE;
    FOREACH keyword IN ARRAY dev_keywords
    LOOP
      IF normalized_user_title LIKE '%' || keyword || '%' THEN user_has_keyword := TRUE; END IF;
      IF normalized_job_title LIKE '%' || keyword || '%' THEN job_has_keyword := TRUE; END IF;
    END LOOP;
    IF user_has_keyword AND job_has_keyword THEN 
      category_match_count := category_match_count + 1;
    END IF;
    
    -- Check frontend specialization
    user_has_keyword := FALSE;
    job_has_keyword := FALSE;
    FOREACH keyword IN ARRAY frontend_keywords
    LOOP
      IF normalized_user_title LIKE '%' || keyword || '%' THEN user_has_keyword := TRUE; END IF;
      IF normalized_job_title LIKE '%' || keyword || '%' THEN job_has_keyword := TRUE; END IF;
    END LOOP;
    IF user_has_keyword AND job_has_keyword THEN 
      category_match_count := category_match_count + 2; -- Higher weight for specialization match
    END IF;
    
    -- Check backend specialization
    user_has_keyword := FALSE;
    job_has_keyword := FALSE;
    FOREACH keyword IN ARRAY backend_keywords
    LOOP
      IF normalized_user_title LIKE '%' || keyword || '%' THEN user_has_keyword := TRUE; END IF;
      IF normalized_job_title LIKE '%' || keyword || '%' THEN job_has_keyword := TRUE; END IF;
    END LOOP;
    IF user_has_keyword AND job_has_keyword THEN 
      category_match_count := category_match_count + 2;
    END IF;
    
    -- Check seniority level
    user_has_keyword := FALSE;
    job_has_keyword := FALSE;
    FOREACH keyword IN ARRAY senior_keywords
    LOOP
      IF normalized_user_title LIKE '%' || keyword || '%' THEN user_has_keyword := TRUE; END IF;
      IF normalized_job_title LIKE '%' || keyword || '%' THEN job_has_keyword := TRUE; END IF;
    END LOOP;
    IF user_has_keyword AND job_has_keyword THEN 
      category_match_count := category_match_count + 1;
    END IF;
    
    -- Calculate similarity based on category matches
    IF category_match_count > 0 THEN
      current_similarity := LEAST(0.6 + (category_match_count::decimal / 10.0), 0.95);
      current_similarity := current_similarity + (similarity(normalized_user_title, normalized_job_title) * 0.1);
      current_similarity := LEAST(current_similarity, 0.98);
    ELSE
      current_similarity := similarity(normalized_user_title, normalized_job_title);
      
      -- Boost if both contain common professional terms
      IF (normalized_user_title LIKE '%engineer%' OR normalized_user_title LIKE '%developer%' OR 
          normalized_user_title LIKE '%manager%' OR normalized_user_title LIKE '%analyst%') AND
         (normalized_job_title LIKE '%engineer%' OR normalized_job_title LIKE '%developer%' OR 
          normalized_job_title LIKE '%manager%' OR normalized_job_title LIKE '%analyst%') THEN
        current_similarity := GREATEST(current_similarity, 0.4);
      END IF;
    END IF;
    
    max_similarity := GREATEST(max_similarity, current_similarity);
  END LOOP;
  
  -- Ensure minimum score for any professional role match
  RETURN GREATEST(max_similarity, 0.2);
END;
$$ LANGUAGE plpgsql;

-- Create the main job matching function
CREATE OR REPLACE FUNCTION calculate_advanced_job_match_score(user_id_param uuid, job_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  user_profile record;
  job_record record;
  required_skills jsonb;
  nice_to_have_skills jsonb;
  
  -- Score components
  skills_score decimal := 0;
  experience_score decimal := 0;
  industry_score decimal := 0;
  location_score decimal := 0;
  title_score decimal := 0;
  
  -- Intermediate calculations
  total_required_skills integer := 0;
  matched_required_skills decimal := 0;
  skill_bonus decimal := 0;
  
  required_skill jsonb;
  user_skill record;
  skill_match_score decimal;
  best_skill_match decimal;
  
  target_years integer;
  experience_gap integer;
  gap_penalty decimal;
  
  distance_km decimal;
  proximity_score decimal;
  
  overall_score decimal;
  title_weight decimal := 0.15; -- Default weight
  skills_weight decimal := 0.35; -- Default weight
BEGIN
  -- Get user profile
  SELECT * INTO user_profile
  FROM user_profiles 
  WHERE user_id = user_id_param;
  
  -- Get job details
  SELECT * INTO job_record FROM jobs WHERE id = job_id_param;
  
  -- Handle missing data
  IF user_profile IS NULL OR job_record IS NULL THEN
    RETURN jsonb_build_object(
      'overall_score', 0,
      'skills_match', 0,
      'experience_match', 0,
      'industry_match', 0,
      'location_match', 0,
      'title_match', 0,
      'error', 'Missing user profile or job data'
    );
  END IF;
  
  -- 5. JOB TITLE MATCHING (Calculate first to adjust weights)
  title_score := job_title_similarity(user_profile.job_titles, job_record.title) * 100;
  
  -- Adjust weights based on title match strength
  IF title_score >= 90 THEN
    -- Strong title match: increase title weight, decrease skills weight slightly
    title_weight := 0.20;
    skills_weight := 0.30;
  ELSIF title_score >= 70 THEN
    -- Good title match: slight increase in title weight
    title_weight := 0.18;
    skills_weight := 0.32;
  END IF;
  
  -- 1. SKILLS MATCHING
  required_skills := COALESCE(job_record.required_skills, '[]'::jsonb);
  nice_to_have_skills := COALESCE(job_record.nice_to_have_skills, '[]'::jsonb);
  total_required_skills := jsonb_array_length(required_skills);
  
  IF total_required_skills > 0 THEN
    -- Check each required skill
    FOR required_skill IN SELECT * FROM jsonb_array_elements(required_skills)
    LOOP
      best_skill_match := 0;
      
      -- Find best matching user skill
      FOR user_skill IN 
        SELECT * FROM user_skills WHERE user_id = user_id_param
      LOOP
        IF user_skill.skill_name IS NOT NULL THEN
          skill_match_score := skill_similarity(user_skill.skill_name, required_skill->>'name');
          
          IF skill_match_score > best_skill_match THEN
            best_skill_match := skill_match_score;
            
            -- Calculate score based on proficiency
            IF skill_match_score >= 0.8 THEN -- Good skill match
              skill_match_score := (user_skill.proficiency_level::decimal / 5.0) * skill_match_score;
              
              -- Apply penalty if user proficiency is lower than required
              IF (required_skill->>'required_level') IS NOT NULL AND 
                 (required_skill->>'required_level')::integer > user_skill.proficiency_level THEN
                skill_match_score := skill_match_score - (0.1 * ((required_skill->>'required_level')::integer - user_skill.proficiency_level));
              END IF;
              
              skill_match_score := GREATEST(skill_match_score, 0.1); -- Minimum score
            END IF;
          END IF;
        END IF;
      END LOOP;
      
      matched_required_skills := matched_required_skills + GREATEST(best_skill_match, 0);
    END LOOP;
    
    skills_score := (matched_required_skills / total_required_skills) * 100;
  ELSE
    skills_score := 50; -- Default if no required skills specified
  END IF;
  
  -- Add bonus for nice-to-have skills
  IF jsonb_array_length(nice_to_have_skills) > 0 THEN
    FOR required_skill IN SELECT * FROM jsonb_array_elements(nice_to_have_skills)
    LOOP
      FOR user_skill IN 
        SELECT * FROM user_skills WHERE user_id = user_id_param
      LOOP
        IF user_skill.skill_name IS NOT NULL THEN
          skill_match_score := skill_similarity(user_skill.skill_name, required_skill->>'name');
          IF skill_match_score >= 0.8 THEN
            skill_bonus := skill_bonus + (0.2 * skill_match_score);
          END IF;
        END IF;
      END LOOP;
    END LOOP;
  END IF;
  
  skills_score := LEAST(skills_score + skill_bonus, 100);
  
  -- 2. EXPERIENCE MATCHING (25%)
  target_years := CASE 
    WHEN job_record.experience_level = 'entry' THEN 1
    WHEN job_record.experience_level = 'mid' THEN 3
    WHEN job_record.experience_level = 'senior' THEN 6
    WHEN job_record.experience_level = 'lead' THEN 8
    ELSE COALESCE(job_record.required_experience_years, 2)
  END;
  
  experience_gap := abs(COALESCE(user_profile.experience_years, 0) - target_years);
  
  gap_penalty := CASE 
    WHEN job_record.experience_level IN ('entry', 'mid') THEN 10
    ELSE 5
  END;
  
  experience_score := GREATEST(100 - (gap_penalty * experience_gap), 30);
  
  -- 3. INDUSTRY MATCHING (15%)
  industry_score := industry_similarity(user_profile.industry, job_record.industry) * 100;
  
  -- 4. LOCATION/WORK TYPE MATCHING (10%)
  IF job_record.work_type = 'remote' OR user_profile.work_preference = 'remote' THEN
    location_score := 100;
  ELSIF user_profile.work_preference = 'any' THEN
    location_score := 90;
  ELSE
    -- Calculate proximity score
    distance_km := calculate_distance(
      user_profile.latitude, user_profile.longitude,
      job_record.latitude, job_record.longitude
    );
    
    proximity_score := GREATEST((1 - distance_km / 2000.0) * 100, 30);
    
    -- Apply preference mismatch penalty
    IF user_profile.work_preference != job_record.work_type THEN
      proximity_score := proximity_score * 0.7;
    END IF;
    
    location_score := LEAST(proximity_score, 90);
  END IF;
  
  -- Calculate overall score with dynamic weights
  overall_score := (skills_score * skills_weight) + (experience_score * 0.25) + (industry_score * 0.15) + 
                   (location_score * 0.10) + (title_score * title_weight);
  
  -- Round to integer
  overall_score := round(overall_score);
  skills_score := round(skills_score);
  experience_score := round(experience_score);
  industry_score := round(industry_score);
  location_score := round(location_score);
  title_score := round(title_score);
  
  RETURN jsonb_build_object(
    'overall_score', overall_score,
    'skills_match', skills_score,
    'experience_match', experience_score,
    'industry_match', industry_score,
    'location_match', location_score,
    'title_match', title_score
  );
END;
$$ LANGUAGE plpgsql;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_jobs_required_skills ON jobs USING GIN (required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_nice_to_have_skills ON jobs USING GIN (nice_to_have_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs (experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs (industry);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON user_skills (skill_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON user_profiles (industry);