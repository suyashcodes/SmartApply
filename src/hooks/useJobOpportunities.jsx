import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const JobOpportunitiesContext = createContext();

export function JobOpportunitiesProvider({ children }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOpportunities();
      const subscription = supabase
        .channel('opportunities_channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'job_opportunities' },
          (payload) => {
            fetchOpportunities();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function fetchOpportunities() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addOpportunity(opportunityData) {
    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('job_opportunities')
        .insert([{ 
          ...opportunityData,
          user_id: user.id,
          status: opportunityData.status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding opportunity:', error);
      return { data: null, error };
    }
  }

  async function updateOpportunity(id, updates) {
    try {
      const { data, error } = await supabase
        .from('job_opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function deleteOpportunity(id) {
    try {
      const { error } = await supabase
        .from('job_opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  return (
    <JobOpportunitiesContext.Provider value={{
      opportunities,
      loading,
      addOpportunity,
      updateOpportunity,
      deleteOpportunity,
      refresh: fetchOpportunities,
      setOpportunities 
    }}>
      {children}
    </JobOpportunitiesContext.Provider>
  );
}

export function useJobOpportunities() {
  const context = useContext(JobOpportunitiesContext);
  if (!context) {
    throw new Error('useJobOpportunities must be used within a JobOpportunitiesProvider');
  }
  return context;
}