'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Navbar from '../common/Navbar';
import SearchBar from '../common/SearchBar';
import AdsList from '../facebook-ads/AdsList';
import LoadingSpinner from '../common/LoadingSpinner';
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
    loadMore 
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
      <Navbar userEmail={user?.email} />
      
      <main className="container mx-auto px-4 py-6">
        <SearchBar 
          onSearch={handleSearch} 
          totalCount={totalAdsCount} 
          displayedCount={ads.length}
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