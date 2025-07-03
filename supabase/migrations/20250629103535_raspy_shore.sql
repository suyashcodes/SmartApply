/*
  # Job System with User Profiles and Matching

  1. New Tables
    - `jobs` - Job listings with all details
    - `user_profiles` - User experience, skills, and preferences
    - `job_applications` - Track user applications to jobs
    - `user_skills` - User skills with proficiency levels
    - `job_skills` - Required skills for jobs

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access

  3. Sample Data
    - 30 dummy jobs across different industries
    - Sample user profile structure
*/

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  company_logo text,
  description text NOT NULL,
  requirements text NOT NULL,
  location text NOT NULL,
  work_type text NOT NULL DEFAULT 'remote', -- remote, onsite, hybrid
  employment_type text NOT NULL DEFAULT 'full_time', -- full_time, part_time, contract, internship
  experience_level text NOT NULL DEFAULT 'entry', -- entry, mid, senior, lead
  salary_min integer,
  salary_max integer,
  currency text DEFAULT 'USD',
  industry text NOT NULL,
  department text,
  posted_date timestamptz DEFAULT now(),
  application_deadline timestamptz,
  is_active boolean DEFAULT true,
  applicant_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  title text,
  bio text,
  location text,
  experience_years integer DEFAULT 0,
  current_salary integer,
  expected_salary integer,
  currency text DEFAULT 'USD',
  industry text,
  work_preference text DEFAULT 'remote', -- remote, onsite, hybrid, any
  employment_preference text DEFAULT 'full_time', -- full_time, part_time, contract, any
  availability text DEFAULT 'immediate', -- immediate, 2_weeks, 1_month, 3_months
  linkedin_url text,
  github_url text,
  portfolio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency_level integer NOT NULL CHECK (proficiency_level >= 1 AND proficiency_level <= 5), -- 1-5 scale
  years_experience integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- Create job_skills table
CREATE TABLE IF NOT EXISTS job_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  required_level integer NOT NULL CHECK (required_level >= 1 AND required_level <= 5), -- 1-5 scale
  is_required boolean DEFAULT true, -- true for required, false for nice-to-have
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, skill_name)
);

-- Create job_applications table (different from existing applications table)
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  status text DEFAULT 'applied', -- applied, reviewed, interview, rejected, hired
  applied_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs (public read, admin write)
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_skills
CREATE POLICY "Users can manage their own skills"
  ON user_skills FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for job_skills (public read)
CREATE POLICY "Anyone can view job skills"
  ON job_skills FOR SELECT
  USING (true);

-- RLS Policies for job_applications
CREATE POLICY "Users can manage their own applications"
  ON job_applications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample jobs
INSERT INTO jobs (title, company, company_logo, description, requirements, location, work_type, employment_type, experience_level, salary_min, salary_max, industry, department, applicant_count) VALUES
('Senior Software Engineer', 'TechCorp', 'https://via.placeholder.com/100x100?text=TC', 'We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications.', 'Bachelor''s degree in Computer Science, 5+ years of experience in software development, proficiency in React, Node.js, and cloud technologies.', 'San Francisco, CA', 'hybrid', 'full_time', 'senior', 120000, 180000, 'Technology', 'Engineering', 45),

('Product Manager', 'InnovateLabs', 'https://via.placeholder.com/100x100?text=IL', 'Join our product team to drive the development of cutting-edge AI solutions. Lead cross-functional teams and define product strategy.', 'MBA or equivalent experience, 3+ years in product management, experience with AI/ML products, strong analytical skills.', 'New York, NY', 'remote', 'full_time', 'mid', 90000, 140000, 'Technology', 'Product', 67),

('Data Scientist', 'DataDriven Inc', 'https://via.placeholder.com/100x100?text=DD', 'Analyze complex datasets to drive business insights and build predictive models. Work with machine learning algorithms and statistical analysis.', 'PhD in Statistics/Math/CS, 2+ years experience, Python, R, SQL, machine learning frameworks.', 'Austin, TX', 'remote', 'full_time', 'mid', 95000, 150000, 'Technology', 'Data Science', 89),

('UX Designer', 'DesignStudio', 'https://via.placeholder.com/100x100?text=DS', 'Create intuitive and beautiful user experiences for our mobile and web applications. Collaborate with product and engineering teams.', 'Bachelor''s in Design, 3+ years UX experience, proficiency in Figma, Sketch, user research experience.', 'Los Angeles, CA', 'hybrid', 'full_time', 'mid', 75000, 120000, 'Technology', 'Design', 34),

