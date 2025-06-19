import { useState } from 'react';
import { useResumes } from '../hooks/useResumes';
import { Upload, FileText, Trash2, Download, Eye } from 'lucide-react';

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { resumes, uploadResume, deleteResume } = useResumes();

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      await uploadResume(file);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId, fileUrl) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await deleteResume(resumeId, fileUrl);
      alert('Resume deleted successfully');
    } catch (error) {
      alert('Failed to delete resume');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const downloadResume = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage your resumes for different job applications.</p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`mx-auto h-12 w-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? 'Drop your PDF here' : 'Upload your resume'}
              </p>
              <p className="text-gray-600">
                Drag and drop a PDF file, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>
            
            <div className="mt-6">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block">
                  {uploading ? 'Uploading...' : 'Choose File'}
                </span>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Resume List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Resumes ({resumes.length})</h2>
          
          {resumes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No resumes uploaded yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {resumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{resume.file_name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(resume.file_url, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadResume(resume.file_url, resume.file_name)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id, resume.storage_path)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {/* <p className='text-[12px]'>{resume.id}</p> */}
                    {/* <p className='text-[12px]'>{resume.file_url}</p> */}
                    {/* <p className='text-[12px]'>{resume.storage_path}</p> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}