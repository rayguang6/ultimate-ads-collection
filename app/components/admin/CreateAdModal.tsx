'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCreated: () => void;
}

export default function CreateAdModal({ isOpen, onClose, onAdCreated }: CreateAdModalProps) {
  const [formData, setFormData] = useState({
    library_id: '',
    started_running_on: '',
    advertiser_name: '',
    advertiser_profile_link: '',
    ad_text: '',
    media_type: 'image' as 'image' | 'video'
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const profileImageRef = useRef<HTMLInputElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
      
      // Determine media type from file
      const file = e.target.files[0];
      if (file.type.includes('video')) {
        setFormData(prev => ({ ...prev, media_type: 'video' }));
      } else if (file.type.includes('image')) {
        setFormData(prev => ({ ...prev, media_type: 'image' }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      library_id: '',
      started_running_on: '',
      advertiser_name: '',
      advertiser_profile_link: '',
      ad_text: '',
      media_type: 'image'
    });
    setProfileImage(null);
    setMediaFile(null);
    if (profileImageRef.current) profileImageRef.current.value = '';
    if (mediaFileRef.current) mediaFileRef.current.value = '';
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Generate a UUID for the ad
      const adId = uuidv4();
      
      // Generate safe filenames from advertiser name and timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeAdvertiserName = formData.advertiser_name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unknown_advertiser';
      const fileBaseName = `${safeAdvertiserName}_${timestamp}`;
      
      // 1. Upload profile image if provided
      let advertiserProfileImage = '';
      if (profileImage) {
        const profileImageName = `profile_${fileBaseName}`;
        const profileExt = profileImage.name.split('.').pop();
        
        const { data: profileUploadData, error: profileUploadError } = await supabase.storage
          .from('ads-media')
          .upload(`${profileImageName}.${profileExt}`, profileImage, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (profileUploadError) throw new Error(`Profile image upload failed: ${profileUploadError.message}`);
        
        // Get the public URL
        const { data: { publicUrl: profilePublicUrl } } = supabase.storage
          .from('ads-media')
          .getPublicUrl(`${profileImageName}.${profileExt}`);
          
        advertiserProfileImage = profilePublicUrl;
      }
      
      // 2. Upload media file if provided
      let mediaUrl = '';
      if (mediaFile) {
        const mediaFileName = `${fileBaseName}`;
        const mediaExt = mediaFile.name.split('.').pop();
        
        const { data: mediaUploadData, error: mediaUploadError } = await supabase.storage
          .from('ads-media')
          .upload(`${mediaFileName}.${mediaExt}`, mediaFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (mediaUploadError) throw new Error(`Media upload failed: ${mediaUploadError.message}`);
        
        // Get the public URL
        const { data: { publicUrl: mediaPublicUrl } } = supabase.storage
          .from('ads-media')
          .getPublicUrl(`${mediaFileName}.${mediaExt}`);
          
        mediaUrl = mediaPublicUrl;
      }
      
      // 3. Insert ad record into database
      const { data: adData, error: adError } = await supabase
        .from('facebook_ads')
        .insert([
          {
            id: adId,
            library_id: formData.library_id,
            started_running_on: formData.started_running_on,
            advertiser_name: formData.advertiser_name,
            advertiser_profile_link: formData.advertiser_profile_link,
            advertiser_profile_image: advertiserProfileImage,
            ad_text: formData.ad_text,
            media_type: formData.media_type,
            media_url: mediaUrl,
            captured_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (adError) throw new Error(`Database insert failed: ${adError.message}`);
      
      console.log('Ad created successfully:', adData);
      resetForm();
      onAdCreated();
      onClose();
      
    } catch (err: any) {
      console.error('Error creating ad:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Create New Ad</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Library ID
                </label>
                <input
                  type="text"
                  name="library_id"
                  value={formData.library_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 1234567890123456"
                />
                <p className="mt-1 text-xs text-gray-500">Numeric identifier from the Facebook Ad Library</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Started Running On
                </label>
                <input
                  type="text"
                  name="started_running_on"
                  value={formData.started_running_on}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Apr 15, 2025"
                />
                <p className="mt-1 text-xs text-gray-500">Use format like "Apr 15, 2025" or "May 3, 2025"</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advertiser Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="advertiser_name"
                  value={formData.advertiser_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Company Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advertiser Profile Link
                </label>
                <input
                  type="url"
                  name="advertiser_profile_link"
                  value={formData.advertiser_profile_link}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.facebook.com/..."
                />
                <p className="mt-1 text-xs text-gray-500">URL to the advertiser's Facebook page</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Text <span className="text-red-500">*</span>
              </label>
              <textarea
                name="ad_text"
                value={formData.ad_text}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the ad text content here... (Preserves line breaks and spacing)"
                required
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">All spacing and line breaks will be preserved exactly as entered</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advertiser Profile Image
                </label>
                <input
                  type="file"
                  ref={profileImageRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Upload the advertiser's profile picture</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media File ({formData.media_type})
                </label>
                <input
                  type="file"
                  ref={mediaFileRef}
                  onChange={handleMediaFileChange}
                  accept="image/*,video/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Upload the main ad media (image or video). Type will be auto-detected.</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Ad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}