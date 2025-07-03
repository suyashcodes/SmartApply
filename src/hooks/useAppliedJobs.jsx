import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const AppliedJobsContext = createContext();

export function AppliedJobsProvider({ children }) {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAppliedJobs();
      const subscription = supabase
        .channel('applied_jobs_channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'applied_jobs' },
          (payload) => {
            fetchAppliedJobs();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function fetchAppliedJobs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applied_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('application_date', { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(item => ({
        ...item,
        contacts: item.contacts || []
      }));
      
      setAppliedJobs(formattedData);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addAppliedJob(jobData) {
    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const contacts = (jobData.contacts || [])
        .filter(contact => contact.value.trim() !== '')
        .map(contact => ({
          type: contact.type,
          value: contact.value
        }));

      const { data, error } = await supabase
        .from('applied_jobs')
        .insert([{ 
          ...jobData,
          user_id: user.id,
          contacts: contacts.length > 0 ? contacts : null,
          application_date: jobData.application_date || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding applied job:', error);
      return { data: null, error };
    }
  }

  async function updateAppliedJob(id, updates) {
    try {
      if (updates.contacts) {
        updates.contacts = updates.contacts
          .filter(contact => contact.value.trim() !== '')
          .map(contact => ({
            type: contact.type,
            value: contact.value
          }));
      }

      const { data, error } = await supabase
        .from('applied_jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function deleteAppliedJob(id) {
    try {
      const { error } = await supabase
        .from('applied_jobs')
        .delete()
        .eq('id', id);
        setAppliedJobs(prev => prev.filter(job => job.id !== id));

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  return (
    <AppliedJobsContext.Provider value={{
      appliedJobs,
      loading,
      addAppliedJob,
      updateAppliedJob,
      deleteAppliedJob,
      setAppliedJobs,
      refresh: fetchAppliedJobs
    }}>
      {children}
    </AppliedJobsContext.Provider>
  );
}

export function useAppliedJobs() {
  const context = useContext(AppliedJobsContext);
  if (!context) {
    throw new Error('useAppliedJobs must be used within an AppliedJobsProvider');
  }
  return context;
}