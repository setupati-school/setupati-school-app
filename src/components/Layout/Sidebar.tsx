import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSchoolStore, useAuthStore } from '@/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';
import { ChevronLeft, ChevronRight, School, Menu, X } from 'lucide-react';
import {
  StudentNavigationItems,
  TeacherNavigationItems,
  AdminNavigationItems
} from './constants';

import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

const SidebarComponent: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useSchoolStore();
  const { role } = useAuthStore();
  const isMobile = useIsMobile();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileNavigation();
  const location = useLocation();
  const navigate = useNavigate();

  let navigationItems = StudentNavigationItems;

  switch (role) {
    case 'teacher':
      navigationItems = TeacherNavigationItems;
      break;
    case 'admin':
      navigationItems = AdminNavigationItems;
      break;
    default:
      navigationItems = StudentNavigationItems;
  }

  // On mobile, use mobile menu state; on desktop, use sidebar collapsed state
  const isCollapsed = isMobile ? !isMobileMenuOpen : sidebarCollapsed;
  const showSidebar = isMobile ? isMobileMenuOpen : true;

  const { t } = useTranslation();
  i18n.language = useSchoolStore((state) => state.currentLanguage);

  const handleNavigate = useCallback(
    (to: string) => {
      navigate(to);
      // Close mobile menu after navigation
      if (isMobile) {
        closeMobileMenu();
      }
    },
    [navigate, isMobile, closeMobileMenu]
  );

  const isPathActive = useCallback(
    (path: string) => {
      if (location.pathname === path) return true;
      // also treat nested URLs as active (e.g. /subjects/123)
      return location.pathname.startsWith(path + '/');
    },
    [location.pathname]
  );

  const handleToggle = () => {
    if (isMobile) {
      toggleMobileMenu();
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - positioned to avoid header overlap */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="mobile-menu-button fixed top-20 left-4 z-50 bg-card border border-border shadow-md min-h-touch min-w-touch"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div
          className={cn(
            'bg-card border-r border-border h-screen transition-all duration-300 ease-in-out',
            // Desktop: sticky positioning, responsive width
            !isMobile && 'sticky top-0',
            !isMobile && (isCollapsed ? 'w-16' : 'w-64'),
            // Mobile: fixed overlay positioning
            isMobile && 'fixed inset-y-0 left-0 z-40 w-64 shadow-xl'
          )}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <School className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="font-bold text-base sm:text-lg text-foreground truncate">
                      {t('title')}
                    </h1>
                    <p className="text-xs text-muted-foreground truncate">
                      School Management
                    </p>
                  </div>
                </div>
              )}

              {/* Desktop toggle button */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggle}
                  className="h-8 w-8 min-h-touch min-w-touch flex-shrink-0"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isPathActive(item.to);

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start transition-all duration-200',
                    // Ensure proper touch targets on mobile
                    'min-h-touch',
                    isCollapsed && 'justify-center px-2',
                    isActive &&
                      'bg-gradient-primary text-primary-foreground shadow-soft'
                  )}
                  onClick={() => handleNavigate(item.to)}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      !isCollapsed && 'mr-3'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Mobile overlay backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export const Sidebar = React.memo(SidebarComponent);
