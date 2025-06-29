-- Insert sample jobs with comprehensive skill requirements and location data
INSERT INTO jobs (
  title, company, company_logo, description, requirements, location, work_type, 
  employment_type, experience_level, salary_min, salary_max, currency, industry, 
  department, posted_date, application_deadline, is_active, applicant_count,
  required_skills, nice_to_have_skills, required_experience_years, latitude, longitude
) VALUES 

(
  'Senior Frontend Developer',
  'TechCorp Inc',
  'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Join our dynamic frontend team to build cutting-edge web applications using React and TypeScript. You will work on user-facing features that impact millions of users.',
  'Strong experience with React, TypeScript, and modern frontend tooling. Experience with state management and testing frameworks.',
  'San Francisco, CA',
  'hybrid',
  'full_time',
  'senior',
  120000,
  160000,
  'USD',
  'Technology',
  'Engineering',
  now() - interval '2 days',
  now() + interval '25 days',
  true,
  45,
  '[
    {"name": "React", "required_level": 4},
    {"name": "TypeScript", "required_level": 4},
    {"name": "JavaScript", "required_level": 5},
    {"name": "HTML", "required_level": 4},
    {"name": "CSS", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Next.js"},
    {"name": "Redux"},
    {"name": "Jest"},
    {"name": "Cypress"}
  ]'::jsonb,
  5,
  37.7749,
  -122.4194
),

(
  'Full Stack Engineer',
  'StartupXYZ',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Build end-to-end features for our SaaS platform. Work with React frontend and Node.js backend in a fast-paced startup environment.',
  'Experience with full-stack development, database design, and API development.',
  'Austin, TX',
  'remote',
  'full_time',
  'mid',
  90000,
  120000,
  'USD',
  'Technology',
  'Engineering',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  67,
  '[
    {"name": "React", "required_level": 3},
    {"name": "Node.js", "required_level": 4},
    {"name": "JavaScript", "required_level": 4},
    {"name": "PostgreSQL", "required_level": 3},
    {"name": "REST APIs", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "GraphQL"},
    {"name": "Docker"},
    {"name": "AWS"},
    {"name": "TypeScript"}
  ]'::jsonb,
  3,
  30.2672,
  -97.7431
),

(
  'DevOps Engineer',
  'CloudScale Systems',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Manage and scale our cloud infrastructure. Implement CI/CD pipelines and ensure system reliability.',
  'Strong experience with cloud platforms, containerization, and infrastructure as code.',
  'Seattle, WA',
  'hybrid',
  'full_time',
  'senior',
  110000,
  145000,
  'USD',
  'Technology',
  'Infrastructure',
  now() - interval '3 days',
  now() + interval '20 days',
  true,
  89,
  '[
    {"name": "AWS", "required_level": 4},
    {"name": "Docker", "required_level": 4},
    {"name": "Kubernetes", "required_level": 4},
    {"name": "Terraform", "required_level": 3},
    {"name": "Linux", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Ansible"},
    {"name": "Jenkins"},
    {"name": "Monitoring"},
    {"name": "Python"}
  ]'::jsonb,
  5,
  47.6062,
  -122.3321
),

(
  'Junior Software Developer',
  'CodeAcademy Pro',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Entry-level position for new graduates. Learn and grow with our mentorship program while contributing to real projects.',
  'Basic programming knowledge, willingness to learn, and strong problem-solving skills.',
  'Boston, MA',
  'onsite',
  'full_time',
  'entry',
  65000,
  85000,
  'USD',
  'Technology',
  'Engineering',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  156,
  '[
    {"name": "JavaScript", "required_level": 2},
    {"name": "HTML", "required_level": 3},
    {"name": "CSS", "required_level": 3},
    {"name": "Git", "required_level": 2}
  ]'::jsonb,
  '[
    {"name": "React"},
    {"name": "Node.js"},
    {"name": "Python"},
    {"name": "SQL"}
  ]'::jsonb,
  1,
  42.3601,
  -71.0589
),

