'use client';

import { useRef, useCallback } from 'react';
import AdminAdCard from './AdminAdCard';

interface AdminAdsListProps {
  ads: any[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDeleteAd: (id: string) => void;
  searchQuery: string;
}

export default function AdminAdsList({ 
  ads, 
  loading, 
  hasMore, 
  onLoadMore, 
  onDeleteAd,
  searchQuery 
}: AdminAdsListProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastAdElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      }, {
        rootMargin: '100px 0px -200px 0px',
        threshold: 0
      });
      
      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore, onLoadMore]
  );

  if (ads.length === 0 && !loading) {
    return (
      <p className="text-center text-gray-600 my-12">
        {searchQuery ? 'No ads found matching your search.' : 'No ads available.'}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ads.map((ad, index) => (
          <div 
            key={`${ad.id}-${index}`} 
            ref={index === ads.length - 1 ? lastAdElementRef : undefined}
          >
            <AdminAdCard 
              ad={ad} 
              onDelete={onDeleteAd}
            />
          </div>
        ))}
      </div>
      
      {loading && hasMore && (
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
    </>
  );
} 