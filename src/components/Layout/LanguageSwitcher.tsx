import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSchoolStore } from '@/store/schoolStore';
import { Languages, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import i18n from '../../../i18n';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
];

function changeGoogleLanguage(code: string) {
  document.cookie = `googtrans=/auto/${code}; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=/auto/${code}; path=/;`;
  document.documentElement.lang = code;

  window.location.reload();
}

export const LanguageSwitcher = () => {
  const currentLanguage = useSchoolStore((state) => state.currentLanguage);
  const setCurrentLanguage = useSchoolStore(
    (state) => state.setCurrentLanguage
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              changeGoogleLanguage(language.code);
              setCurrentLanguage(language.code);
              i18n.changeLanguage(language.code);
            }}
            className={cn(
              'cursor-pointer',
              currentLanguage === language.code && 'bg-accent'
            )}
          >
            <span className="mr-2">{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