(
  'Machine Learning Engineer',
  'AI Innovations Lab',
  'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Build and deploy machine learning models at scale. Work on computer vision and natural language processing projects.',
  'Strong background in ML algorithms, Python, and experience with ML frameworks.',
  'Palo Alto, CA',
  'hybrid',
  'full_time',
  'senior',
  140000,
  180000,
  'USD',
  'Technology',
  'AI/ML',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  78,
  '[
    {"name": "Python", "required_level": 5},
    {"name": "TensorFlow", "required_level": 4},
    {"name": "PyTorch", "required_level": 4},
    {"name": "Machine Learning", "required_level": 5}
  ]'::jsonb,
  '[
    {"name": "Kubernetes"},
    {"name": "MLflow"},
    {"name": "Computer Vision"},
    {"name": "NLP"}
  ]'::jsonb,
  5,
  37.4419,
  -122.1430
),

(
  'Mobile App Developer',
  'AppCraft Studios',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Develop native mobile applications for iOS and Android. Work on consumer-facing apps with millions of users.',
  'Experience with Swift/Kotlin, mobile app architecture, and app store deployment.',
  'Atlanta, GA',
  'onsite',
  'full_time',
  'mid',
  85000,
  115000,
  'USD',
  'Technology',
  'Mobile Development',
  now() - interval '2 days',
  now() + interval '25 days',
  true,
  56,
  '[
    {"name": "Swift", "required_level": 4},
    {"name": "Kotlin", "required_level": 4},
    {"name": "iOS Development", "required_level": 4},
    {"name": "Android Development", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "React Native"},
    {"name": "Flutter"},
    {"name": "Firebase"}
  ]'::jsonb,
  3,
  33.7490,
  -84.3880
),

(
  'Cybersecurity Analyst',
  'SecureNet Systems',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Protect our organization from cyber threats. Monitor security systems and respond to incidents.',
  'Knowledge of security frameworks, incident response, and threat analysis.',
  'Washington, DC',
  'hybrid',
  'full_time',
  'mid',
  80000,
  110000,
  'USD',
  'Cybersecurity',
  'Security',
  now() - interval '3 days',
  now() + interval '20 days',
  true,
  67,
  '[
    {"name": "Network Security", "required_level": 4},
    {"name": "Incident Response", "required_level": 4},
    {"name": "SIEM", "required_level": 3},
    {"name": "Penetration Testing", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "Splunk"},
    {"name": "Wireshark"},
    {"name": "Metasploit"}
  ]'::jsonb,
  3,
  38.9072,
  -77.0369
),

(
  'Data Scientist',
  'Analytics Pro',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Extract insights from large datasets to drive business decisions. Build predictive models and data pipelines.',
  'Strong statistical background, programming skills, and experience with data visualization.',
  'San Francisco, CA',
  'remote',
  'full_time',
  'senior',
  120000,
  160000,
  'USD',
  'Technology',
  'Data Science',
  now() - interval '5 days',
  now() + interval '15 days',
  true,
  89,
  '[
    {"name": "Python", "required_level": 4},
    {"name": "R", "required_level": 4},
    {"name": "SQL", "required_level": 4},
    {"name": "Statistics", "required_level": 5}
  ]'::jsonb,
  '[
    {"name": "Tableau"},
    {"name": "Spark"},
    {"name": "Hadoop"},
    {"name": "Jupyter"}
  ]'::jsonb,
  5,
  37.7749,
  -122.4194
),

(
  'Cloud Architect',
  'CloudFirst Technologies',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Design and implement cloud infrastructure solutions. Lead cloud migration projects and optimize costs.',
  'Extensive cloud experience, architecture design skills, and multi-cloud expertise.',
  'Dallas, TX',
  'hybrid',
  'full_time',
  'lead',
  130000,
  170000,
  'USD',
  'Technology',
  'Cloud Architecture',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  45,
  '[
    {"name": "AWS", "required_level": 5},
    {"name": "Azure", "required_level": 4},
    {"name": "Cloud Architecture", "required_level": 5},
    {"name": "Terraform", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "GCP"},
    {"name": "CloudFormation"},
    {"name": "Ansible"}
  ]'::jsonb,
  8,
  32.7767,
  -96.7970
),

