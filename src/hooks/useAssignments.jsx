import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const AssignmentsContext = createContext();

export function AssignmentsProvider({ children }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAssignments();
      const subscription = supabase
        .channel('assignments_channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'assignments' },
          (payload) => {
            fetchAssignments();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function fetchAssignments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      
      // Ensure reference is always an array
      const formattedData = data.map(item => ({
        ...item,
        reference: item.reference || []
      }));
      
      setAssignments(formattedData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addAssignment(assignmentData) {
    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }
  
      const reference = (assignmentData.reference || [])
        .filter(ref => ref.title && ref.url)
        .map(ref => ({
          title: ref.title,
          url: ref.url,
          type: ref.reference_type || 'documentation',
          notes: ref.notes || ''
        }));
  
      const { data, error } = await supabase
        .from('assignments')
        .insert([{ 
          ...assignmentData,
          user_id: user.id,
          status: assignmentData.status || 'pending',
          job_id: assignmentData.job_id || null,
          reference: reference.length > 0 ? reference : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
  
      if (error) throw error;
      
      // Return the complete assignment data
      return { data, error: null };
    } catch (error) {
      console.error('Error adding assignment:', error);
      return { data: null, error };
    }
  }
  
  async function updateAssignment(id, updates) {
    try {
      if (updates.reference) {
        updates.reference = updates.reference
          .filter(ref => ref.title && ref.url)
          .map(ref => ({
            title: ref.title,
            url: ref.url,
            type: ref.reference_type || ref.type || 'documentation',
            notes: ref.notes || ''
          }));
      }
  
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
  
      if (error) throw error;
      
      // Return the updated assignment data
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function deleteAssignment(id) {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  return (
    <AssignmentsContext.Provider value={{
      assignments,
      loading,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      refresh: fetchAssignments,
      setAssignments
    }}>
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignments() {
  const context = useContext(AssignmentsContext);
  if (!context) {
    throw new Error('useAssignments must be used within an AssignmentsProvider');
  }
  return context;
}