('DevOps Engineer', 'CloudFirst', 'https://via.placeholder.com/100x100?text=CF', 'Build and maintain CI/CD pipelines, manage cloud infrastructure, and ensure system reliability and scalability.', 'Bachelor''s degree, 4+ years DevOps experience, AWS/Azure, Docker, Kubernetes, Terraform.', 'Seattle, WA', 'remote', 'full_time', 'senior', 110000, 160000, 'Technology', 'Infrastructure', 23),

('Frontend Developer', 'WebSolutions', 'https://via.placeholder.com/100x100?text=WS', 'Develop responsive and interactive web applications using modern JavaScript frameworks. Focus on performance and user experience.', '2+ years frontend development, React/Vue/Angular, HTML5, CSS3, JavaScript ES6+, responsive design.', 'Remote', 'remote', 'full_time', 'mid', 70000, 110000, 'Technology', 'Engineering', 78),

('Marketing Manager', 'GrowthCo', 'https://via.placeholder.com/100x100?text=GC', 'Lead digital marketing campaigns, analyze performance metrics, and drive customer acquisition strategies.', 'Bachelor''s in Marketing, 3+ years experience, Google Analytics, SEO/SEM, content marketing, social media.', 'Chicago, IL', 'hybrid', 'full_time', 'mid', 65000, 95000, 'Marketing', 'Growth', 56),

('Backend Developer', 'ServerTech', 'https://via.placeholder.com/100x100?text=ST', 'Design and implement scalable backend services and APIs. Work with databases, microservices, and cloud platforms.', 'Bachelor''s degree, 3+ years backend development, Python/Java/Go, SQL/NoSQL, REST APIs, microservices.', 'Boston, MA', 'remote', 'full_time', 'mid', 85000, 130000, 'Technology', 'Engineering', 42),

('Sales Representative', 'SalesForce Pro', 'https://via.placeholder.com/100x100?text=SF', 'Drive revenue growth by identifying and closing new business opportunities. Build relationships with enterprise clients.', 'Bachelor''s degree, 2+ years B2B sales experience, CRM proficiency, excellent communication skills.', 'Miami, FL', 'hybrid', 'full_time', 'mid', 50000, 80000, 'Sales', 'Business Development', 91),

('Cybersecurity Analyst', 'SecureNet', 'https://via.placeholder.com/100x100?text=SN', 'Monitor and protect organizational systems from cyber threats. Conduct security assessments and incident response.', 'Bachelor''s in Cybersecurity/IT, 2+ years experience, CISSP/CEH certification preferred, network security, SIEM tools.', 'Washington, DC', 'onsite', 'full_time', 'mid', 75000, 115000, 'Technology', 'Security', 29),

('Machine Learning Engineer', 'AI Innovations', 'https://via.placeholder.com/100x100?text=AI', 'Build and deploy machine learning models at scale. Work on computer vision, NLP, and recommendation systems.', 'Master''s in CS/ML, 3+ years ML experience, Python, TensorFlow/PyTorch, MLOps, cloud platforms.', 'San Francisco, CA', 'hybrid', 'full_time', 'senior', 130000, 200000, 'Technology', 'AI/ML', 67),

('Content Writer', 'ContentCraft', 'https://via.placeholder.com/100x100?text=CC', 'Create engaging content for blogs, social media, and marketing campaigns. Research and write on various technology topics.', 'Bachelor''s in English/Journalism, 2+ years writing experience, SEO knowledge, content management systems.', 'Remote', 'remote', 'full_time', 'entry', 40000, 65000, 'Marketing', 'Content', 123),

('Business Analyst', 'AnalyticsPro', 'https://via.placeholder.com/100x100?text=AP', 'Analyze business processes and requirements. Create documentation and work with stakeholders to improve efficiency.', 'Bachelor''s degree, 2+ years BA experience, SQL, Excel, process mapping, stakeholder management.', 'Denver, CO', 'hybrid', 'full_time', 'mid', 60000, 90000, 'Business', 'Analysis', 45),