(
  'QA Engineer',
  'TestPro Solutions',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Ensure software quality through comprehensive testing strategies. Develop automated test suites.',
  'Experience with test automation, manual testing, and quality assurance processes.',
  'Phoenix, AZ',
  'remote',
  'full_time',
  'mid',
  70000,
  95000,
  'USD',
  'Technology',
  'Quality Assurance',
  now() - interval '2 days',
  now() + interval '25 days',
  true,
  78,
  '[
    {"name": "Test Automation", "required_level": 4},
    {"name": "Selenium", "required_level": 4},
    {"name": "Manual Testing", "required_level": 4},
    {"name": "API Testing", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "Cypress"},
    {"name": "Jest"},
    {"name": "Postman"}
  ]'::jsonb,
  3,
  33.4484,
  -112.0740
),

(
  'Technical Writer',
  'DocuTech Corp',
  'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Create clear and comprehensive technical documentation for software products. Work with engineering teams.',
  'Strong writing skills, technical background, and experience with documentation tools.',
  'Remote',
  'remote',
  'full_time',
  'mid',
  60000,
  85000,
  'USD',
  'Technology',
  'Documentation',
  now() - interval '4 days',
  now() + interval '18 days',
  true,
  34,
  '[
    {"name": "Technical Writing", "required_level": 5},
    {"name": "Markdown", "required_level": 4},
    {"name": "Git", "required_level": 3},
    {"name": "API Documentation", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Confluence"},
    {"name": "GitBook"},
    {"name": "Swagger"}
  ]'::jsonb,
  3,
  NULL,
  NULL
),

(
  'Business Analyst',
  'Enterprise Solutions Inc',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Bridge the gap between business needs and technical solutions. Analyze processes and recommend improvements.',
  'Strong analytical skills, business process knowledge, and stakeholder management experience.',
  'Chicago, IL',
  'hybrid',
  'full_time',
  'mid',
  75000,
  100000,
  'USD',
  'Business',
  'Analysis',
  now() - interval '3 days',
  now() + interval '22 days',
  true,
  56,
  '[
    {"name": "Business Analysis", "required_level": 4},
    {"name": "Requirements Gathering", "required_level": 4},
    {"name": "Process Mapping", "required_level": 3},
    {"name": "SQL", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "Visio"},
    {"name": "JIRA"},
    {"name": "Tableau"}
  ]'::jsonb,
  3,
  41.8781,
  -87.6298
),

(
  'Scrum Master',
  'Agile Dynamics',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Facilitate agile development processes and remove impediments for development teams. Coach teams on agile practices.',
  'Certified Scrum Master, experience with agile methodologies, and strong facilitation skills.',
  'Austin, TX',
  'hybrid',
  'full_time',
  'mid',
  80000,
  105000,
  'USD',
  'Technology',
  'Project Management',
  now() - interval '1 day',
  now() + interval '28 days',
  true,
  67,
  '[
    {"name": "Scrum", "required_level": 5},
    {"name": "Agile Coaching", "required_level": 4},
    {"name": "Facilitation", "required_level": 4},
    {"name": "JIRA", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "SAFe"},
    {"name": "Kanban"},
    {"name": "Confluence"}
  ]'::jsonb,
  3,
  30.2672,
  -97.7431
),

(
  'Site Reliability Engineer',
  'ScaleOps Inc',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Ensure the reliability and scalability of our production systems. Build monitoring and alerting systems.',
  'Strong systems engineering background, experience with monitoring tools, and incident management.',
  'San Francisco, CA',
  'remote',
  'full_time',
  'senior',
  125000,
  165000,
  'USD',
  'Technology',
  'Site Reliability',
  now() - interval '2 days',
  now() + interval '25 days',
  true,
  45,
  '[
    {"name": "Linux", "required_level": 5},
    {"name": "Kubernetes", "required_level": 4},
    {"name": "Monitoring", "required_level": 4},
    {"name": "Python", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Prometheus"},
    {"name": "Grafana"},
    {"name": "Terraform"},
    {"name": "Go"}
  ]'::jsonb,
  5,
  37.7749,
  -122.4194
),

