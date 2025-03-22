import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Tag } from '../types/tag';
import { getAdsByTag } from '../lib/tagService';

export function useAdsData(pageSize: number = 4) {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAdsCount, setTotalAdsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Load all available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        setTagsLoading(true);
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');

        if (error) throw error;
        setAvailableTags(data || []);
      } catch (err) {
        console.error('Error loading tags:', err);
      } finally {
        setTagsLoading(false);
      }
    };

    loadTags();
  }, []);

  // Reset page and ads when search query or selected tags change
  useEffect(() => {
    setPage(1);
    setAds([]);
    setHasMore(true);
  }, [searchQuery, selectedTagIds]);

  // Fetch total count when search query or selected tags change
  useEffect(() => {
    const getTotalCount = async () => {
      try {
        // If tags are selected, we need to filter by tag IDs
        if (selectedTagIds.length > 0) {
          // Get all ad IDs that have any of the selected tags
          const tagPromises = selectedTagIds.map(tagId => getAdsByTag(tagId));
          const tagResults = await Promise.all(tagPromises);
          
          // Merge and deduplicate ad IDs
          const adIds = [...new Set(tagResults.flat())];
          
          if (adIds.length === 0) {
            setTotalAdsCount(0);
            return;
          }

          // Now query with these ad IDs
          let query = supabase
            .from('facebook_ads')
            .select('*', { count: 'exact', head: true })
            .in('id', adIds);

          if (searchQuery) {
            query = query.or(`ad_text.ilike.%${searchQuery}%,advertiser_name.ilike.%${searchQuery}%`);
          }

          const { count, error } = await query;
          if (error) throw error;
          setTotalAdsCount(count || 0);
        } else {
          // Regular search without tag filtering
          let query = supabase
            .from('facebook_ads')
            .select('*', { count: 'exact', head: true });
          
          if (searchQuery) {
            query = query.or(`ad_text.ilike.%${searchQuery}%,advertiser_name.ilike.%${searchQuery}%`);
          }

          const { count, error } = await query;
          if (error) throw error;
          setTotalAdsCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching total count:', err);
      }
    };

    getTotalCount();
  }, [searchQuery, selectedTagIds]);

  // Fetch ads with tag filtering
  useEffect(() => {
    const fetchAds = async () => {
      if (!hasMore) return;
      
      try {
        setLoading(true);
        
        // If tags are selected, we need a different approach
        if (selectedTagIds.length > 0) {
          const tagPromises = selectedTagIds.map(tagId => getAdsByTag(tagId));
          const tagResults = await Promise.all(tagPromises);
          
          // Merge and deduplicate ad IDs
          const adIds = [...new Set(tagResults.flat())];
          
          if (adIds.length === 0) {
            setAds([]);
            setHasMore(false);
            return;
          }

          // Now query with these ad IDs
          let query = supabase
            .from('facebook_ads')
            .select('*')
            .in('id', adIds)
            .order('captured_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

          if (searchQuery) {
            query = query.or(`ad_text.ilike.%${searchQuery}%,advertiser_name.ilike.%${searchQuery}%`);
          }

          const { data, error } = await query;
          if (error) throw error;
          
          if (!data || data.length < pageSize) {
            setHasMore(false);
          }
          
          if (data && data.length > 0) {
            setAds(prevAds => page === 1 ? data : [...prevAds, ...data]);
          } else if (page === 1) {
            setAds([]);
          }
        } else {
          // Regular search without tag filtering
          let query = supabase
            .from('facebook_ads')
            .select('*')
            .order('captured_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

          if (searchQuery) {
            query = query.or(`ad_text.ilike.%${searchQuery}%,advertiser_name.ilike.%${searchQuery}%`);
          }

          const { data, error } = await query;
          if (error) throw error;
          
          if (!data || data.length < pageSize) {
            setHasMore(false);
          }
          
          if (data && data.length > 0) {
            setAds(prevAds => page === 1 ? data : [...prevAds, ...data]);
          } else if (page === 1) {
            setAds([]);
          }
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [page, hasMore, pageSize, searchQuery, selectedTagIds]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagIds(prevSelected => 
      prevSelected.includes(tagId)
        ? prevSelected.filter(id => id !== tagId)
        : [...prevSelected, tagId]
    );
  };

  return {
    ads,
    loading,
    error,
    hasMore,
    totalAdsCount,
    setSearchQuery,
    searchQuery,
    loadMore,
    availableTags,
    tagsLoading,
    selectedTagIds,
    toggleTagFilter
  };
} 