('Mobile Developer', 'AppMakers', 'https://via.placeholder.com/100x100?text=AM', 'Develop native and cross-platform mobile applications for iOS and Android. Focus on performance and user experience.', 'Bachelor''s degree, 3+ years mobile development, React Native/Flutter or Swift/Kotlin, mobile UI/UX principles.', 'Portland, OR', 'remote', 'full_time', 'mid', 80000, 125000, 'Technology', 'Mobile', 38),

('HR Generalist', 'PeopleFirst', 'https://via.placeholder.com/100x100?text=PF', 'Support all aspects of human resources including recruitment, employee relations, and policy implementation.', 'Bachelor''s in HR/Business, 2+ years HR experience, SHRM certification preferred, HRIS systems, employment law.', 'Atlanta, GA', 'hybrid', 'full_time', 'mid', 50000, 75000, 'Human Resources', 'People Operations', 67),

('Quality Assurance Engineer', 'TestPro', 'https://via.placeholder.com/100x100?text=TP', 'Design and execute test plans for web and mobile applications. Automate testing processes and ensure product quality.', 'Bachelor''s degree, 2+ years QA experience, test automation tools, Selenium, API testing, bug tracking systems.', 'Phoenix, AZ', 'remote', 'full_time', 'mid', 65000, 95000, 'Technology', 'Quality Assurance', 34),

('Financial Analyst', 'FinanceHub', 'https://via.placeholder.com/100x100?text=FH', 'Analyze financial data, create reports, and support business decision-making. Work with budgets and forecasting models.', 'Bachelor''s in Finance/Accounting, 2+ years experience, Excel, financial modeling, SQL, CFA preferred.', 'New York, NY', 'hybrid', 'full_time', 'mid', 70000, 100000, 'Finance', 'Analysis', 56),

('Project Manager', 'ProjectLead', 'https://via.placeholder.com/100x100?text=PL', 'Lead cross-functional teams to deliver projects on time and within budget. Manage stakeholder communication and project scope.', 'Bachelor''s degree, 3+ years PM experience, PMP certification preferred, Agile/Scrum, project management tools.', 'Dallas, TX', 'hybrid', 'full_time', 'senior', 80000, 120000, 'Management', 'Project Management', 78),

('Graphic Designer', 'CreativeWorks', 'https://via.placeholder.com/100x100?text=CW', 'Create visual designs for digital and print media. Work on branding, marketing materials, and user interface elements.', 'Bachelor''s in Graphic Design, 2+ years experience, Adobe Creative Suite, typography, brand design, web design.', 'San Diego, CA', 'hybrid', 'full_time', 'mid', 45000, 70000, 'Design', 'Creative', 89),

('Network Administrator', 'NetSystems', 'https://via.placeholder.com/100x100?text=NS', 'Maintain and troubleshoot network infrastructure. Ensure network security and optimal performance.', 'Bachelor''s in IT/Networking, 3+ years experience, Cisco certifications, network protocols, firewall management.', 'Houston, TX', 'onsite', 'full_time', 'mid', 60000, 85000, 'Technology', 'Infrastructure', 23),

('Customer Success Manager', 'ClientCare', 'https://via.placeholder.com/100x100?text=CC', 'Build relationships with customers to ensure satisfaction and retention. Provide support and identify growth opportunities.', 'Bachelor''s degree, 2+ years customer success experience, CRM systems, excellent communication, problem-solving.', 'Remote', 'remote', 'full_time', 'mid', 55000, 85000, 'Customer Success', 'Support', 67),

('Software Architect', 'ArchTech', 'https://via.placeholder.com/100x100?text=AT', 'Design high-level software architecture and technical solutions. Lead technical decision-making and mentor development teams.', 'Master''s degree preferred, 7+ years experience, system design, microservices, cloud architecture, leadership skills.', 'San Francisco, CA', 'hybrid', 'full_time', 'senior', 150000, 220000, 'Technology', 'Architecture', 34),

('Social Media Manager', 'SocialBuzz', 'https://via.placeholder.com/100x100?text=SB', 'Manage social media presence across multiple platforms. Create content strategies and engage with online communities.', 'Bachelor''s in Marketing/Communications, 2+ years social media experience, content creation, analytics tools.', 'Los Angeles, CA', 'remote', 'full_time', 'mid', 45000, 70000, 'Marketing', 'Social Media', 112),

('Database Administrator', 'DataSafe', 'https://via.placeholder.com/100x100?text=DS', 'Manage and optimize database systems. Ensure data security, backup procedures, and performance tuning.', 'Bachelor''s in CS/IT, 3+ years DBA experience, SQL Server/Oracle/PostgreSQL, database security, performance optimization.', 'Chicago, IL', 'hybrid', 'full_time', 'senior', 85000, 125000, 'Technology', 'Database', 45),

