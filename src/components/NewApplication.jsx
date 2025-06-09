import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { FileText, Sparkles, Copy, Download } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
export default function NewApplication() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requestedOutputs, setRequestedOutputs] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Move Gemini initialization inside the component
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const outputOptions = [
    { id: 'resume_suggestions', label: 'Resume Suggestions', description: 'AI-powered improvements to match the job' },
    { id: 'cover_letter', label: 'Cover Letter', description: 'Personalized cover letter for this role' },
    { id: 'cold_email', label: 'Cold Email', description: 'Professional outreach message to hiring managers' },
  ];

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (!error) {
      setResumes(data || []);
    }
  };

  const handleOutputToggle = (outputId) => {
    setRequestedOutputs(prev => 
      prev.includes(outputId)
        ? prev.filter(id => id !== outputId)
        : [...prev, outputId]
    );
  };

  // Add this utility function at the top of your file
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const retryWithExponentialBackoff = async (fn, retries = 3, baseDelay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (error.message.includes('Rate limit') && i < retries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          await wait(delay);
          continue;
        }
        throw error;
      }
    }
  };
  
  const generateContent = async () => {
    if (!selectedResume || !jobDescription.trim() || requestedOutputs.length === 0) {
      alert('Please fill all fields and select at least one output type');
      return;
    }

    setLoading(true);

    try {
      const selectedResumeData = resumes.find(r => r.id.toString() === selectedResume);
      
      if (!selectedResumeData) {
        console.error('Selected resume data not found');
        alert('Error: Could not find the selected resume data');
        return;
      }
      console.log(selectedResumeData);
      
      const results = {};

      for (const output of requestedOutputs) {
        let prompt = '';
        
        if (output === 'resume_suggestions') {
          prompt = `Based on this job description:\n${jobDescription}\n\nAnd this resume:\n${selectedResumeData.content}\n\nProvide specific suggestions to improve the resume to better match the job requirements. Focus on skills alignment, achievements, and keywords.`;
        } else if (output === 'cover_letter') {
          prompt = `Write a professional cover letter for this job description:\n${jobDescription}\n\nUsing information from this resume:\n${selectedResumeData.content}\n\nThe cover letter should be personalized and include the following:\n1. Extract and use the candidate's full name and contact details from the resume\n2. If possible, research and include the hiring manager's name from the job description\n3. Highlight relevant experience and skills that match the job requirements\n4. Maintain a professional tone while showing genuine interest\n5. End with a clear call to action, dont include things like [Your Name] menton the personal details from resume data`;
        } else if (output === 'cold_email') {
          prompt = `Write a concise cold email to the hiring manager for this job description:\n${jobDescription}\n\nUsing key points from this resume:\n${selectedResumeData.content}\n\nThe email should:\n1. Use the candidate's actual name and relevant contact details from the resume\n2. If the hiring manager's name is in the job description, address them directly\n3. Be professional yet personable\n4. Highlight 2-3 most relevant qualifications that match the job\n5. Include a specific call to action for next steps`;
        }

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          results[output] = response.text();

          // Add a small delay between requests if needed
          if (requestedOutputs.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Error generating ${output}:`, error);
          results[output] = `Failed to generate ${output}: ${error.message}`;
        }
      }

      setResults(results);
    } catch (error) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const downloadAsText = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (resumes.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Resumes Found</h2>
          <p className="text-gray-600 mb-6">You need to upload at least one resume before creating applications.</p>
          <button
            onClick={() => window.location.href = '/dashboard/upload'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Job Application</h1>
          <p className="text-gray-600 mt-2">Generate AI-powered content tailored to your target job.</p>
        </div>

        {!results ? (
          <div className="space-y-8">
            {/* Resume Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Resume</h2>
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <label key={resume.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="resume"
                      value={resume.id}
                      checked={selectedResume === resume.id}
                      onChange={(e) => setSelectedResume(e.target.value)}
                      className="mr-3"
                    />
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">{resume.file_name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Output Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What would you like to generate?</h2>
              <div className="space-y-3">
                {outputOptions.map((option) => (
                  <label key={option.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestedOutputs.includes(option.id)}
                      onChange={() => handleOutputToggle(option.id)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={generateContent}
                disabled={loading || !selectedResume || !jobDescription.trim() || requestedOutputs.length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center mx-auto"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {loading ? 'Generating...' : 'Generate AI Content'}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Generated Content</h2>
              <button
                onClick={() => {
                  setResults(null);
                  setJobDescription('');
                  setRequestedOutputs([]);
                  setSelectedResume('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create New Application
              </button>
            </div>

            {Object.entries(results).map(([key, content]) => {
              const option = outputOptions.find(opt => opt.id === key);
              return (
                <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{option?.label}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(content)}
                        className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </button>
                      <button
                        onClick={() => downloadAsText(content, `${key}.txt`)}
                        className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{content}</pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}