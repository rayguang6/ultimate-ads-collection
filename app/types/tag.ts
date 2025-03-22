export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface AdTag {
  ad_id: string;
  tag_id: string;
} 