('Operations Manager', 'OptiFlow', 'https://via.placeholder.com/100x100?text=OF', 'Oversee daily operations and improve business processes. Manage teams and ensure operational efficiency.', 'Bachelor''s degree, 4+ years operations experience, process improvement, team management, analytical skills.', 'Nashville, TN', 'hybrid', 'full_time', 'senior', 75000, 110000, 'Operations', 'Management', 56),

('Technical Writer', 'DocuTech', 'https://via.placeholder.com/100x100?text=DT', 'Create technical documentation, user guides, and API documentation. Work closely with engineering teams.', 'Bachelor''s degree, 2+ years technical writing experience, documentation tools, API documentation, software knowledge.', 'Remote', 'remote', 'full_time', 'mid', 55000, 85000, 'Technology', 'Documentation', 67),

('Research Scientist', 'InnovateLab', 'https://via.placeholder.com/100x100?text=IL', 'Conduct research in artificial intelligence and machine learning. Publish findings and develop innovative algorithms.', 'PhD in CS/ML/Math, 2+ years research experience, publications, Python, research methodologies, innovation.', 'Boston, MA', 'hybrid', 'full_time', 'senior', 120000, 180000, 'Research', 'AI/ML', 23),

('Supply Chain Analyst', 'LogiFlow', 'https://via.placeholder.com/100x100?text=LF', 'Analyze supply chain data and optimize logistics processes. Work with vendors and internal teams to improve efficiency.', 'Bachelor''s in Supply Chain/Business, 2+ years experience, data analysis, ERP systems, logistics knowledge.', 'Memphis, TN', 'hybrid', 'full_time', 'mid', 55000, 80000, 'Supply Chain', 'Logistics', 34),

('Cloud Engineer', 'CloudScale', 'https://via.placeholder.com/100x100?text=CS', 'Design and implement cloud infrastructure solutions. Work with AWS, Azure, and Google Cloud platforms.', 'Bachelor''s degree, 3+ years cloud experience, AWS/Azure certifications, Infrastructure as Code, containerization.', 'Seattle, WA', 'remote', 'full_time', 'senior', 100000, 150000, 'Technology', 'Cloud', 45),

('Legal Counsel', 'LawTech', 'https://via.placeholder.com/100x100?text=LT', 'Provide legal advice on technology and business matters. Review contracts and ensure regulatory compliance.', 'JD degree, 3+ years legal experience, technology law, contract negotiation, regulatory compliance, bar admission.', 'San Francisco, CA', 'hybrid', 'full_time', 'senior', 130000, 200000, 'Legal', 'Corporate Law', 12);

-- Insert sample job skills
INSERT INTO job_skills (job_id, skill_name, required_level, is_required) 
SELECT j.id, skill_data.skill_name, skill_data.required_level, skill_data.is_required
FROM jobs j
CROSS JOIN (
  VALUES 
    ('JavaScript', 4, true),
    ('React', 4, true),
    ('Node.js', 3, true),
    ('Python', 3, false),
    ('AWS', 3, false)
) AS skill_data(skill_name, required_level, is_required)
WHERE j.title = 'Senior Software Engineer'
LIMIT 5;

-- Add more job skills for other positions
INSERT INTO job_skills (job_id, skill_name, required_level, is_required)
SELECT j.id, 'Product Management', 4, true FROM jobs j WHERE j.title = 'Product Manager'
UNION ALL
SELECT j.id, 'Data Analysis', 3, true FROM jobs j WHERE j.title = 'Product Manager'
UNION ALL
SELECT j.id, 'Python', 5, true FROM jobs j WHERE j.title = 'Data Scientist'
UNION ALL
SELECT j.id, 'Machine Learning', 4, true FROM jobs j WHERE j.title = 'Data Scientist'
UNION ALL
SELECT j.id, 'SQL', 4, true FROM jobs j WHERE j.title = 'Data Scientist'
UNION ALL
SELECT j.id, 'Figma', 4, true FROM jobs j WHERE j.title = 'UX Designer'
UNION ALL
SELECT j.id, 'User Research', 3, true FROM jobs j WHERE j.title = 'UX Designer'
UNION ALL
SELECT j.id, 'Docker', 4, true FROM jobs j WHERE j.title = 'DevOps Engineer'
UNION ALL
SELECT j.id, 'Kubernetes', 4, true FROM jobs j WHERE j.title = 'DevOps Engineer'
UNION ALL
SELECT j.id, 'AWS', 4, true FROM jobs j WHERE j.title = 'DevOps Engineer';

