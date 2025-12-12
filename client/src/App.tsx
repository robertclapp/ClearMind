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
import { useEffect, useState, lazy, Suspense, ComponentType } from "react";
import { initOfflineStorage } from "./lib/offlineStorage";
import { PageSkeleton } from "./components/ui/skeleton";

// Lazy-loaded pages for better performance (code splitting)
const HomePage = lazy(() => import("./pages/HomePage"));
const PagesPage = lazy(() => import("./pages/PagesPage"));
const PageDetailPage = lazy(() => import("./pages/PageDetailPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const DatabasesPage = lazy(() => import("./pages/DatabasesPage"));
const DatabaseDetailPage = lazy(() => import("./pages/DatabaseDetailPage"));
const MoodTrackerPage = lazy(() => import("./pages/MoodTrackerPage"));
const AutomationsPage = lazy(() => import("./pages/AutomationsPage"));

/**
 * Loading fallback component for Suspense boundaries.
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute wrapper ensures user is authenticated.
 * Uses Suspense for lazy-loaded components.
 */
function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

// Pre-create protected route components to avoid recreation on each render
const ProtectedHomePage = () => <ProtectedRoute component={HomePage} />;
const ProtectedPagesPage = () => <ProtectedRoute component={PagesPage} />;
const ProtectedPageDetailPage = () => <ProtectedRoute component={PageDetailPage} />;
const ProtectedDatabasesPage = () => <ProtectedRoute component={DatabasesPage} />;
const ProtectedDatabaseDetailPage = () => <ProtectedRoute component={DatabaseDetailPage} />;
const ProtectedTimelinePage = () => <ProtectedRoute component={TimelinePage} />;
const ProtectedMoodTrackerPage = () => <ProtectedRoute component={MoodTrackerPage} />;
const ProtectedAutomationsPage = () => <ProtectedRoute component={AutomationsPage} />;
const ProtectedSettingsPage = () => <ProtectedRoute component={SettingsPage} />;
const RedirectToHome = () => <Redirect to="/home" />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={RedirectToHome} />
      <Route path="/home" component={ProtectedHomePage} />
      <Route path="/pages" component={ProtectedPagesPage} />
      <Route path="/pages/:id" component={ProtectedPageDetailPage} />
      <Route path="/databases" component={ProtectedDatabasesPage} />
      <Route path="/databases/:id" component={ProtectedDatabaseDetailPage} />
      <Route path="/timeline" component={ProtectedTimelinePage} />
      <Route path="/mood" component={ProtectedMoodTrackerPage} />
      <Route path="/automations" component={ProtectedAutomationsPage} />
      <Route path="/settings" component={ProtectedSettingsPage} />
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
        switchable
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
