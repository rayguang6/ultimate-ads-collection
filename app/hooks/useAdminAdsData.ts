'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAdsWithTags, deleteAd, getTags, getStats } from '../lib/adminService';
import { Tag } from '../types/tag';

export default function useAdminAdsData() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAds, setTotalAds] = useState(0);
  const [totalTags, setTotalTags] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        setTagsLoading(true);
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setTagsLoading(false);
      }
    };

    loadTags();
  }, []);

  // Load dashboard stats
  const loadStats = useCallback(async () => {
    try {
      const stats = await getStats();
      setTotalAds(stats.totalAds);
      setTotalTags(stats.totalTags);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reset state when search query or selected tags change
  useEffect(() => {
    setAds([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [searchQuery, selectedTags]);

  // Fetch ads based on current page and filters
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const tagIds = selectedTags.map(tag => tag.id);
      const offset = (page - 1) * limit;
      const fetchedAds = await getAdsWithTags(searchQuery, tagIds);
      
      // Apply pagination locally since the API doesn't support it
      const paginatedAds = fetchedAds.slice(offset, offset + limit);
      
      if (page === 1) {
        setAds(paginatedAds);
      } else {
        setAds(prevAds => [...prevAds, ...paginatedAds]);
      }
      
      setHasMore(paginatedAds.length === limit && offset + limit < fetchedAds.length);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setError('Failed to load ads');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedTags, limit]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleTagSelect = useCallback((tag: Tag) => {
    setSelectedTags(prevTags => {
      if (prevTags.some(t => t.id === tag.id)) {
        return prevTags.filter(t => t.id !== tag.id);
      } else {
        return [...prevTags, tag];
      }
    });
  }, []);

  const handleDeleteAd = useCallback(async (adId: string) => {
    try {
      await deleteAd(adId);
      setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      
      // Refresh stats after deletion
      loadStats();
    } catch (error) {
      console.error('Error deleting ad:', error);
      throw error; // Re-throw to handle in the component
    }
  }, [loadStats]);

  // Function to refresh ads (used when creating new ads)
  const refreshAds = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadStats();
    fetchAds();
  }, [fetchAds, loadStats]);

  return {
    ads,
    loading,
    error,
    totalAds,
    totalTags,
    availableTags,
    tagsLoading,
    selectedTags,
    hasMore,
    searchQuery,
    loadMore,
    handleSearch,
    handleTagSelect,
    handleDeleteAd,
    refreshAds
  };
}