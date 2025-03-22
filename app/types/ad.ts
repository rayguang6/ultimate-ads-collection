import { Tag } from './tag';

export interface Ad {
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
  tags?: Tag[];
} 