export interface FacebookAd {
  id: string;
  library_id: string | null;
  started_running_on: string | null;
  advertiser_profile_image: string | null;
  advertiser_profile_link: string | null;
  advertiser_name: string | null;
  ad_text: string | null;
  media_type: string | null;  // e.g. "video" or "image"
  media_url: string | null;   // URL to the media file
  captured_at: string;
} 