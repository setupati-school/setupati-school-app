import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Images, LogIn } from 'lucide-react';
import i18n from '../../../i18n';
import { useSchoolStore } from '../../store/schoolStore';
import { useTranslation } from 'react-i18next';

export const LandingPageNavigation: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  i18n.language = useSchoolStore(state => state.currentLanguage);

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">
              {t('title')} School
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              to="/gallery"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/gallery'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Gallery
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link to="/gallery" className="md:hidden">
              <Button variant="ghost" size="icon">
                <Images className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="login" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
