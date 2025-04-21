'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getTagsForAd, removeTagFromAd } from '../../lib/tagService';
import { Tag } from '../../types/tag';
import AdTagEditor from './AdTagEditor';
import { useTagStore } from '../../store/tagStore';

interface AdCardProps {
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
}

export default function AdCard({ ad }: AdCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [tagEditorAnchor, setTagEditorAnchor] = useState<DOMRect | null>(null);
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
    
    // if (tagAreaRef.current) {
    //   const rect = tagAreaRef.current.getBoundingClientRect();
    //   setTagEditorAnchor(rect);
    //   setShowTagEditor(true);
    // }
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setTags(newTags);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

      {/* Library ID and Running Time Info */}
      <div className="p-3 border-b border-gray-200">
        <div className="text-[10px]">
          <p className="text-gray-700">Library ID: {ad.library_id || 'N/A'}</p>
          <p className="text-gray-700 mt-1">
            Started running on {ad.started_running_on ? new Date(ad.started_running_on).toLocaleDateString() : 'N/A'}
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

      {/* Tags section - Modified to make the entire area clickable */}
      <div 
        ref={tagAreaRef}
        onClick={handleTagAreaClick}
        className="px-4 py-2 border-t cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {loading ? (
            <div className="animate-pulse flex">
              {[1, 2].map(i => (
                <div key={i} className="h-6 w-16 bg-gray-200 rounded-full mx-1"></div>
              ))}
            </div>
          ) : tags.length > 0 ? (
            tags.map(tag => (
              <span 
                key={tag.id} 
                className="px-2 py-0.5 text-xs rounded"
                style={{ backgroundColor: tag.color || '#FFFFFF' }}
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">Add tags...</span>
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