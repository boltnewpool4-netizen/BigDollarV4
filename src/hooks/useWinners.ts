import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Winner } from '../types';

export const useWinners = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .order('won_at', { ascending: false });

      if (error) throw error;
      setWinners(data || []);
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWinners = async (newWinners: Winner[]) => {
    try {
      const { error } = await supabase
        .from('winners')
        .insert(newWinners);

      if (error) throw error;
      await fetchWinners(); // Refresh the list
    } catch (error) {
      console.error('Error adding winners:', error);
      throw error;
    }
  };

  const purgeWinners = async () => {
    try {
      // First, get all winner IDs to ensure we're deleting something
      const { data: existingWinners, error: fetchError } = await supabase
        .from('winners')
        .select('id');

      if (fetchError) throw fetchError;
      
      if (!existingWinners || existingWinners.length === 0) {
        return; // No winners to delete
      }

      // Delete all records
      const { error } = await supabase
        .from('winners')
        .delete()
        .gte('created_at', '1900-01-01'); // Delete all records (using a condition that matches all)

      if (error) throw error;
      await fetchWinners(); // Refresh the list
    } catch (error) {
      console.error('Error purging winners:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWinners();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('winners_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'winners' },
        () => {
          fetchWinners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { winners, loading, addWinners, fetchWinners, purgeWinners };
};