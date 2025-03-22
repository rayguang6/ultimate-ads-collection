'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Navbar from '../common/Navbar';

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user?.email} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Ads Collection</h2>
          <p className="text-gray-600">No ads available. Start adding ads to your collection.</p>
        </div>
      </main>
    </div>
  );
} 