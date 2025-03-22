'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface NavbarProps {
  userEmail?: string | null;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href={userEmail ? '/dashboard' : '/'} className="text-xl font-bold text-blue-600">
              Ultimate Ads Collection
            </Link>
          </div>
          
          {userEmail && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 