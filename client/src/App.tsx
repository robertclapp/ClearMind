import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import { KeyboardShortcutsPanel } from "./components/KeyboardShortcutsPanel";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { useEffect, useState } from "react";
import { initOfflineStorage } from "./lib/offlineStorage";

// Pages
import HomePage from "./pages/HomePage";
import PagesPage from "./pages/PagesPage";
import PageDetailPage from "./pages/PageDetailPage";
import TimelinePage from "./pages/TimelinePage";
import SettingsPage from "./pages/SettingsPage";
import DatabasesPage from "./pages/DatabasesPage";
import DatabaseDetailPage from "./pages/DatabaseDetailPage";
import MoodTrackerPage from './pages/MoodTrackerPage';
import AutomationsPage from './pages/AutomationsPage';

/**
 * ProtectedRoute wrapper ensures user is authenticated.
 */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/home" />} />
      <Route path="/home" component={() => <ProtectedRoute component={HomePage} />} />
      <Route path="/pages" component={() => <ProtectedRoute component={PagesPage} />} />
      <Route path="/pages/:id" component={() => <ProtectedRoute component={PageDetailPage} />} />
      <Route path="/databases" component={() => <ProtectedRoute component={DatabasesPage} />} />
      <Route path="/databases/:id" component={() => <ProtectedRoute component={DatabaseDetailPage} />} />
      <Route path="/timeline" component={() => <ProtectedRoute component={TimelinePage} />} />
      <Route path="/mood" component={() => <ProtectedRoute component={MoodTrackerPage} />} />
      <Route path="/automations" component={() => <ProtectedRoute component={AutomationsPage} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize offline storage on app start
  useEffect(() => {
    initOfflineStorage();
  }, []);

  // Global keyboard shortcut handler (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <WorkspaceProvider>
            <Router />
            <OnboardingTutorial />
            <KeyboardShortcutsPanel
              open={showShortcuts}
              onClose={() => setShowShortcuts(false)}
            />
          </WorkspaceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
