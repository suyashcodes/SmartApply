import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FileText, Zap, Target } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);
      
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 ml-3">SmartApply</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Job Application Toolkit
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Transform your job search with AI-generated resumes, cover letters, and cold emails tailored to any job description.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Smart Resume Optimization</h3>
                <p className="text-gray-600">AI analyzes job descriptions and suggests resume improvements</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Target className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Personalized Cover Letters</h3>
                <p className="text-gray-600">Generate compelling cover letters for each application</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Zap className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Cold Email Templates</h3>
                <p className="text-gray-600">Craft professional outreach messages to hiring managers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h3>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}