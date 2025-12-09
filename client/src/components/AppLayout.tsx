import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  FileText,
  Database,
  Calendar,
  Smile,
  Settings,
  Menu,
  X,
  Plus,
  ChevronRight,
  Zap,
  Search,
} from 'lucide-react';
import { APP_NAME } from '@shared/const';
import { SearchModal } from '@/components/SearchModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout provides the main application shell with sidebar navigation.
 * 
 * Features:
 * - Collapsible sidebar
 * - Workspace switcher
 * - Navigation menu
 * - User profile menu
 * - Responsive design
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { workspace } = useWorkspace();

  // Global search keyboard shortcut (Cmd+Shift+F or Ctrl+Shift+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const navItems = [
    { href: '/home', label: 'Home', icon: Home, dataOnboarding: '' },
    { href: '/pages', label: 'Pages', icon: FileText, dataOnboarding: 'new-page' },
    { href: '/databases', label: 'Databases', icon: Database, dataOnboarding: 'new-database' },
    { href: '/timeline', label: 'Timeline', icon: Calendar, dataOnboarding: 'timeline' },
    { href: '/mood', label: 'Mood Tracker', icon: Smile, dataOnboarding: 'mood-tracker' },
    { href: '/automations', label: 'Automations', icon: Zap, dataOnboarding: '' },
    { href: '/settings', label: 'Settings', icon: Settings, dataOnboarding: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 border-r bg-card flex flex-col overflow-hidden`}
      >
        {/* Workspace Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-2xl">{workspace?.icon || '🏠'}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">{workspace?.name || 'Workspace'}</h2>
                <p className="text-xs text-muted-foreground">{APP_NAME}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || location.startsWith(item.href + '/');
              
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    data-onboarding={item.dataOnboarding || undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          {/* Quick Actions */}
          <div className="p-2 space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Quick Actions
            </p>
            <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
              <Plus className="h-4 w-4" />
              <span>New Page</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
              <Plus className="h-4 w-4" />
              <span>New Database</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
              <Plus className="h-4 w-4" />
              <span>New Event</span>
            </Button>
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b bg-card flex items-center px-4 gap-4">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex-1" />

          {/* Search Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="gap-2"
            aria-label="Open global search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline px-2 py-0.5 text-xs bg-muted rounded">⌘⇧F</kbd>
          </Button>

          {/* Notifications */}
          <NotificationCenter />
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
