import { useState } from 'react';
import { useJobOpportunities } from '../hooks/useJobOpportunities';
import { format } from 'date-fns';
import { Briefcase, Calendar, Trash2, Edit, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function JobOpportunities() {
  const { opportunities, loading, addOpportunity, updateOpportunity, deleteOpportunity,setOpportunities  } = useJobOpportunities();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    job_type: 'full_time',
    description: '',
    deadline: '',
    status: 'pending'
  });

  const toggleDescription = (opportunityId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [opportunityId]: !prev[opportunityId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const opportunityData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      if (editingOpportunity) {
        const { data, error } = await updateOpportunity(editingOpportunity.id, opportunityData);
        if (error) throw error;
        
        // Update local state
        setOpportunities(prev => prev.map(opportunity => 
          opportunity.id === editingOpportunity.id ? data : opportunity
        ));
      } else {
        const { data, error } = await addOpportunity(opportunityData);
        if (error) throw error;
        
        // Add new opportunity to local state
        setOpportunities(prev => [data, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save opportunity:', error);
      alert('Failed to save opportunity. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      job_type: 'full_time',
      description: '',
      deadline: '',
      status: 'pending'
    });
    setEditingOpportunity(null);
  };

  const handleEdit = (opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      company: opportunity.company,
      job_type: opportunity.job_type,
      description: opportunity.description,
      deadline: opportunity.deadline ? format(new Date(opportunity.deadline), 'yyyy-MM-dd') : '',
      status: opportunity.status
    });
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Opportunities</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          <Plus size={18} />
          Add Opportunity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No opportunities yet</h3>
            <p className="text-gray-500 mt-2">Add your first job opportunity to get started</p>
          </div>
        ) : opportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">{opportunity.title}</h2>
                  <p className="text-gray-600 font-medium">{opportunity.company}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(opportunity)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    aria-label="Edit opportunity"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteOpportunity(opportunity.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    aria-label="Delete opportunity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                <Briefcase size={16} className="flex-shrink-0" />
                <span className="capitalize">{opportunity.job_type.replace('_', ' ')}</span>
              </div>
              
              {opportunity.deadline && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Calendar size={16} className="flex-shrink-0" />
                  <span>{format(new Date(opportunity.deadline), 'PPP')}</span>
                </div>
              )}
              
              {opportunity.description && (
                <div className="mt-3">
                  <div className={`text-gray-700 text-sm ${expandedDescriptions[opportunity.id] ? '' : 'line-clamp-3'}`}>
                    {expandedDescriptions[opportunity.id] 
                      ? opportunity.description 
                      : opportunity.description.length > 150
                        ? `${opportunity.description.substring(0, 150)}...`
                        : opportunity.description}
                  </div>
                  {opportunity.description.length > 150 && (
                    <button
                      onClick={() => toggleDescription(opportunity.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-1 flex items-center gap-1"
                    >
                      {expandedDescriptions[opportunity.id] ? (
                        <>
                          <ChevronUp size={16} />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Read more
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  opportunity.status === 'applied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(opportunity.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                    <select
                      value={formData.job_type}
                      onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="applied">Applied</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    {editingOpportunity ? 'Update Opportunity' : 'Add Opportunity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}