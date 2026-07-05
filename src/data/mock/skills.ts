import type { SkillCategory } from '@/types/content';

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Languages',
    skills: [
      { name: 'Java', highlight: true },
      { name: 'Kotlin' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'Python' },
      { name: 'Dart' },
      { name: 'C' },
    ],
  },
  {
    id: 'frameworks',
    title: 'Platforms & Frameworks',
    skills: [
      { name: 'Spring', highlight: true },
      { name: 'Spring AI', highlight: true },
      { name: 'Android' },
      { name: 'React' },
      { name: 'Flutter' },
    ],
  },
  {
    id: 'infra',
    title: 'Infrastructure',
    skills: [
      { name: 'EC2', highlight: true },
      { name: 'ECS Fargate' },
      { name: 'ALB' },
      { name: 'Cloud Map' },
      { name: 'Nginx' },
      { name: 'Docker' },
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    skills: [
      { name: 'PostgreSQL' },
      { name: 'MySQL' },
      { name: 'Firebase' },
      { name: 'Supabase' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    skills: [
      { name: 'Git', highlight: true },
      { name: 'GitHub', highlight: true },
      { name: 'GitLab', highlight: true },
      { name: 'Notion', highlight: true },
      { name: 'Swagger', highlight: true },
      { name: 'Jira' },
      { name: 'Figma' },
    ],
  },
];
