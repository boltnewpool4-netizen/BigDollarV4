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
      const { error } = await supabase
        .from('winners')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

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