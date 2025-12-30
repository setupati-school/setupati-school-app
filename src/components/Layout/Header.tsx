import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSchoolStore } from '@/store/schoolStore';
import { Bell, LogOut, User, Settings, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { LanguageSwitcher } from '@/components/Layout/LanguageSwitcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';

const HeaderComponent: React.FC = () => {
  const { currentUser, resetStore } = useSchoolStore();
  const { resetAuthStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await signOut(auth);
      resetAuthStore();
      resetStore();
      navigate('/');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to logout User. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">
            Welcome back, {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            Here's what's happening at your school today
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
          {/* Language switcher - hidden on very small screens */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Notifications - proper touch target */}
          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-touch min-w-touch"
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              3
            </Badge>
          </Button>

          {/* User Menu - proper touch target */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full min-h-touch min-w-touch"
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email}
                  </p>
                  <Badge variant="outline" className="w-fit text-xs">
                    {currentUser?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Language switcher for mobile - shown in dropdown */}
              <div className="sm:hidden">
                <DropdownMenuItem asChild>
                  <div className="px-2 py-1">
                    <LanguageSwitcher />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>

              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="min-h-touch cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="min-h-touch cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive min-h-touch cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