(
  'Frontend Engineer Intern',
  'TechStart Academy',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Summer internship opportunity for students interested in frontend development. Mentorship and real project experience.',
  'Basic knowledge of web technologies, currently pursuing CS degree, and eagerness to learn.',
  'San Jose, CA',
  'hybrid',
  'internship',
  'entry',
  25000,
  35000,
  'USD',
  'Technology',
  'Engineering',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  234,
  '[
    {"name": "HTML", "required_level": 2},
    {"name": "CSS", "required_level": 2},
    {"name": "JavaScript", "required_level": 2}
  ]'::jsonb,
  '[
    {"name": "React"},
    {"name": "Git"},
    {"name": "Node.js"}
  ]'::jsonb,
  0,
  37.3382,
  -121.8863
),

(
  'Product Designer',
  'DesignFirst Co',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Lead product design for our consumer mobile app. Create user-centered designs that solve real problems.',
  'Strong design portfolio, user research experience, and proficiency with design tools.',
  'Los Angeles, CA',
  'hybrid',
  'full_time',
  'senior',
  95000,
  125000,
  'USD',
  'Design',
  'Product Design',
  now() - interval '3 days',
  now() + interval '20 days',
  true,
  78,
  '[
    {"name": "Product Design", "required_level": 5},
    {"name": "User Research", "required_level": 4},
    {"name": "Figma", "required_level": 5},
    {"name": "Design Systems", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Principle"},
    {"name": "Framer"},
    {"name": "After Effects"}
  ]'::jsonb,
  5,
  34.0522,
  -118.2437
),

(
  'Backend Developer',
  'ServerTech Solutions',
  'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Build robust backend systems and APIs. Work with microservices architecture and distributed systems.',
  'Strong backend development experience, database design skills, and API development.',
  'Remote',
  'remote',
  'full_time',
  'mid',
  85000,
  115000,
  'USD',
  'Technology',
  'Backend Development',
  now() - interval '4 days',
  now() + interval '17 days',
  true,
  89,
  '[
    {"name": "Node.js", "required_level": 4},
    {"name": "PostgreSQL", "required_level": 4},
    {"name": "REST APIs", "required_level": 4},
    {"name": "Microservices", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "GraphQL"},
    {"name": "Redis"},
    {"name": "Docker"},
    {"name": "AWS"}
  ]'::jsonb,
  3,
  NULL,
  NULL
),

(
  'Marketing Coordinator',
  'GrowthHack Marketing',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Support marketing campaigns and coordinate cross-functional initiatives. Entry-level position with growth opportunities.',
  'Marketing degree, strong communication skills, and familiarity with digital marketing tools.',
  'Tampa, FL',
  'onsite',
  'full_time',
  'entry',
  40000,
  55000,
  'USD',
  'Marketing',
  'Coordination',
  now() - interval '2 days',
  now() + interval '25 days',
  true,
  123,
  '[
    {"name": "Marketing", "required_level": 3},
    {"name": "Social Media", "required_level": 3},
    {"name": "Content Creation", "required_level": 3},
    {"name": "Analytics", "required_level": 2}
  ]'::jsonb,
  '[
    {"name": "Canva"},
    {"name": "Hootsuite"},
    {"name": "Mailchimp"}
  ]'::jsonb,
  1,
  27.9506,
  -82.4572
),

(
  'Solutions Architect',
  'Enterprise Tech Corp',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Design enterprise-level technical solutions for clients. Lead technical discussions and architecture reviews.',
  'Extensive technical experience, solution design skills, and client-facing experience.',
  'New York, NY',
  'hybrid',
  'full_time',
  'lead',
  140000,
  180000,
  'USD',
  'Technology',
  'Solutions Architecture',
  now() - interval '5 days',
  now() + interval '15 days',
  true,
  34,
  '[
    {"name": "Solution Architecture", "required_level": 5},
    {"name": "Cloud Platforms", "required_level": 4},
    {"name": "Enterprise Integration", "required_level": 4},
    {"name": "Technical Leadership", "required_level": 5}
  ]'::jsonb,
  '[
    {"name": "Microservices"},
    {"name": "API Gateway"},
    {"name": "Event Streaming"}
  ]'::jsonb,
  8,
  40.7128,
  -74.0060
),

