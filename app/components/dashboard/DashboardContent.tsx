'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Navbar from '../common/Navbar';
import AdCard from '../facebook-ads/AdCard';

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adsLoading, setAdsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAdsCount, setTotalAdsCount] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 4;

  const router = useRouter();

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

  // Fetch total count only once when component mounts
  useEffect(() => {
    const getTotalCount = async () => {
      try {
        const { count, error } = await supabase
          .from('facebook_ads')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setTotalAdsCount(count || 0);
        console.log('Total ads count:', count);
      } catch (err) {
        console.error('Error fetching total count:', err);
      }
    };

    if (!loading && user) {
      getTotalCount();
    }
  }, [loading, user]);

  useEffect(() => {
    const fetchAds = async () => {
      if (!hasMore) return;
      
      try {
        setAdsLoading(true);
        console.log(`Fetching ads for page: ${page}, range: ${(page - 1) * pageSize} to ${page * pageSize - 1}`);
        
        const { data, error } = await supabase
          .from('facebook_ads')
          .select('*')
          .order('captured_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) throw error;

        console.log('Fetched ads count:', data?.length);
        
        if (!data || data.length < pageSize) {
          setHasMore(false);
          console.log('No more ads to load');
        }
        
        if (data && data.length > 0) {
          setAds(prevAds => [...prevAds, ...data]);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads. Please try again later.');
      } finally {
        setAdsLoading(false);
        console.log('Ads loading complete for page:', page);
      }
    };

    if (!loading && user) {
      fetchAds();
    }
  }, [loading, user, page, hasMore, pageSize]);

  const lastAdElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (adsLoading) return;
      
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          console.log('Observer triggered: Loading more ads...');
          setPage(prevPage => prevPage + 1);
        }
      }, {
        rootMargin: '100px 0px -200px 0px', // Trigger when the user is 200px from the bottom
        threshold: 0 // Trigger when the element is fully visible
      });
      
      if (node) {
        observer.current.observe(node);
        console.log('Observer is now watching the last ad element');
      }
    },
    [adsLoading, hasMore]
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userEmail={user?.email} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Facebook Ads Collection</h1>
          <p className="text-gray-600">
            {ads.length > 0 && `Showing ${ads.length} of ${totalAdsCount} ads`}
          </p>
        </div>
        
        {error ? (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        ) : ads.length === 0 && !adsLoading ? (
          <p className="text-gray-600">No ads available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad, index) => (
              <div key={ad.id} ref={index === ads.length - 1 ? lastAdElementRef : undefined}>
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        )}
        
        {/* Only show loading indicator when loading more ads */}
        {adsLoading && hasMore && (
          <div className="flex justify-center items-center mt-8 mb-4 p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading more ads...</span>
          </div>
        )}
        
        {!hasMore && ads.length > 0 && (
          <p className="text-center text-gray-500 mt-6 p-4 border-t border-gray-200">
            You've reached the end! No more ads to load.
          </p>
        )}
      </main>
    </div>
  );
} 