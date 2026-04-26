import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Lang } from './index';

interface Props {
  lang: Lang;
}

const LangLayout = ({ lang }: Props) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  return (
    <>
      {/* React 19가 <head>로 자동 hoisting */}
      <title>{t('meta.title')}</title>
      <Outlet />
    </>
  );
};

export default LangLayout;