-- Create function to calculate job match score
CREATE OR REPLACE FUNCTION calculate_job_match_score(user_id_param uuid, job_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  user_profile_data user_profiles%ROWTYPE;
  job_data jobs%ROWTYPE;
  skill_match_score integer := 0;
  exp_match_score integer := 0;
  industry_match_score integer := 0;
  location_match_score integer := 0;
  overall_score integer := 0;
  total_required_skills integer := 0;
  matched_skills integer := 0;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile_data FROM user_profiles WHERE user_id = user_id_param;
  
  -- Get job data
  SELECT * INTO job_data FROM jobs WHERE id = job_id_param;
  
  -- Calculate skill match
  SELECT COUNT(*) INTO total_required_skills 
  FROM job_skills js 
  WHERE js.job_id = job_id_param AND js.is_required = true;
  
  SELECT COUNT(*) INTO matched_skills
  FROM job_skills js
  JOIN user_skills us ON js.skill_name = us.skill_name
  WHERE js.job_id = job_id_param 
    AND us.user_id = user_id_param
    AND js.is_required = true
    AND us.proficiency_level >= js.required_level;
  
  IF total_required_skills > 0 THEN
    skill_match_score := (matched_skills * 100) / total_required_skills;
  ELSE
    skill_match_score := 100;
  END IF;
  
  -- Calculate experience match
  IF user_profile_data.experience_years IS NOT NULL THEN
    CASE job_data.experience_level
      WHEN 'entry' THEN
        IF user_profile_data.experience_years >= 0 AND user_profile_data.experience_years <= 2 THEN
          exp_match_score := 100;
        ELSIF user_profile_data.experience_years <= 5 THEN
          exp_match_score := 80;
        ELSE
          exp_match_score := 60;
        END IF;
      WHEN 'mid' THEN
        IF user_profile_data.experience_years >= 2 AND user_profile_data.experience_years <= 5 THEN
          exp_match_score := 100;
        ELSIF user_profile_data.experience_years >= 1 AND user_profile_data.experience_years <= 7 THEN
          exp_match_score := 80;
        ELSE
          exp_match_score := 50;
        END IF;
      WHEN 'senior' THEN
        IF user_profile_data.experience_years >= 5 THEN
          exp_match_score := 100;
        ELSIF user_profile_data.experience_years >= 3 THEN
          exp_match_score := 70;
        ELSE
          exp_match_score := 30;
        END IF;
      WHEN 'lead' THEN
        IF user_profile_data.experience_years >= 8 THEN
          exp_match_score := 100;
        ELSIF user_profile_data.experience_years >= 5 THEN
          exp_match_score := 70;
        ELSE
          exp_match_score := 20;
        END IF;
      ELSE
        exp_match_score := 50;
    END CASE;
  ELSE
    exp_match_score := 50;
  END IF;
  
  -- Calculate industry match
  IF user_profile_data.industry IS NOT NULL AND job_data.industry IS NOT NULL THEN
    IF user_profile_data.industry = job_data.industry THEN
      industry_match_score := 100;
    ELSE
      industry_match_score := 30;
    END IF;
  ELSE
    industry_match_score := 50;
  END IF;
  
  -- Calculate location match (simplified)
  IF user_profile_data.work_preference = 'remote' OR job_data.work_type = 'remote' THEN
    location_match_score := 100;
  ELSIF user_profile_data.work_preference = 'any' THEN
    location_match_score := 90;
  ELSE
    location_match_score := 70;
  END IF;
  
  -- Calculate overall score (weighted average)
  overall_score := (skill_match_score * 40 + exp_match_score * 30 + industry_match_score * 20 + location_match_score * 10) / 100;
  
  RETURN jsonb_build_object(
    'overall_score', overall_score,
    'skill_match', skill_match_score,
    'experience_match', exp_match_score,
    'industry_match', industry_match_score,
    'location_match', location_match_score,
    'matched_skills', matched_skills,
    'total_required_skills', total_required_skills
  );
END;
$$ LANGUAGE plpgsql;