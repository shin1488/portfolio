import { supabase } from './supabase';
import { type Tables } from '../types/supabase';
import { type TablesInsert } from '../types/supabase';

// 전체 리스트
export const getGuestbooks = async (): Promise<Tables<'guestbook'>[]> => {
  const { data, error } = await supabase
    .from('guestbook')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// 특정 방명록
export const getGuestbook= async (id: number): Promise<Tables<'guestbook'>> => {
  const { data, error } = await supabase
    .from('guestbook')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 공개 방명록만
export const getVisibleGuestbooks = async (): Promise<Tables<'guestbook'>[]> => {
  const { data, error } = await supabase
    .from('guestbook')
    .select('*')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// 방명록 폼 제출 시 create
export const createGuestbook = async (entry: TablesInsert<'guestbook'>) => {
  const { data, error } = await supabase
    .from('guestbook')
    .insert([entry])
    .select();

  if (error) throw error;
  return data;
};