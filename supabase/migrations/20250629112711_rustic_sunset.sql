-- Drop the existing function first
DROP FUNCTION IF EXISTS calculate_advanced_job_match_score(uuid, uuid);

-- Create the corrected advanced job matching function
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
  
  -- 1. SKILLS MATCHING (35%)
  required_skills := COALESCE(job_record.required_skills, '[]'::jsonb);
  nice_to_have_skills := COALESCE(job_record.nice_to_have_skills, '[]'::jsonb);
  total_required_skills := jsonb_array_length(required_skills);
  
  IF total_required_skills > 0 THEN
    -- Check each required skill
    FOR required_skill IN SELECT * FROM jsonb_array_elements(required_skills)
    LOOP
      best_skill_match := 0;
      
      -- Find best matching user skill using a cursor instead of array
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