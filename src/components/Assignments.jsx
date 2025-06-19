import { useState } from 'react';
import { useAssignments } from '../hooks/useAssignments';
import { format } from 'date-fns';
import { Briefcase, Calendar, Trash2, Edit, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function Assignments() {
  const { assignments, loading, addAssignment,updateAssignment, setAssignments,deleteAssignment } = useAssignments(); // Now works  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    test_type: 'coding',
    platform: 'hackerrank',
    deadline: '',
    status: 'pending',
    reference: [{ title: '', url: '', reference_type: 'documentation', notes: '' }]
  });

  const toggleDescription = (assignmentId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const assignmentData = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString()
      };
      const reference = formData.reference.filter(ref => ref.title && ref.url);
  
      if (editingAssignment) {
        const { data, error } = await updateAssignment(editingAssignment.id, {
          ...assignmentData,
          reference
        });
        
        if (error) throw error;
        
        // Update local state
        setAssignments(prev => prev.map(assignment => 
          assignment.id === editingAssignment.id ? data : assignment
        ));
      } else {
        const { data, error } = await addAssignment({
          ...assignmentData,
          reference
        });
        
        if (error) throw error;
        
        // Add new assignment to local state
        setAssignments(prev => [data, ...prev]);
      }
  
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('Failed to save assignment. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      test_type: 'coding',
      platform: 'hackerrank',
      deadline: '',
      status: 'pending',
      reference: [{ title: '', url: '', reference_type: 'documentation', notes: '' }]
    });
    setEditingAssignment(null);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      test_type: assignment.test_type,
      platform: assignment.platform,
      deadline: format(new Date(assignment.deadline), 'yyyy-MM-dd'),
      status: assignment.status,
      reference: assignment.reference?.length > 0 
        ? assignment.reference.map(ref => ({
            title: ref.title,
            url: ref.url,
            reference_type: ref.type || 'documentation',
            notes: ref.notes || ''
          }))
        : [{ title: '', url: '', reference_type: 'documentation', notes: '' }]
    });
    setIsModalOpen(true);
  };

  const handleAddReference = () => {
    setFormData(prev => ({
      ...prev,
      reference: [...prev.reference, { title: '', url: '', reference_type: 'documentation', notes: '' }]
    }));
  };

  const handleRemoveReference = (index) => {
    setFormData(prev => ({
      ...prev,
      reference: prev.reference.filter((_, i) => i !== index)
    }));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assignment Tracker</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          <Plus size={18} />
          Add Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
            <p className="text-gray-500 mt-2">Add your first assignment to get started</p>
          </div>
        ) : assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{assignment.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    aria-label="Edit assignment"
                  >
                    <Edit size={18} />
                  </button>
                  <button
  onClick={async () => {
    try {
      // Optimistically update UI by removing the assignment immediately
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));
      
      // Then actually delete from database
      const { error } = await deleteAssignment(assignment.id);
      
      if (error) {
        // If there's an error, revert the UI change
        setAssignments(prev => [...prev, assignment]);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert('Failed to delete assignment. Please try again.');
    }
  }}
  className="text-red-600 hover:text-red-800 p-1"
  aria-label="Delete assignment"
>
  <Trash2 size={18} />
</button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Briefcase size={16} className="flex-shrink-0" />
                <span className="capitalize">{assignment.test_type.replace('_', ' ')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Calendar size={16} className="flex-shrink-0" />
                <span>{format(new Date(assignment.deadline), 'PPP')}</span>
              </div>
              
              {assignment.description && (
                <div className="mb-3">
                  <div className={`text-gray-700 text-sm ${expandedDescriptions[assignment.id] ? '' : 'line-clamp-3'}`}>
                    {expandedDescriptions[assignment.id] 
                      ? assignment.description 
                      : assignment.description.length > 150
                        ? `${assignment.description.substring(0, 150)}...`
                        : assignment.description}
                  </div>
                  {assignment.description.length > 150 && (
                    <button
                      onClick={() => toggleDescription(assignment.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-1 flex items-center gap-1"
                    >
                      {expandedDescriptions[assignment.id] ? (
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
              
              {assignment.reference?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">reference</h3>
                  <ul className="space-y-2">
                    {assignment.reference.map((ref, index) => (
                      <li key={index} className="text-sm">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-start gap-2"
                        >
                          <span className="inline-flex items-center">
                            {ref.type === 'video' ? (
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                              </svg>
                            ) : ref.type === 'documentation' ? (
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span>{ref.title}</span>
                        </a>
                        {ref.notes && (
                          <p className="text-gray-500 text-xs mt-1 ml-6">{ref.notes}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(assignment.created_at), 'MMM d, yyyy')}
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
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
                    <select
                      value={formData.test_type}
                      onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="coding">Coding</option>
                      <option value="design">Design</option>
                      <option value="writing">Writing</option>
                      <option value="other">Other</option>
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
                      <option value="hackerrank">HackerRank</option>
                      <option value="codility">Codility</option>
                      <option value="take-home">Take-home</option>
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
                    rows="3"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">reference</label>
                    <button
                      type="button"
                      onClick={handleAddReference}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Reference
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.reference.map((ref, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Reference {index + 1}</span>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveReference(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                            <input
                              type="text"
                              value={ref.title}
                              onChange={(e) => {
                                const newRefs = [...formData.reference];
                                newRefs[index].title = e.target.value;
                                setFormData({ ...formData, reference: newRefs });
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Reference title"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                            <select
                              value={ref.reference_type}
                              onChange={(e) => {
                                const newRefs = [...formData.reference];
                                newRefs[index].reference_type = e.target.value;
                                setFormData({ ...formData, reference: newRefs });
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="documentation">Documentation</option>
                              <option value="video">Video</option>
                              <option value="article">Article</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                          <input
                            type="url"
                            value={ref.url}
                            onChange={(e) => {
                              const newRefs = [...formData.reference];
                              newRefs[index].url = e.target.value;
                              setFormData({ ...formData, reference: newRefs });
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                          <textarea
                            value={ref.notes}
                            onChange={(e) => {
                              const newRefs = [...formData.reference];
                              newRefs[index].notes = e.target.value;
                              setFormData({ ...formData, reference: newRefs });
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            placeholder="Any additional notes..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
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