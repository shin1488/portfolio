import type { CareerCategory } from '@/types/content';

export const careers: CareerCategory[] = [
  {
    id: 'education',
    title: '학력',
    items: [
      {
        name: '숭실대학교',
        date: '2017.03 - 2023.02',
        description: '컴퓨터학부',
      },
      {
        name: '동국대학교사범대학부속영석고등학교',
        date: '2014.03 - 2017.02',
      },
    ],
  },
  {
    id: 'activities',
    title: '활동',
    items: [
      {
        name: '현대오토에버 모빌리티 SW스쿨 웹・앱',
        date: '2025.12 - 2026.06',
        description:
          '프론트엔드·백엔드·모바일·인프라를 아우르는 프로젝트를 수행하며, AI를 개발 전 과정에 결합해 활용하는 역량을 길렀습니다.',
      },
      {
        name: '네이버 부스트캠프 웹・모바일 챌린지',
        date: '2023.07 - 2023.08',
        description: '각종 CS 지식을 Kotlin언어를 통하여 학습하고, 구현하는 과정을 경험하였습니다.',
      },
    ],
  },
  {
    id: 'awards',
    title: '수상',
    items: [
      {
        name: '웹 어플리케이션 개발 프로젝트',
        date: '2026.06.30',
        description: '우수상',
      },
      {
        name: '넥슨 콘텐츠 리워드 프로그램',
        date: '2023.06.29',
        description: '넥슨캐시 100,000원 상당',
      },
      {
        name: '숭실대학교 두드림 학기제 공모전',
        date: '2021.12.17',
        description: '장려상',
      },
      {
        name: '31사단 독서 감상문 경연대회',
        date: '2019.02.19',
        description: '우수상',
      },
    ],
  },
  {
    id: 'certifications',
    title: '자격증',
    items: [
      {
        name: '정보처리기사',
        date: '2022.11.25',
      },
      {
        name: 'JLPT',
        date: '2022.01.13',
        description: 'N1',
      },
      {
        name: 'MOS 2016 Excel',
        date: '2020.12.14',
        description: 'Expert',
      },
    ],
  },
];
