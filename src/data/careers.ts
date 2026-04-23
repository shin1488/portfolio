import type { Localized } from '../i18n/useLang';

export interface CareerItemData {
    name: Localized;
    date: Localized;
    description: Localized | null;
}

export interface CareerCategoryData {
    id: 'education' | 'awards' | 'activities';
    category: Localized;
    items: CareerItemData[];
}

export const CAREER_DATA: CareerCategoryData[] = [
    {
        id: 'education',
        category: { ko: '학력', jp: '学歴' },
        items: [
            {
                name: {
                    ko: '숭실대학교',
                    jp: '崇実大学校',
                },
                date: '2017.03 - 2023.02',
                description: {
                    ko: '컴퓨터학부',
                    jp: 'コンピュータ学部',
                },
            },
            {
                name: {
                    ko: '동국대학교사범대학부속영석고등학교',
                    jp: '東國大學校師範大學附屬榮錫高等學校',
                },
                date: '2014.03 - 2017.02',
                description: null,
            },
        ],
    },
    {
        id: 'awards',
        category: { ko: '수상 및 자격증', jp: '受賞・資格' },
        items: [
            {
                name: {
                    ko: '넥슨 콘텐츠 리워드 프로그램',
                    jp: 'NEXON コンテンツリワードプログラム',
                },
                date: '2023.06.29',
                description: {
                    ko: '넥슨캐시 100,000원 상당',
                    jp: 'NEXONキャッシュ 100,000ウォン相当',
                },
            },
            {
                name: {
                    ko: '숭실대학교 두드림 학기제 공모전',
                    jp: '崇実大学校 DoDream 学期制コンテスト',
                },
                date: '2021.12.17',
                description: {
                    ko: '장려상',
                    jp: '奨励賞',
                },
            },
            {
                name: {
                    ko: '31사단 독서 감상문 경연대회',
                    jp: '第31師団 読書感想文コンクール',
                },
                date: '2019.02.19',
                description: {
                    ko: '우수상',
                    jp: '優秀賞',
                },
            },
            {
                name: {
                    ko: '정보처리기사',
                    jp: '情報處理技士',
                },
                date: '2022.11.25',
                description: null,
            },
            {
                name: 'JLPT',
                date: '2022.01.13',
                description: 'N1',
            },
            {
                name: {
                    ko: 'mos 2016 Excel',
                    jp: 'MOS 2016 Excel',
                },
                date: '2020.12.14',
                description: 'Expert',
            },
        ],
    },
    {
        id: 'activities',
        category: { ko: '활동', jp: '活動' },
        items: [
            {
                name: {
                    ko: '현대오토에버 모빌리티 SW스쿨 웹・앱',
                    jp: 'Hyundai Autoever モビリティSWスクール Web・アプリ',
                },
                date: {
                    ko: '2025.12 - 현재',
                    jp: '2025.12 - 現在',
                },
                description: null,
            },
            {
                name: {
                    ko: '네이버 부스트캠프 웹・모바일 챌린지',
                    jp: 'NAVER Boostcamp Web・モバイル チャレンジ',
                },
                date: '2023.07 - 2023.08',
                description: {
                    ko: '각종 CS 지식을 Kotlin언어를 통하여 학습하고, 구현하는 과정을 경험하였습니다.',
                    jp: '各種CS知識をKotlin言語を通じて学習し、実装する過程を経験しました。',
                },
            },
        ],
    },
];
