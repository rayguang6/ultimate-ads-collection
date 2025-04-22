'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Navbar from '@/app/components/common/Navbar';
import SearchBar from '@/app/components/common/SearchBar';
import TagSelector from '@/app/components/common/TagSelector';
import AdsList from '@/app/components/facebook-ads/AdsList';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAdsData } from '@/app/hooks/useAdsData';

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Use our custom hook for ads data
  const { 
    ads, 
    loading: adsLoading, 
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
  } = useAdsData();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data?.user) {
          throw error || new Error('No user found');
        }
        
        setUser(data.user);
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <LoadingSpinner fullScreen size="large" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Navbar userEmail={user?.email} /> */}
      <div className='flex justify-between items-center container mx-auto px-4 py-6'>
        <h1 className='text-2xl font-bold'>Admin Dashboard</h1>
        <div className='flex items-center gap-4'>
          <p className='text-sm text-gray-500'>{user?.email}</p>
          <button onClick={handleSignOut} className='bg-red-500 text-white px-4 py-2 rounded'>Sign Out</button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <SearchBar 
          onSearch={handleSearch} 
          totalCount={totalAdsCount} 
          displayedCount={ads.length}
        />
        
        <TagSelector
          selectedTagIds={selectedTagIds}
          onTagToggle={toggleTagFilter}
        />
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <AdsList 
          ads={ads} 
          loading={adsLoading} 
          hasMore={hasMore} 
          onLoadMore={loadMore}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
} 