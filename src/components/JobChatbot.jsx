import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useResumes } from '../hooks/useResumes';
import { supabase } from '../lib/supabase';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Mail, 
  PenTool,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
  ArrowRight,
  Target
} from 'lucide-react';

export default function JobChatbot({ selectedJob, onClose, isOpen }) {
  const { user } = useAuth();
  const { resumes, loading: resumesLoading } = useResumes();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [chatMode, setChatMode] = useState('general'); // 'general', 'cover-letter', 'resume-review', 'cold-email'
  const [userProfile, setUserProfile] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
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

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      if (selectedJob) {
        // Initialize chat with job-specific welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Hi! I'm your AI job assistant. I can help you with "${selectedJob.title}" at ${selectedJob.company}. All documents I create will be personalized with your profile information for easy copy-paste! What would you like to do?`,
          timestamp: new Date(),
          suggestions: [
            {
              text: "Write a cover letter for this job",
              action: "cover-letter",
              icon: <PenTool className="w-4 h-4" />
            },
            {
              text: "Review my resume for this role",
              action: "resume-review", 
              icon: <FileText className="w-4 h-4" />
            },
            {
              text: "Generate a cold email to hiring manager",
              action: "cold-email",
              icon: <Mail className="w-4 h-4" />
            },
            {
              text: "View my resumes",
              action: "view-resumes",
              icon: <FileText className="w-4 h-4" />
            }
          ]
        };
        setMessages([welcomeMessage]);
      } else {
        // Initialize chat with general welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Hi! I'm your AI job assistant. I'm here to help you with your job search. I can create personalized cover letters and cold emails using your profile information. You can ask me about job applications, resume tips, interview preparation, or click on "Ask SmartBOT" for any specific job to get tailored advice!`,
          timestamp: new Date(),
          suggestions: [
            {
              text: "View my resumes & profile info",
              action: "view-resumes",
              icon: <FileText className="w-4 h-4" />
            },
            {
              text: "Interview preparation tips",
              action: "interview-tips",
              icon: <Star className="w-4 h-4" />
            },
            {
              text: "Job search strategies",
              action: "job-search-tips",
              icon: <Target className="w-4 h-4" />
            }
          ]
        };
        setMessages([welcomeMessage]);
      }
      setChatMode('general');
      setSelectedResume(null);
    }
  }, [selectedJob, isOpen]);

  const handleSuggestionClick = async (suggestion) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: suggestion.text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Handle different actions
    switch (suggestion.action) {
      case 'cover-letter':
        setChatMode('cover-letter');
        await handleCoverLetterRequest();
        break;
      case 'resume-review':
        setChatMode('resume-review');
        await handleResumeReviewRequest();
        break;
      case 'cold-email':
        setChatMode('cold-email');
        await handleColdEmailRequest();
        break;
      case 'job-info':
        await handleJobInfoRequest();
        break;
      case 'general-resume':
        await handleGeneralResumeHelp();
        break;
      case 'interview-tips':
        await handleInterviewTips();
        break;
      case 'job-search-tips':
        await handleJobSearchTips();
        break;
      case 'view-resumes':
        await handleViewResumes();
        break;
      default:
        break;
    }
  };

  const handleCoverLetterRequest = async () => {
    setIsLoading(true);
    
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: `I'd be happy to help you write a cover letter for the ${selectedJob.title} position at ${selectedJob.company}! To create a personalized cover letter, please select one of your resumes:`,
      timestamp: new Date(),
      showResumeSelector: true
    };
    
    setMessages(prev => [...prev, botMessage]);
    setShowResumeSelector(true);
    setIsLoading(false);
  };

  const handleResumeReviewRequest = async () => {
    setIsLoading(true);
    
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: `I'll review your resume and provide suggestions for the ${selectedJob.title} role. Please select which resume you'd like me to review:`,
      timestamp: new Date(),
      showResumeSelector: true
    };
    
    setMessages(prev => [...prev, botMessage]);
    setShowResumeSelector(true);
    setIsLoading(false);
  };

  const handleColdEmailRequest = async () => {
    setIsLoading(true);
    
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: `I'll help you craft a professional cold email to reach out about the ${selectedJob.title} position. Please select your resume so I can personalize the email:`,
      timestamp: new Date(),
      showResumeSelector: true
    };
    
    setMessages(prev => [...prev, botMessage]);
    setShowResumeSelector(true);
    setIsLoading(false);
  };

  const handleJobInfoRequest = async () => {
    setIsLoading(true);
    
    const jobInfo = `
**${selectedJob.title}** at **${selectedJob.company}**

📍 **Location:** ${selectedJob.location}
💰 **Salary:** ${selectedJob.salary_min && selectedJob.salary_max ? 
  `$${selectedJob.salary_min?.toLocaleString()} - $${selectedJob.salary_max?.toLocaleString()}` : 
  'Not specified'}
⏰ **Type:** ${selectedJob.employment_type || 'Full-time'}
🎯 **Experience:** ${selectedJob.experience_required || 'Not specified'}

**Key Information:**
${selectedJob.description ? 
  selectedJob.description.substring(0, 300) + (selectedJob.description.length > 300 ? '...' : '') :
  'No detailed description available.'}

**Required Skills:**
${selectedJob.required_skills?.map(skill => `• ${skill.name || skill}`).join('\n') || 'Not specified'}

Would you like me to help you with anything specific for this role?
    `;

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: jobInfo,
      timestamp: new Date(),
      suggestions: [
        {
          text: "Write a cover letter",
          action: "cover-letter",
          icon: <PenTool className="w-4 h-4" />
        },
        {
          text: "Review my resume",
          action: "resume-review",
          icon: <FileText className="w-4 h-4" />
        }
      ]
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleGeneralResumeHelp = async () => {
    setIsLoading(true);
    
    const advice = `
**General Resume Improvement Tips**

Here are some key strategies to make your resume stand out:

**📝 Structure & Format:**
• Keep it to 1-2 pages maximum
• Use a clean, professional format with consistent fonts
• Include clear section headers: Contact, Summary, Experience, Education, Skills
• Use bullet points for easy scanning

**🎯 Content Optimization:**
• Write a compelling summary that highlights your unique value
• Use action verbs to start each bullet point (Achieved, Developed, Led, etc.)
• Include quantifiable achievements with numbers and percentages
• Tailor your resume for each job application

**🔧 Technical Tips:**
• Use keywords from job descriptions you're targeting
• Ensure your resume is ATS (Applicant Tracking System) friendly
• Save as PDF to preserve formatting
• Use consistent date formats

**📈 Skills Section:**
• List both technical and soft skills
• Include certifications and relevant tools
• Show progression and growth over time

Would you like me to help you with a specific resume, or do you need advice on any particular section?
    `;

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: advice,
      timestamp: new Date(),
      suggestions: [
        {
          text: "View my resumes",
          action: "view-resumes",
          icon: <FileText className="w-4 h-4" />
        },
        {
          text: "Review my specific resume",
          action: "resume-review",
          icon: <FileText className="w-4 h-4" />
        },
        {
          text: "Interview preparation tips",
          action: "interview-tips",
          icon: <Star className="w-4 h-4" />
        }
      ]
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleInterviewTips = async () => {
    setIsLoading(true);
    
    const tips = `
**Interview Preparation Guide**

Here's how to ace your next interview:

**🔍 Research Phase:**
• Study the company's mission, values, and recent news
• Understand the role requirements and responsibilities
• Research your interviewers on LinkedIn if possible
• Prepare thoughtful questions about the role and company culture

**💬 Common Questions to Prepare:**
• "Tell me about yourself" - Prepare a 2-minute elevator pitch
• "Why do you want this job?" - Connect your goals with company needs
• "What are your strengths/weaknesses?" - Use real examples
• "Where do you see yourself in 5 years?" - Show growth mindset

**📚 STAR Method for Behavioral Questions:**
• **Situation:** Set the context
• **Task:** Describe your responsibility
• **Action:** Explain what you did
• **Result:** Share the outcome with metrics

**👔 Day of Interview:**
• Arrive 10-15 minutes early
• Bring multiple copies of your resume
• Dress appropriately for company culture
• Maintain good eye contact and positive body language
• Send a thank-you email within 24 hours

**🎯 Technical Interviews:**
• Practice coding problems on platforms like LeetCode
• Review fundamental concepts in your field
• Be ready to explain your thought process
• Ask clarifying questions before diving into solutions

Need help preparing for a specific type of interview or industry?
    `;

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: tips,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleJobSearchTips = async () => {
    setIsLoading(true);
    
    const strategies = `
**Effective Job Search Strategies**

Here's how to optimize your job search:

**🎯 Strategy & Planning:**
• Set clear goals: target roles, companies, salary range
• Create a weekly schedule for job search activities
• Track applications in a spreadsheet with follow-up dates
• Aim for quality applications over quantity

**🌐 Where to Search:**
• Company career pages (direct applications often get better response)
• LinkedIn Jobs with targeted keywords
• Industry-specific job boards
• Professional networking events and meetups
• Employee referrals (most effective method)

**📱 Optimize Your Online Presence:**
• LinkedIn profile should be 100% complete with professional photo
• Ensure your resume matches your LinkedIn profile
• Consider building a portfolio website for your work
• Clean up social media profiles

**🤝 Networking Approach:**
• Reach out to connections in your target companies
• Attend industry events and webinars
• Join professional associations in your field
• Informational interviews can lead to opportunities

**⏰ Application Best Practices:**
• Apply within 24-48 hours of job posting when possible
• Customize your cover letter for each application
• Follow up appropriately after 1-2 weeks
• Keep detailed records of all applications

**📊 Success Metrics:**
• Track application-to-interview ratio
• Monitor response rates by company size/type
• Adjust strategy based on feedback patterns

Ready to start applying to specific jobs? Use the "Ask SmartBOT" button on any job listing for tailored advice!
    `;

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: strategies,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleViewResumes = async () => {
    setIsLoading(true);
    
    const userName = userProfile?.full_name || user?.email?.split('@')[0] || 'there';
    const userEmail = user?.email || '[Email not available]';
    const userPhone = userProfile?.phone || '[Phone not available]';
    
    let content = `**Your Profile Information**

**Contact Details:**
• **Name:** ${userProfile?.full_name || '[Please update your profile]'}
• **Email:** ${userEmail}
• **Phone:** ${userPhone}
• **Experience:** ${userProfile?.experience_years || '[Not specified]'} years
• **Industry:** ${userProfile?.industry || '[Not specified]'}
• **Location:** ${userProfile?.location || '[Not specified]'}

**Your Resumes:**
`;

    if (resumes.length > 0) {
      resumes.forEach((resume, index) => {
        content += `
${index + 1}. **${resume.file_name}**
   • Uploaded: ${new Date(resume.uploaded_at).toLocaleDateString()}
`;
      });
      
      content += `
All generated documents will automatically include your contact information above for professional presentation.`;
    } else {
      content += `
No resumes found. Please upload a resume first to get personalized job assistance.
`;
    }

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleResumeSelection = async (resume) => {
    setSelectedResume(resume);
    setShowResumeSelector(false);
    
    // Add user message showing resume selection
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `Selected resume: ${resume.file_name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Generate appropriate response based on chat mode
    setIsLoading(true);
    
    let response = '';
    switch (chatMode) {
      case 'cover-letter':
        response = await generateCoverLetter(resume);
        break;
      case 'resume-review':
        response = await generateResumeReview(resume);
        break;
      case 'cold-email':
        response = await generateColdEmail(resume);
        break;
      default:
        response = 'Resume selected successfully!';
    }

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const generateCoverLetter = async (resume) => {
    // Get user information from profile
    const userName = userProfile?.full_name || user?.email?.split('@')[0] || '[Your Name]';
    const userEmail = user?.email || '[Your Email]';
    const userPhone = userProfile?.phone || '[Your Phone Number]';
    const userAddress = userProfile?.location || '';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Simulate AI-generated cover letter based on available resume data
    return `${userName}
${userEmail}
${userPhone}
${userAddress ? userAddress : ''}

${currentDate}

Dear Hiring Manager,

I am writing to express my strong interest in the ${selectedJob.title} position at ${selectedJob.company}. Based on my qualifications outlined in my resume, I am confident that I would be a valuable addition to your team.

**Why I'm the ideal candidate:**
• My background aligns perfectly with your requirements for ${selectedJob.title}
• I have relevant experience in ${selectedJob.required_skills?.slice(0, 3).map(s => s.name || s).join(', ') || 'the required technologies'}
• I am eager to contribute to ${selectedJob.company}'s continued success and innovation

**Key highlights from my professional experience:**
• Demonstrated expertise in ${selectedJob.industry || 'the relevant industry'} with a proven track record
• Strong technical and interpersonal skills that drive team collaboration
• Proven ability to adapt quickly and excel in dynamic, fast-paced environments
• Commitment to delivering high-quality results that exceed expectations

I am particularly drawn to ${selectedJob.company} because of your reputation for ${selectedJob.industry || 'innovation'} and commitment to excellence. I believe my passion for ${selectedJob.title} work and my dedication to continuous learning make me an excellent fit for your team.

I would welcome the opportunity to discuss how my skills and experience can contribute to ${selectedJob.company}'s objectives. Thank you for your time and consideration.

Sincerely,
${userName}`;
  };

  const generateResumeReview = async (resume) => {
    const requiredSkills = selectedJob.required_skills || [];
    const userName = userProfile?.full_name || user?.email?.split('@')[0] || 'candidate';
    const userExperience = userProfile?.experience_years || 'your';
    const userIndustry = userProfile?.industry || selectedJob.industry;
    
    return `**Personalized Resume Review for ${userName}**
**Position:** ${selectedJob.title} at ${selectedJob.company}

**Profile Analysis:**
• **Experience Level:** ${userExperience} years in ${userIndustry || 'your field'}
• **Target Role:** ${selectedJob.title}
• **Industry Focus:** ${selectedJob.industry || 'Technology'}

**Tailored Recommendations for Your ${selectedJob.title} Application:**

**1. Keywords & Skills Optimization:**
• **Must Include:** ${requiredSkills.slice(0, 5).map(s => s.name || s).join(', ') || 'relevant technical skills'}
• **Industry Terms:** Use language specific to ${selectedJob.industry || 'the target industry'}
• **ATS Optimization:** Include exact phrases from the job description
• **Skill Prioritization:** Lead with skills most relevant to ${selectedJob.title}

**2. Experience Section Enhancement:**
• **Quantify Achievements:** Use metrics that show impact (e.g., "Improved efficiency by 25%")
• **Relevant Projects:** Highlight work similar to ${selectedJob.title} responsibilities
• **Action Verbs:** Start bullet points with strong verbs (Led, Developed, Implemented)
• **${selectedJob.employment_type} Experience:** Emphasize relevant work arrangement experience

**3. Profile Summary Optimization:**
• **Opening Line:** "${userName}, experienced ${selectedJob.title} professional with ${userExperience} years..."
• **Core Competencies:** Align with ${selectedJob.company}'s needs
• **Value Proposition:** What unique value do you bring to ${selectedJob.title}?

**4. ${selectedJob.company}-Specific Customization:**
• **Company Research:** Mention ${selectedJob.company}'s recent achievements or values
• **Culture Fit:** Show alignment with company culture and mission
• **Industry Knowledge:** Demonstrate understanding of ${selectedJob.industry || 'their industry'} trends

**5. Technical Skills Section:**
• **Priority Skills:** ${requiredSkills.slice(0, 3).map(s => s.name || s).join(', ') || 'Key technologies'} should be prominently featured
• **Skill Levels:** Consider adding proficiency levels for key skills
• **Certifications:** Include relevant certifications for ${selectedJob.title}

**Next Steps:**
1. Update your resume with these specific recommendations
2. Customize your summary for ${selectedJob.company}
3. Ensure all required skills for ${selectedJob.title} are clearly visible
4. Have someone review for ${selectedJob.industry} terminology accuracy

Would you like me to help you with a cover letter for this position or provide more specific advice?`;
  };

  const generateColdEmail = async (resume) => {
    // Get user information from profile
    const userName = userProfile?.full_name || user?.email?.split('@')[0] || '[Your Name]';
    const userEmail = user?.email || '[Your Email]';
    const userPhone = userProfile?.phone || '[Your Phone Number]';
    const userLinkedIn = userProfile?.linkedin_url || '';
    const userExperience = userProfile?.experience_years || 'several years of';

    return `Subject: Experienced ${selectedJob.title} Professional - Interest in ${selectedJob.company} Opportunity

Dear Hiring Manager,

I hope this email finds you well. My name is ${userName}, and I am a professional with ${userExperience} experience interested in the ${selectedJob.title} opportunity at ${selectedJob.company}.

I recently discovered your open position and was immediately drawn to the role because:

• ${selectedJob.company}'s innovative approach to ${selectedJob.industry || 'the industry'} aligns perfectly with my career aspirations
• The ${selectedJob.title} position matches my professional background and expertise
• I'm particularly excited about contributing to ${selectedJob.company}'s mission and continued growth

**Why I would be a valuable addition to your team:**
• Strong expertise in ${selectedJob.required_skills?.slice(0, 3).map(s => s.name || s).join(', ') || 'relevant technologies and methodologies'}
• ${userExperience} of progressive experience in ${selectedJob.employment_type?.replace('_', ' ') || 'professional'} environments
• Proven track record of delivering results and contributing to team success
• Passionate about ${selectedJob.industry || 'innovation'} and staying current with industry trends

I have attached my resume for your review and would be thrilled to discuss how my skills and experience can contribute to ${selectedJob.company}'s continued success. I am available for a conversation at your convenience.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,

${userName}
${userEmail}
${userPhone}${userLinkedIn ? `
LinkedIn: ${userLinkedIn}` : ''}`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let responseContent;
      let suggestions = [];

      if (selectedJob) {
        responseContent = `I understand you're asking about "${inputMessage}". For the ${selectedJob.title} role at ${selectedJob.company}, I'd be happy to help you with specific tasks like writing a cover letter or reviewing your resume. Please use the suggestion buttons above for the best assistance!`;
        suggestions = [
          {
            text: "Write a cover letter",
            action: "cover-letter",
            icon: <PenTool className="w-4 h-4" />
          },
          {
            text: "Review my resume",
            action: "resume-review",
            icon: <FileText className="w-4 h-4" />
          },
          {
            text: "View my resumes",
            action: "view-resumes",
            icon: <FileText className="w-4 h-4" />
          }
        ];
      } else {
        responseContent = `I understand you're asking about "${inputMessage}". I'm here to help with your job search! I can provide general advice on resumes, interviews, and job search strategies. For specific job assistance, click "Ask SmartBOT" on any job listing.`;
        suggestions = [
          {
            text: "Resume improvement tips",
            action: "general-resume",
            icon: <FileText className="w-4 h-4" />
          },
          {
            text: "Interview preparation",
            action: "interview-tips",
            icon: <Star className="w-4 h-4" />
          }
        ];
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: responseContent,
        timestamp: new Date(),
        suggestions: suggestions
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-full sm:w-full sm:max-w-md lg:max-w-lg xl:max-w-xl bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Job Assistant</h3>
            <p className="text-xs opacity-90">AI-powered job help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Job Context */}
      {selectedJob ? (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-blue-900">Helping with:</span>
          </div>
          <p className="text-sm text-blue-800 font-medium break-words" title={selectedJob.title}>
            {selectedJob.title}
          </p>
          <p className="text-xs text-blue-600 mt-1 break-words" title={selectedJob.company}>
            {selectedJob.company}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="font-medium text-purple-900">General Job Assistant</span>
          </div>
          <p className="text-xs text-purple-600">Click "Ask SmartBOT" on any job for specific help</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-full sm:max-w-[85%] lg:max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
              <div className={`p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white ml-auto' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
              </div>
              
              {/* Suggestions */}
              {message.suggestions && (
                <div className="mt-3 space-y-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center gap-3 w-full p-3 text-left text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex-shrink-0 text-gray-500 group-hover:text-blue-600 transition-colors">
                        {suggestion.icon}
                      </div>
                      <span className="flex-1 text-gray-700 group-hover:text-gray-900">{suggestion.text}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Resume Selector */}
              {message.showResumeSelector && showResumeSelector && (
                <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-sm mb-3">Select a Resume:</h4>
                  {resumesLoading ? (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      Loading resumes...
                    </div>
                  ) : resumes.length > 0 ? (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div key={resume.id} className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate pr-2" title={resume.file_name}>
                                {resume.file_name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => window.open(resume.file_url, '_blank')}
                                className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleResumeSelection(resume)}
                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>No resumes found. Please create a resume first.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={selectedJob ? "Ask me anything about this job..." : "Ask me about your job search..."}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
