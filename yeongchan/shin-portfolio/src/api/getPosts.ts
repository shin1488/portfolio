import { supabase } from './supabase';

// content 포함되지 않은 가벼운 fetch
export const getCardPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, summary, slug')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

export const getPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
};

export const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, summary, slug, created_at, type')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const incrementViews = async (slug: string, currentViews: number) => {
  const { error } = await supabase
    .from('posts')
    .update({ views: currentViews + 1 })
    .eq('slug', slug);

  if (error) console.error('조회수 업데이트 실패:', error);
};