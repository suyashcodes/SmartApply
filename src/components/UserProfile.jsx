import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { User, MapPin, Briefcase, DollarSign, Plus, X, Save } from 'lucide-react';

export default function UserProfile() {
  const [profile, setProfile] = useState({
    full_name: '',
    title: '',
    bio: '',
    location: '',
    experience_years: 0,
    current_salary: '',
    expected_salary: '',
    currency: 'USD',
    industry: '',
    work_preference: 'remote',
    employment_preference: 'full_time',
    availability: 'immediate',
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  });
  
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill_name: '', proficiency_level: 3, years_experience: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSkills();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (!error && data) {
        setSkills(data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.skill_name.trim()) return;

    try {
      const { error } = await supabase
        .from('user_skills')
        .insert({
          ...newSkill,
          user_id: user.id
        });

      if (error) throw error;
      
      setNewSkill({ skill_name: '', proficiency_level: 3, years_experience: 0 });
      fetchSkills();
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill');
    }
  };

  const removeSkill = async (skillId) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      fetchSkills();
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const getProficiencyLabel = (level) => {
    const labels = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Update your profile to get better job recommendations</p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief description about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                value={profile.experience_years}
                onChange={(e) => setProfile(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={profile.industry}
                onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Preference</label>
              <select
                value={profile.work_preference}
                onChange={(e) => setProfile(prev => ({ ...prev, work_preference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="any">Any</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
          </div>

          {/* Add New Skill */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Skill name"
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill(prev => ({ ...prev, skill_name: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={newSkill.proficiency_level}
              onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency_level: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Beginner</option>
              <option value={2}>Basic</option>
              <option value={3}>Intermediate</option>
              <option value={4}>Advanced</option>
              <option value={5}>Expert</option>
            </select>

            <input
              type="number"
              placeholder="Years"
              value={newSkill.years_experience}
              onChange={(e) => setNewSkill(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
            />

            <button
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>

          {/* Skills List */}
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900">{skill.skill_name}</span>
                    <span className="text-sm text-gray-600">
                      {getProficiencyLabel(skill.proficiency_level)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {skill.years_experience} years
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Salary & Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Salary & Preferences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Salary</label>
              <input
                type="number"
                value={profile.current_salary}
                onChange={(e) => setProfile(prev => ({ ...prev, current_salary: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Annual salary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
              <input
                type="number"
                value={profile.expected_salary}
                onChange={(e) => setProfile(prev => ({ ...prev, expected_salary: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Expected annual salary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type Preference</label>
              <select
                value={profile.employment_preference}
                onChange={(e) => setProfile(prev => ({ ...prev, employment_preference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={profile.availability}
                onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="immediate">Immediate</option>
                <option value="2_weeks">2 Weeks</option>
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}