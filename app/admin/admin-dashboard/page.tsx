'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import SearchBar from '@/app/components/common/SearchBar';
import TagSelector from '@/app/components/admin/TagSelector';
import AdminAdsList from '@/app/components/admin/AdminAdsList';
import CreateAdModal from '@/app/components/admin/CreateAdModal';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import useAdminAdsData from '@/app/hooks/useAdminAdsData';

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [adCreatedMessage, setAdCreatedMessage] = useState(false);
  const router = useRouter();
  
  // Use our custom hook for admin ads data
  const { 
    ads, 
    loading: adsLoading, 
    error, 
    hasMore, 
    totalAds,
    totalTags,
    searchQuery,
    loadMore,
    availableTags,
    tagsLoading,
    selectedTags,
    handleSearch,
    handleTagSelect,
    handleDeleteAd,
    refreshAds
  } = useAdminAdsData();

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
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  const handleAdCreated = () => {
    // Refresh the ad list
    refreshAds();
    
    // Show success message
    setAdCreatedMessage(true);
    setTimeout(() => {
      setAdCreatedMessage(false);
    }, 3000);
  };

  if (loading) {
    return <LoadingSpinner fullScreen size="large" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Improved navigation bar */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-800">Ad Manager</h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 rounded-full py-1 px-3 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <button 
                onClick={handleSignOut} 
                className="flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded text-sm transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {adCreatedMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Ad created successfully!</span>
          </div>
        )}

        {/* Stats Cards & Action Buttons */}
        <button
            onClick={() => setShowCreateAdModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Ad
          </button>

        {/* Search and Tag Filters with subtle improvements */}
        <div className="mb-6 flex flex-row items justify-center">
         
          <SearchBar 
            onSearch={handleSearch} 
            totalCount={totalAds} 
            displayedCount={ads.length}
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Filter by Tags:</h3>
          <TagSelector
            tags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            loading={tagsLoading}
          />
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Ads list */}
        <AdminAdsList 
          ads={ads} 
          loading={adsLoading} 
          hasMore={hasMore} 
          onLoadMore={loadMore}
          onDeleteAd={handleDeleteAd}
          searchQuery={searchQuery}
        />
      </main>

      {/* Create Ad Modal */}
      <CreateAdModal 
        isOpen={showCreateAdModal}
        onClose={() => setShowCreateAdModal(false)}
        onAdCreated={handleAdCreated}
      />
    </div>
  );
}