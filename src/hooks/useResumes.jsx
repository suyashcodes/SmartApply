import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const ResumeContext = createContext({});

export function ResumeProvider({ children }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchResumes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      alert('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (file) => {
    if (!user) {
      throw new Error('Must be logged in to upload resumes');
    }

    if (!file.type.includes('pdf')) {
      throw new Error('Please upload only PDF files');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    try {
      // Create a unique file name
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get file URL');
      }

      // Save to database
      const { data, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          storage_path: fileName,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setResumes(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  };

  const deleteResume = async (resumeId, storagePath) => {
    if (!user) return;

    try {
      console.log('Attempting to delete resume with id:', resumeId, ' and user ',user.id);

      // Delete from database first
      const { data, error: dbError } = await supabase
        .from('resumes')
        .delete()
        .match({ id: resumeId,user_id:user.id })
        .select();

      if (dbError) {
        console.error('Error deleting resume from database:', dbError);
        alert('Failed to delete resume from database');
        throw dbError;
      }

      console.log('Delete response from database:', data);

      // Then delete from storage using the exact path
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([storagePath]);

      if (storageError) {
        console.error('Error deleting resume from storage:', storageError);
        alert('Failed to delete resume from storage');
        throw storageError;
      }

      // Update local state
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      console.log('Resume deleted successfully:', resumeId);

    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
      throw error;
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  return (
    <ResumeContext.Provider value={{
      resumes,
      loading,
      uploadResume,
      deleteResume,
      fetchResumes
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export const useResumes = () => useContext(ResumeContext);