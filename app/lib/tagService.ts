import { supabase } from './supabase';
import { Tag } from '../types/tag';

export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getTagsForAd(adId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('ad_tags')
    .select('tags(id, name, color)')
    .eq('ad_id', adId);
  
  if (error) throw error;
  return data?.map(item => item.tags) || [];
}

export async function addTag(name: string, color: string): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, color }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<void> {
  const { error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function tagAd(adId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('ad_tags')
    .insert([{ ad_id: adId, tag_id: tagId }]);
  
  if (error) throw error;
}

export async function removeTagFromAd(adId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('ad_tags')
    .delete()
    .match({ ad_id: adId, tag_id: tagId });
  
  if (error) throw error;
}

export async function getAdsByTag(tagId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('ad_tags')
    .select('ad_id')
    .eq('tag_id', tagId);
  
  if (error) throw error;
  return data?.map(item => item.ad_id) || [];
} 