(
  'Content Marketing Manager',
  'ContentCraft Agency',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Develop and execute content marketing strategies. Create engaging content across multiple channels.',
  'Content creation experience, SEO knowledge, and understanding of content marketing metrics.',
  'Remote',
  'remote',
  'full_time',
  'mid',
  60000,
  80000,
  'USD',
  'Marketing',
  'Content Marketing',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  67,
  '[
    {"name": "Content Marketing", "required_level": 4},
    {"name": "SEO", "required_level": 4},
    {"name": "Content Creation", "required_level": 4},
    {"name": "Analytics", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "WordPress"},
    {"name": "Google Analytics"},
    {"name": "Ahrefs"}
  ]'::jsonb,
  3,
  NULL,
  NULL
),

(
  'Database Administrator',
  'DataCore Systems',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Manage and optimize database systems. Ensure data integrity, performance, and security.',
  'Strong database administration experience, performance tuning skills, and backup/recovery expertise.',
  'Denver, CO',
  'hybrid',
  'full_time',
  'senior',
  95000,
  125000,
  'USD',
  'Technology',
  'Database Administration',
  now() - interval '3 days',
  now() + interval '22 days',
  true,
  56,
  '[
    {"name": "PostgreSQL", "required_level": 5},
    {"name": "MySQL", "required_level": 4},
    {"name": "Database Optimization", "required_level": 4},
    {"name": "Backup & Recovery", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "MongoDB"},
    {"name": "Redis"},
    {"name": "Oracle"}
  ]'::jsonb,
  5,
  39.7392,
  -104.9903
),

(
  'UX/UI Designer',
  'Creative Digital Studio',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Design intuitive user interfaces and experiences for web and mobile applications. Collaborate with product teams.',
  'Strong design portfolio, user experience principles, and proficiency with design tools.',
  'Portland, OR',
  'hybrid',
  'full_time',
  'mid',
  70000,
  95000,
  'USD',
  'Design',
  'UX/UI Design',
  now() - interval '2 days',
  now() + interval '25 days',
  true,
  89,
  '[
    {"name": "UX Design", "required_level": 4},
    {"name": "UI Design", "required_level": 4},
    {"name": "Figma", "required_level": 4},
    {"name": "User Research", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "Adobe Creative Suite"},
    {"name": "Sketch"},
    {"name": "InVision"}
  ]'::jsonb,
  3,
  45.5152,
  -122.6784
),

(
  'Network Engineer',
  'NetSecure Corp',
  'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Design and maintain network infrastructure. Troubleshoot network issues and implement security measures.',
  'Strong networking knowledge, Cisco certifications preferred, and experience with network security.',
  'Miami, FL',
  'onsite',
  'full_time',
  'mid',
  75000,
  100000,
  'USD',
  'Technology',
  'Network Engineering',
  now() - interval '4 days',
  now() + interval '18 days',
  true,
  67,
  '[
    {"name": "Network Administration", "required_level": 4},
    {"name": "Cisco", "required_level": 4},
    {"name": "Network Security", "required_level": 3},
    {"name": "TCP/IP", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "CCNA"},
    {"name": "Firewall Management"},
    {"name": "VPN"}
  ]'::jsonb,
  3,
  25.7617,
  -80.1918
),

(
  'Software Engineering Manager',
  'TechLead Solutions',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Lead a team of software engineers. Drive technical decisions and mentor team members while contributing to architecture.',
  'Strong technical background, leadership experience, and team management skills.',
  'San Francisco, CA',
  'hybrid',
  'full_time',
  'lead',
  150000,
  200000,
  'USD',
  'Technology',
  'Engineering Management',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  45,
  '[
    {"name": "Technical Leadership", "required_level": 5},
    {"name": "Team Management", "required_level": 5},
    {"name": "Software Architecture", "required_level": 4},
    {"name": "Agile Methodologies", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Performance Management"},
    {"name": "Hiring"},
    {"name": "Strategic Planning"}
  ]'::jsonb,
  8,
  37.7749,
  -122.4194
),

