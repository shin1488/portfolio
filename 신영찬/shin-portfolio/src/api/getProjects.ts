import { supabase } from './supabase';

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_stacks (
        tech_stacks (
          name
        )
      )
    `)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('프로젝트를 불러오지 못했습니다:', error);
    return [];
  }

  // 데이터 구조를 사용하기 편하게 가공
  return data.map(project => ({
    ...project,
    // 중첩된 객체 구조를 단순 배열로 펼침
    stacks: project.project_stacks.map((ps: any) => ps.tech_stacks)
  }));
};