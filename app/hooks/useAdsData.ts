import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export function useAdsData(pageSize: number = 4) {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAdsCount, setTotalAdsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset page and ads when search query changes
  useEffect(() => {
    setPage(1);
    setAds([]);
    setHasMore(true);
  }, [searchQuery]);

  // Fetch total count when search query changes
  useEffect(() => {
    const getTotalCount = async () => {
      try {
        const query = supabase
          .from('facebook_ads')
          .select('*', { count: 'exact', head: true });
        
        if (searchQuery) {
          query.or(`ad_text.ilike.%${searchQuery}%,advertiser_name.ilike.%${searchQuery}%`);
        }

        const { count, error } = await query;

        if (error) throw error;
        setTotalAdsCount(count || 0);
      } catch (err) {
        console.error('Error fetching total count:', err);
      }
    };

    getTotalCount();
  }, [searchQuery]);

  // Fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      if (!hasMore) return;
      
      try {
        setLoading(true);
        
        const query = supabase
          .from('facebook_ads')
          .select('*')
          .order('captured_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (searchQuery) {
          query.or(`ad_text.ilike.%${searchQuery}%,advertiser_name.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        if (!data || data.length < pageSize) {
          setHasMore(false);
        }
        
        if (data && data.length > 0) {
          // Only append if we're past page 1, otherwise replace
          setAds(prevAds => page === 1 ? data : [...prevAds, ...data]);
        } else if (page === 1) {
          // If no results on first page, clear the ads
          setAds([]);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [page, hasMore, pageSize, searchQuery]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return {
    ads,
    loading,
    error,
    hasMore,
    totalAdsCount,
    setSearchQuery,
    searchQuery,
    loadMore
  };
} 