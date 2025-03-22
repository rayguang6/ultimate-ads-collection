import { supabase } from './supabase';
import { FacebookAd } from '../types/facebook-ads';

/**
 * Fetch all Facebook ads
 */
export async function fetchFacebookAds(): Promise<FacebookAd[]> {
  try {
    const { data, error } = await supabase
      .from('facebook_ads')
      .select('*')
      .order('captured_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching Facebook ads:', error);
      throw error;
    }
    
    return data as FacebookAd[];
  } catch (error) {
    console.error('Failed to fetch Facebook ads:', error);
    throw error;
  }
}

/**
 * Fetch a single Facebook ad by ID
 */
export async function fetchFacebookAdById(id: string): Promise<FacebookAd | null> {
  try {
    const { data, error } = await supabase
      .from('facebook_ads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching Facebook ad with id ${id}:`, error);
      throw error;
    }
    
    return data as FacebookAd;
  } catch (error) {
    console.error('Failed to fetch Facebook ad by ID:', error);
    throw error;
  }
}

/**
 * Fetch Facebook ads with pagination
 */
export async function fetchFacebookAdsWithPagination(
  page: number = 1, 
  pageSize: number = 10
): Promise<{ data: FacebookAd[]; count: number }> {
  try {
    // Calculate the range based on page and pageSize
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Get the total count of ads
    const { count, error: countError } = await supabase
      .from('facebook_ads')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting Facebook ads:', countError);
      throw countError;
    }
    
    // Get the ads for the current page
    const { data, error } = await supabase
      .from('facebook_ads')
      .select('*')
      .order('captured_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching Facebook ads with pagination:', error);
      throw error;
    }
    
    return { 
      data: data as FacebookAd[], 
      count: count || 0 
    };
  } catch (error) {
    console.error('Failed to fetch Facebook ads with pagination:', error);
    throw error;
  }
} 