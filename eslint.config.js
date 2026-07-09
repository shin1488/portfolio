import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/**
 * FSD(Feature-Sliced Design) 레이어 의존성 방향을 강제하는 lint 설정.
 *
 * 레이어(위 → 아래로만 의존 가능. 아래가 위를 import하면 에러):
 *   app        → 앱 셸/조립점. 모든 레이어 import 가능
 *   feature    → 도메인 슬라이스(profile·skills·projects·careers).
 *                같은 feature 내부는 자유롭게 import, 다른 feature import는 금지(슬라이스 독립).
 *                아래 레이어(layout·ui·data·lib·content·types)는 import 가능
 *   layout     → 셸 UI. ui·data·lib·content·types만
 *   ui         → 공용 프리미티브. ui·lib·types만 (data/feature 금지)
 *   data       → 데이터 레이어. lib·content·types만
 *   lib        → 유틸/훅. lib·types만
 *   types      → 타입 leaf. types만
 *   content    → 마크다운. 코드 import 없음
 *
 * 이렇게 하면 "낮은 레이어가 높은 레이어를 몰라야 한다"는 단방향 의존이 CI/에디터에서 강제된다.
 *
 * react-hooks 규칙은 off로 등록만 한다 — 소스에 남아 있는 `eslint-disable react-hooks/*`
 * 주석이 '정의되지 않은 규칙' 에러를 내지 않게 하기 위한 것. 필요하면 'warn'으로 켜도 된다.
 */
export default [
  { ignores: ['dist/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    plugins: { boundaries, 'react-hooks': reactHooks },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'feature', pattern: 'src/features/*/**', capture: ['feature'] },
        { type: 'layout', pattern: 'src/components/layout/**' },
        { type: 'ui', pattern: 'src/components/ui/**' },
        { type: 'data', pattern: 'src/data/**' },
        { type: 'lib', pattern: 'src/lib/**' },
        { type: 'content', pattern: 'src/content/**' },
        { type: 'types', pattern: 'src/types/**' },
      ],
    },
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { from: { element: { types: 'app' } }, allow: { to: { element: { types: { anyOf: ['app', 'feature', 'layout', 'ui', 'data', 'lib', 'content', 'types'] } } } } },
            // 같은 feature 내부만 허용(크로스-피처 금지 → 슬라이스 독립)
            { from: { element: { types: 'feature' } }, allow: { to: { element: { types: 'feature', captured: { feature: '{{ from.captured.feature }}' } } } } },
            { from: { element: { types: 'feature' } }, allow: { to: { element: { types: { anyOf: ['layout', 'ui', 'data', 'lib', 'content', 'types'] } } } } },
            { from: { element: { types: 'layout' } }, allow: { to: { element: { types: { anyOf: ['layout', 'ui', 'data', 'lib', 'content', 'types'] } } } } },
            { from: { element: { types: 'ui' } }, allow: { to: { element: { types: { anyOf: ['ui', 'lib', 'types'] } } } } },
            { from: { element: { types: 'data' } }, allow: { to: { element: { types: { anyOf: ['data', 'lib', 'content', 'types'] } } } } },
            { from: { element: { types: 'lib' } }, allow: { to: { element: { types: { anyOf: ['lib', 'types'] } } } } },
            { from: { element: { types: 'types' } }, allow: { to: { element: { types: 'types' } } } },
          ],
        },
      ],
    },
  },
];
