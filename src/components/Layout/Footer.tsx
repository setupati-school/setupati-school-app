import i18n from '../../../i18n';
import { useSchoolStore } from '../../store/schoolStore';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  i18n.language = useSchoolStore(state => state.currentLanguage);

  return (
    <footer className="py-8 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © 2025 {t('title')} School. All rights reserved. Empowering Education
          Through Technology.
        </p>
      </div>
    </footer>
  );
};