(
  'Data Engineer',
  'BigData Analytics',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Build and maintain data pipelines and infrastructure. Work with large-scale data processing systems.',
  'Experience with data pipeline tools, big data technologies, and cloud platforms.',
  'Remote',
  'remote',
  'full_time',
  'senior',
  115000,
  150000,
  'USD',
  'Technology',
  'Data Engineering',
  now() - interval '2 days',
  now() + interval '25 days',
  true,
  78,
  '[
    {"name": "Python", "required_level": 4},
    {"name": "Apache Spark", "required_level": 4},
    {"name": "SQL", "required_level": 4},
    {"name": "ETL", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Kafka"},
    {"name": "Airflow"},
    {"name": "Snowflake"},
    {"name": "dbt"}
  ]'::jsonb,
  5,
  NULL,
  NULL
),

(
  'Sales Development Representative',
  'SalesForce Pro',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Generate and qualify leads for the sales team. Build relationships with prospects and schedule demos.',
  'Strong communication skills, sales experience preferred, and CRM proficiency.',
  'Las Vegas, NV',
  'hybrid',
  'full_time',
  'entry',
  45000,
  65000,
  'USD',
  'Sales',
  'Business Development',
  now() - interval '3 days',
  now() + interval '20 days',
  true,
  134,
  '[
    {"name": "Sales", "required_level": 3},
    {"name": "Lead Generation", "required_level": 3},
    {"name": "CRM", "required_level": 3},
    {"name": "Communication", "required_level": 4}
  ]'::jsonb,
  '[
    {"name": "Salesforce"},
    {"name": "HubSpot"},
    {"name": "LinkedIn Sales Navigator"}
  ]'::jsonb,
  1,
  36.1699,
  -115.1398
),

(
  'Financial Analyst',
  'FinanceFirst Corp',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Analyze financial data and create reports for management. Support budgeting and forecasting processes.',
  'Strong analytical skills, Excel proficiency, and finance background.',
  'Charlotte, NC',
  'onsite',
  'full_time',
  'mid',
  65000,
  85000,
  'USD',
  'Finance',
  'Financial Analysis',
  now() - interval '4 days',
  now() + interval '17 days',
  true,
  89,
  '[
    {"name": "Financial Analysis", "required_level": 4},
    {"name": "Excel", "required_level": 4},
    {"name": "Financial Modeling", "required_level": 3},
    {"name": "Budgeting", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "SQL"},
    {"name": "Tableau"},
    {"name": "PowerBI"}
  ]'::jsonb,
  3,
  35.2271,
  -80.8431
),

(
  'HR Generalist',
  'PeopleFirst HR',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
  'Support all aspects of human resources including recruitment, employee relations, and compliance.',
  'HR experience, knowledge of employment law, and strong interpersonal skills.',
  'Nashville, TN',
  'hybrid',
  'full_time',
  'mid',
  55000,
  75000,
  'USD',
  'Human Resources',
  'HR Operations',
  now() - interval '1 day',
  now() + interval '30 days',
  true,
  67,
  '[
    {"name": "Human Resources", "required_level": 4},
    {"name": "Recruitment", "required_level": 3},
    {"name": "Employee Relations", "required_level": 4},
    {"name": "HRIS", "required_level": 3}
  ]'::jsonb,
  '[
    {"name": "Workday"},
    {"name": "ATS"},
    {"name": "Performance Management"}
  ]'::jsonb,
  3,
  36.1627,
  -86.7816
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_required_skills ON jobs USING GIN (required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_nice_to_have_skills ON jobs USING GIN (nice_to_have_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs (experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs (industry);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON user_skills (skill_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON user_profiles (industry);