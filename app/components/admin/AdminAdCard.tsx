'use client';

import { useState, useEffect, useRef } from 'react';
import { deleteAd } from '@/app/lib/adminService';
import { getTagsForAd } from '@/app/lib/tagService';
import { Tag } from '@/app/types/tag';
import AdTagEditor from '../facebook-ads/AdTagEditor';
import { useTagStore } from '@/app/store/tagStore';

interface AdminAdCardProps {
  ad: {
    id: string;
    library_id?: string;
    started_running_on?: string;
    advertiser_profile_image?: string;
    advertiser_profile_link?: string;
    advertiser_name?: string;
    ad_text?: string;
    media_type?: string;
    media_url?: string;
    captured_at?: string;
  };
  onDelete: (id: string) => void;
}

export default function AdminAdCard({ ad, onDelete }: AdminAdCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [tagEditorAnchor, setTagEditorAnchor] = useState<DOMRect | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const tagAreaRef = useRef<HTMLDivElement>(null);
  const { tags: globalTags } = useTagStore();

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const adTags = await getTagsForAd(ad.id);
        const updatedTags = adTags.map(adTag => {
          const latestTag = globalTags.find(t => t.id === adTag.id);
          return latestTag || adTag;
        });
        setTags(updatedTags);
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [ad.id, globalTags]);

  // Function to toggle the expanded state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Split the ad text into lines
  const adLines = ad.ad_text ? ad.ad_text.split('\n') : [];

  const handleTagAreaClick = () => {
    if (tagAreaRef.current) {
      const rect = tagAreaRef.current.getBoundingClientRect();
      setTagEditorAnchor(rect);
      setShowTagEditor(true);
    }
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setTags(newTags);
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteAd(ad.id);
        onDelete(ad.id);
      } catch (error) {
        console.error('Error deleting ad:', error);
        alert('Failed to delete ad. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return dateStr;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative hover:shadow-md transition-shadow duration-200">
      {/* Admin Actions */}
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="bg-white hover:bg-red-50 text-red-500 p-1.5 rounded-full shadow-sm transition-colors border border-gray-200 hover:border-red-200"
          title="Delete Ad"
        >
          {isDeleting ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Library ID and Running Time Info */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="text-[10px]">
          <p className="text-gray-700">Library ID: {ad.library_id || 'N/A'}</p>
          <p className="text-gray-700 mt-1">
            Started running on {formatDate(ad.started_running_on)}
          </p>
        </div>
      </div>

      {/* Advertiser Info */}
      <div className="p-3 py-2">
        <div className="flex items-start mb-2">
          {ad.advertiser_profile_image ? (
            <img 
              src={ad.advertiser_profile_image} 
              alt={ad.advertiser_name || 'Advertiser'} 
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
              <span className="text-gray-500 text-xs">No img</span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-xs">{ad.advertiser_name || 'Unknown Advertiser'}</h3>
            <p className="text-[10px] font-bold text-gray-500">Sponsored</p>
          </div>
        </div>
      </div>

      {/* Ad Content */}
      <div className="p-3 pt-0">
        {/* Ad Text */}
        {ad.ad_text && (
          <p className={`text-[10px] text-gray-700 mb-1 whitespace-pre-line ${isExpanded ? '' : 'line-clamp-7'}`}>
            {ad.ad_text}
          </p>
        )}
        
        {/* Show More Button */}
        {adLines.length > 7 && (
          <button onClick={toggleExpand} className="text-blue-500 text-[10px] mt-1">
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}

        {/* Ad Media */}
        {ad.media_url && (
          <div className="rounded overflow-hidden mb-3">
            {ad.media_type === 'image' ? (
              <img 
                src={ad.media_url} 
                alt="Ad content" 
                className="w-full h-[175px] object-contain"
              />
            ) : ad.media_type === 'video' ? (
              <video 
                src={ad.media_url} 
                controls 
                className="w-full h-[175px] object-contain"
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Tags section */}
      <div 
        ref={tagAreaRef}
        onClick={handleTagAreaClick}
        className="px-4 py-2 border-t cursor-pointer hover:bg-gray-50 transition-colors"
        style={{ borderTopColor: '#edf2f7' }}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {loading ? (
            <div className="animate-pulse flex">
              {[1, 2].map(i => (
                <div key={i} className="h-6 w-16 bg-gray-200 rounded-full mx-1"></div>
              ))}
            </div>
          ) : tags.length > 0 ? (
            <>
              <span className="text-xs text-gray-500 mr-1">Tags:</span>
              {tags.map(tag => (
                <span 
                  key={tag.id} 
                  className="px-2 py-0.5 text-xs rounded"
                  style={{ 
                    backgroundColor: `${tag.color}` || '#FFFFFF40', 
                    color: '#000000',
                    border: `1px solid ${tag.color}` || '#00000080'
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </>
          ) : (
            <div className="flex items-center text-gray-400 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Add tags...</span>
            </div>
          )}
        </div>
      </div>
      
      {showTagEditor && (
        <AdTagEditor 
          adId={ad.id} 
          onClose={() => {
            setShowTagEditor(false);
            setTagEditorAnchor(null);
          }}
          anchorRect={tagEditorAnchor}
          currentTags={tags}
          onTagsChange={handleTagsChange}
        />
      )}
    </div>
  );
}