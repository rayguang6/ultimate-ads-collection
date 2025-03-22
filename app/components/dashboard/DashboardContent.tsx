'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Navbar from '../common/Navbar';
import AdCard from '../facebook-ads/AdCard';

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adsLoading, setAdsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        // Redirect to sign in if not authenticated
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setAdsLoading(true);
        const { data, error } = await supabase
          .from('facebook_ads')
          .select('*')
          .order('captured_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setAds(data || []);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads. Please try again later.');
      } finally {
        setAdsLoading(false);
      }
    };

    if (!loading && user) {
      fetchAds();
    }
  }, [loading, user]);

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
        <h1 className="text-2xl font-bold mb-6">Facebook Ads Collection</h1>
        
        {adsLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        ) : ads.length === 0 ? (
          <p className="text-gray-600">No ads available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 