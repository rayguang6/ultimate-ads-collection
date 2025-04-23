import { supabase } from './supabase';

// Types
export interface Ad {
  id: string;
  library_id: string;
  advertiser_name: string;
  ad_text: string;
  media_type: string;
  media_url: string;
  started_running_on: string;
  advertiser_profile_image: string;
  advertiser_profile_link: string;
  captured_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface AdWithTags extends Ad {
  tags: Tag[];
}

// Fetch all ads with their tags
export async function getAdsWithTags(searchQuery?: string, tagIds?: string[]) {
  try {
    let adsQuery = supabase
      .from('facebook_ads')
      .select('*')
      .order('captured_at', { ascending: false });

    // Apply search filtering if provided
    if (searchQuery) {
      adsQuery = adsQuery.or(`ad_text.ilike.%${searchQuery}%,advertiser_name.ilike.%${searchQuery}%`);
    }
    
    // Get ads
    const { data: ads, error: adsError } = await adsQuery;
    
    if (adsError) throw adsError;
    if (!ads) return [];
    
    // For each ad, get its tags
    const adsWithTags = await Promise.all(
      ads.map(async (ad) => {
        const { data: adTags, error: tagsError } = await supabase
          .from('ad_tags')
          .select('tags(*)')
          .eq('ad_id', ad.id);
        
        if (tagsError) throw tagsError;
        
        const tags = adTags?.map(item => item.tags) || [];
        
        return {
          ...ad,
          tags
        };
      })
    );
    
    // Filter by tags if provided
    let filteredAds = adsWithTags;
    if (tagIds && tagIds.length > 0) {
      filteredAds = adsWithTags.filter(ad => {
        return tagIds.some(tagId => ad.tags.some((tag: Tag) => tag.id === tagId));
      });
    }
    
    return filteredAds;
  } catch (error) {
    console.error('Error fetching ads with tags:', error);
    return [];
  }
}

// Get a single ad with its tags
export async function getAdWithTags(id: string) {
  try {
    const { data: ad, error: adError } = await supabase
      .from('facebook_ads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (adError) throw adError;
    if (!ad) return null;
    
    const { data: adTags, error: tagsError } = await supabase
      .from('ad_tags')
      .select('tags(*)')
      .eq('ad_id', id);
    
    if (tagsError) throw tagsError;
    
    const tags = adTags?.map(item => item.tags) || [];
    
    return {
      ...ad,
      tags
    };
  } catch (error) {
    console.error(`Error fetching ad with id ${id}:`, error);
    return null;
  }
}

// Get the count of ads and tags
export async function getStats() {
  try {
    // Get the count of ads
    const { count: adsCount, error: adsError } = await supabase
      .from('facebook_ads')
      .select('*', { count: 'exact', head: true });
    
    // Get the count of tags
    const { count: tagsCount, error: tagsError } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true });
    
    if (adsError) throw adsError;
    if (tagsError) throw tagsError;
    
    return {
      totalAds: adsCount || 0,
      totalTags: tagsCount || 0
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalAds: 0,
      totalTags: 0
    };
  }
}

// Delete an ad and its tag relationships
export async function deleteAd(id: string) {
  try {
    // First delete the tag relationships
    const { error: tagError } = await supabase
      .from('ad_tags')
      .delete()
      .eq('ad_id', id);
    
    if (tagError) {
      console.error(`Error deleting ad tags for ad ${id}:`, tagError);
      return false;
    }
    
    // Then delete the ad
    const { error: adError } = await supabase
      .from('facebook_ads')
      .delete()
      .eq('id', id);
    
    if (adError) {
      console.error(`Error deleting ad ${id}:`, adError);
      return false;
    }
    
    console.log(`Successfully deleted ad ${id}`);
    return true;
  } catch (error) {
    console.error(`Error in deleteAd function for id ${id}:`, error);
    return false;
  }
}

// Get all tags
export async function getTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// Create a new tag
export async function createTag(name: string, color: string = '#D7C9C2') {
  try {
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, color })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating tag:', error);
    return null;
  }
}

// Update a tag
export async function updateTag(id: string, name: string, color?: string) {
  try {
    const updateData: { name: string; color?: string } = { name };
    if (color) {
      updateData.color = color;
    }
    
    const { data, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating tag with id ${id}:`, error);
    return null;
  }
}

// Delete a tag and its relationships
export async function deleteTag(id: string) {
  try {
    // First delete the ad-tag relationships
    await supabase
      .from('ad_tags')
      .delete()
      .eq('tag_id', id);
    
    // Then delete the tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting tag with id ${id}:`, error);
    return false;
  }
} 