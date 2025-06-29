/*
  # Improved Job Matching System

  1. Enhanced Tables
    - Add required_skills and nice_to_have_skills to jobs table
    - Add job_title matching capabilities
    - Improve user profile structure
    
  2. Advanced Matching Algorithm
    - Skills matching with vector similarity
    - Experience soft scoring
    - Industry hierarchical matching
    - Location proximity scoring
    - Job title semantic matching
    
  3. New Functions
    - calculate_advanced_job_match_score function
    - skill_similarity function
    - industry_similarity function
*/

-- Add required skills and experience columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_skills jsonb DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS nice_to_have_skills jsonb DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_experience_years integer DEFAULT 0;

-- Add job title similarity and location coordinates
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude decimal(10,8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude decimal(11,8);

-- Enhance user profiles for better matching
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS latitude decimal(10,8);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS longitude decimal(11,8);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job_titles text[] DEFAULT '{}';

-- Create industry hierarchy table for better industry matching
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

-- Create skill similarity function using text similarity
CREATE OR REPLACE FUNCTION skill_similarity(skill1 text, skill2 text)
RETURNS decimal(3,2) AS $$
DECLARE
  similarity_score decimal(3,2);
BEGIN
  -- Normalize skills (lowercase, trim)
  skill1 := lower(trim(skill1));
  skill2 := lower(trim(skill2));
  
  -- Exact match
  IF skill1 = skill2 THEN
    RETURN 1.0;
  END IF;
  
  -- Common skill mappings
  IF (skill1 = 'javascript' AND skill2 = 'js') OR 
     (skill1 = 'js' AND skill2 = 'javascript') THEN
    RETURN 1.0;
  END IF;
  
  IF (skill1 = 'typescript' AND skill2 = 'ts') OR 
     (skill1 = 'ts' AND skill2 = 'typescript') THEN
    RETURN 1.0;
  END IF;
  
  -- React ecosystem
  IF (skill1 LIKE '%react%' AND skill2 LIKE '%react%') THEN
    RETURN 0.9;
  END IF;
  
  -- Python ecosystem
  IF (skill1 LIKE '%python%' AND skill2 LIKE '%python%') OR
     (skill1 = 'django' AND skill2 LIKE '%python%') OR
     (skill1 = 'flask' AND skill2 LIKE '%python%') THEN
    RETURN 0.85;
  END IF;
  
  -- Use PostgreSQL similarity function
  similarity_score := similarity(skill1, skill2);
  
  -- Return similarity if above threshold
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

-- Create job title similarity function
CREATE OR REPLACE FUNCTION job_title_similarity(user_titles text[], job_title text)
RETURNS decimal(3,2) AS $$
DECLARE
  user_title text;
  max_similarity decimal(3,2) := 0.0;
  current_similarity decimal(3,2);
BEGIN
  -- Handle null cases
  IF user_titles IS NULL OR array_length(user_titles, 1) IS NULL OR job_title IS NULL THEN
    RETURN 0.5;
  END IF;
  
  -- Check each user title against job title
  FOREACH user_title IN ARRAY user_titles
  LOOP
    -- Exact match
    IF lower(trim(user_title)) = lower(trim(job_title)) THEN
      RETURN 1.0;
    END IF;
    
    -- Semantic similarity for common roles
    current_similarity := 0.0;
    
    -- Developer roles
    IF (user_title ILIKE '%developer%' OR user_title ILIKE '%engineer%') AND 
       (job_title ILIKE '%developer%' OR job_title ILIKE '%engineer%') THEN
      current_similarity := 0.8;
      
      -- More specific matches
      IF (user_title ILIKE '%frontend%' OR user_title ILIKE '%front-end%') AND 
         (job_title ILIKE '%frontend%' OR job_title ILIKE '%front-end%') THEN
        current_similarity := 0.95;
      ELSIF (user_title ILIKE '%backend%' OR user_title ILIKE '%back-end%') AND 
            (job_title ILIKE '%backend%' OR job_title ILIKE '%back-end%') THEN
        current_similarity := 0.95;
      ELSIF (user_title ILIKE '%fullstack%' OR user_title ILIKE '%full-stack%') AND 
            (job_title ILIKE '%fullstack%' OR job_title ILIKE '%full-stack%') THEN
        current_similarity := 0.95;
      END IF;
    END IF;
    
    -- Use text similarity as fallback
    IF current_similarity = 0.0 THEN
      current_similarity := similarity(lower(user_title), lower(job_title));
    END IF;
    
    max_similarity := GREATEST(max_similarity, current_similarity);
  END LOOP;
  
  -- Return max similarity found, minimum 0.3 for any professional role
  RETURN GREATEST(max_similarity, 0.3);
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

-- Create the advanced job matching function
CREATE OR REPLACE FUNCTION calculate_advanced_job_match_score(user_id_param uuid, job_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  user_profile record;
  job_record record;
  user_skills record[];
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
BEGIN
  -- Get user profile and skills
  SELECT up.*, array_agg(us.*) as skills
  INTO user_profile
  FROM user_profiles up
  LEFT JOIN user_skills us ON us.user_id = up.user_id
  WHERE up.user_id = user_id_param
  GROUP BY up.id, up.user_id, up.full_name, up.title, up.bio, up.location, up.experience_years, 
           up.current_salary, up.expected_salary, up.currency, up.industry, up.work_preference, 
           up.employment_preference, up.availability, up.linkedin_url, up.github_url, 
           up.portfolio_url, up.created_at, up.updated_at, up.latitude, up.longitude, up.job_titles;
  
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
  
  -- 1. SKILLS MATCHING (35%)
  required_skills := COALESCE(job_record.required_skills, '[]'::jsonb);
  nice_to_have_skills := COALESCE(job_record.nice_to_have_skills, '[]'::jsonb);
  total_required_skills := jsonb_array_length(required_skills);
  
  IF total_required_skills > 0 THEN
    -- Check each required skill
    FOR required_skill IN SELECT * FROM jsonb_array_elements(required_skills)
    LOOP
      best_skill_match := 0;
      
      -- Find best matching user skill
      IF user_profile.skills IS NOT NULL THEN
        FOREACH user_skill IN ARRAY user_profile.skills
        LOOP
          IF user_skill.skill_name IS NOT NULL THEN
            skill_match_score := skill_similarity(user_skill.skill_name, required_skill->>'name');
            
            IF skill_match_score > best_skill_match THEN
              best_skill_match := skill_match_score;
              
              -- Calculate score based on proficiency
              IF skill_match_score >= 0.8 THEN -- Good skill match
                skill_match_score := (user_skill.proficiency_level::decimal / 5.0) * skill_match_score;
                
                -- Apply penalty if user proficiency is lower than required
                IF (required_skill->>'required_level')::integer > user_skill.proficiency_level THEN
                  skill_match_score := skill_match_score - (0.1 * ((required_skill->>'required_level')::integer - user_skill.proficiency_level));
                END IF;
                
                skill_match_score := GREATEST(skill_match_score, 0.1); -- Minimum score
              END IF;
            END IF;
          END IF;
        END LOOP;
      END IF;
      
      matched_required_skills := matched_required_skills + GREATEST(best_skill_match, 0);
    END LOOP;
    
    skills_score := (matched_required_skills / total_required_skills) * 100;
  ELSE
    skills_score := 50; -- Default if no required skills specified
  END IF;
  
  -- Add bonus for nice-to-have skills
  IF jsonb_array_length(nice_to_have_skills) > 0 AND user_profile.skills IS NOT NULL THEN
    FOR required_skill IN SELECT * FROM jsonb_array_elements(nice_to_have_skills)
    LOOP
      FOREACH user_skill IN ARRAY user_profile.skills
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
  
  -- 5. JOB TITLE MATCHING (15%)
  title_score := job_title_similarity(user_profile.job_titles, job_record.title) * 100;
  
  -- Calculate overall score with weights
  overall_score := (skills_score * 0.35) + (experience_score * 0.25) + (industry_score * 0.15) + 
                   (location_score * 0.10) + (title_score * 0.15);
  
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

-- Enable similarity extension for text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;