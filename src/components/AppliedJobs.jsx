import { useState } from 'react';
import { useAppliedJobs } from '../hooks/useAppliedJobs';
import { format } from 'date-fns';
import { Briefcase, Calendar, Trash2, Edit, Plus, ChevronDown, ChevronUp, Mail, Linkedin, Link } from 'lucide-react';

export default function AppliedJobs() {
  const { appliedJobs, loading, addAppliedJob, updateAppliedJob, deleteAppliedJob,setAppliedJobs } = useAppliedJobs();
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    job_type: 'full_time',
    description: '',
    platform: 'linkedin',
    contacts: []
  });

  const toggleDescription = (jobId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { type: 'email', value: '' }]
    }));
  };

  const removeContact = (index) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.title.trim() || !formData.company.trim()) {
        alert('Job title and company are required');
        return;
      }

      const jobData = {
        ...formData,
        contacts: formData.contacts.filter(contact => contact.value.trim() !== '')
      };

      if (editingJob) {
        const { data, error } = await updateAppliedJob(editingJob.id, jobData);
        if (error) throw error;
        
        // Update local state
        setAppliedJobs(prev => prev.map(job => 
          job.id === editingJob.id ? data : job
        ));
      } else {
        const { data, error } = await addAppliedJob(jobData);
        if (error) throw error;
        
        // Add new job to local state
        setAppliedJobs(prev => [data, ...prev]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      job_type: 'full_time',
      description: '',
      platform: 'linkedin',
      contacts: []
    });
    setEditingJob(null);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      job_type: job.job_type,
      description: job.description,
      platform: job.platform,
      contacts: job.contacts?.length > 0 
        ? job.contacts.map(contact => ({
            type: contact.type,
            value: contact.value
          }))
        : []
    });
    setShowModal(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Applied Jobs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          <Plus size={18} />
          Add Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appliedJobs.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs yet</h3>
            <p className="text-gray-500 mt-2">Add your first applied job to get started</p>
          </div>
        ) : appliedJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">{job.title}</h2>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(job)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    aria-label="Edit job"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteAppliedJob(job.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    aria-label="Delete job"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                <Briefcase size={16} className="flex-shrink-0" />
                <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Calendar size={16} className="flex-shrink-0" />
                <span>{format(new Date(job.application_date), 'PPP')}</span>
              </div>
              
              {job.description && (
                <div className="mt-3">
                  <div className={`text-gray-700 text-sm ${expandedDescriptions[job.id] ? '' : 'line-clamp-3'}`}>
                    {expandedDescriptions[job.id] 
                      ? job.description 
                      : job.description.length > 150
                        ? `${job.description.substring(0, 150)}...`
                        : job.description}
                  </div>
                  {job.description.length > 150 && (
                    <button
                      onClick={() => toggleDescription(job.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-1 flex items-center gap-1"
                    >
                      {expandedDescriptions[job.id] ? (
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
              
              {job.contacts?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">Contacts</h3>
                  <ul className="space-y-2">
                    {job.contacts.map((contact, index) => (
                      <li key={index} className="text-sm">
                        <a
                          href={contact.type === 'email' ? `mailto:${contact.value}` : contact.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-start gap-2"
                        >
                          <span className="inline-flex items-center">
                            {contact.type === 'email' ? (
                              <Mail className="h-4 w-4 mr-1" />
                            ) : contact.type === 'linkedin' ? (
                              <Linkedin className="h-4 w-4 mr-1" />
                            ) : (
                              <Link className="h-4 w-4 mr-1" />
                            )}
                          </span>
                          <span>{contact.value}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-700">Applied via:</span>
                <span className="text-gray-600 capitalize">{job.platform}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingJob ? 'Edit Job' : 'Add New Job'}
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
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="wellfound">Wellfound</option>
                      <option value="company_website">Company Website</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
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

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Contacts</label>
                    <button
                      type="button"
                      onClick={addContact}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Contact
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Contact {index + 1}</span>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                            <select
                              value={contact.type}
                              onChange={(e) => {
                                const newContacts = [...formData.contacts];
                                newContacts[index].type = e.target.value;
                                setFormData({ ...formData, contacts: newContacts });
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="email">Email</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="website">Website</option>
                              <option value="phone">Phone</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                            <input
                              type={contact.type === 'email' ? 'email' : 'text'}
                              placeholder={contact.type === 'email' ? 'email@company.com' : 
                                          contact.type === 'phone' ? 'Phone number' : 'https://...'}
                              value={contact.value}
                              onChange={(e) => {
                                const newContacts = [...formData.contacts];
                                newContacts[index].value = e.target.value;
                                setFormData({ ...formData, contacts: newContacts });
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
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
                    {editingJob ? 'Update Job' : 'Add Job'}
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