import { useAuth } from '@/_core/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { FileText, Database, Calendar, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { APP_NAME, APP_TAGLINE } from '@shared/const';

/**
 * HomePage displays the main dashboard with quick access to recent items
 * and quick actions.
 */
export default function HomePage() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();

  // Fetch recent pages
  const { data: recentPages } = trpc.pages.getRecent.useQuery(
    { workspaceId: workspace?.id || 0, limit: 5 },
    { enabled: !!workspace }
  );

  // Fetch databases
  const { data: databases } = trpc.databases.getByWorkspace.useQuery(
    { workspaceId: workspace?.id || 0 },
    { enabled: !!workspace }
  );

  // Fetch today's timeline events
  const { data: todayEvents } = trpc.timeline.getByDate.useQuery(
    { date: new Date() },
    { enabled: !!user }
  );

  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">New Page</CardTitle>
                  <CardDescription>Create a new document</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Database className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">New Database</CardTitle>
                  <CardDescription>Organize structured data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Database
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">New Event</CardTitle>
                  <CardDescription>Schedule on timeline</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Pages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Pages</CardTitle>
                <CardDescription>Your recently edited pages</CardDescription>
              </div>
              <Link href="/pages">
                <a>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPages && recentPages.length > 0 ? (
              <div className="space-y-2">
                {recentPages.map((page: any) => (
                  <Link key={page.id} href={`/pages/${page.id}`}>
                    <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <span className="text-2xl">{page.icon || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{page.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Updated {new Date(page.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pages yet. Create your first page to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your timeline for today</CardDescription>
              </div>
              <Link href="/timeline">
                <a>
                  <Button variant="ghost" size="sm">
                    View Timeline
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {todayEvents && todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{ borderLeftColor: event.color || '#3B82F6', borderLeftWidth: '4px' }}
                  >
                    <span className="text-xl">{event.icon || '📅'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {event.estimatedDuration && ` • ${event.estimatedDuration} min`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events scheduled for today. Add an event to your timeline!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Databases Overview */}
        {databases && databases.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Databases</CardTitle>
                  <CardDescription>Your structured data collections</CardDescription>
                </div>
                <Link href="/databases">
                  <a>
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {databases.slice(0, 6).map((db: any) => (
                  <Link key={db.id} href={`/databases/${db.id}`}>
                    <a className="flex items-center gap-3 p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <span className="text-2xl">{db.icon || '📊'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{db.name}</p>
                        {db.description && (
                          <p className="text-sm text-muted-foreground truncate">{db.description}</p>
                        )}
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
