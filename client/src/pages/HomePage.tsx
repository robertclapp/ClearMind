import { useAuth } from '@/_core/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { FileText, Database, Calendar, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { APP_NAME, APP_TAGLINE } from '@shared/const';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * HomePage displays the main dashboard with quick access to recent items
 * and quick actions.
 */
export default function HomePage() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [, setLocation] = useLocation();

  // Dialog states
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isDatabaseDialogOpen, setIsDatabaseDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // Form states
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');

  // Fetch recent pages
  const { data: recentPages, refetch: refetchPages } = trpc.pages.getRecent.useQuery(
    { workspaceId: workspace?.id || 0, limit: 5 },
    { enabled: !!workspace }
  );

  // Fetch databases
  const { data: databases, refetch: refetchDatabases } = trpc.databases.getByWorkspace.useQuery(
    { workspaceId: workspace?.id || 0 },
    { enabled: !!workspace }
  );

  // Fetch today's timeline events
  const { data: todayEvents, refetch: refetchEvents } = trpc.timeline.getByDate.useQuery(
    { date: new Date() },
    { enabled: !!user }
  );

  // Create page mutation
  const createPageMutation = trpc.pages.create.useMutation({
    onSuccess: (page) => {
      toast.success('Page created successfully');
      setIsPageDialogOpen(false);
      setNewPageTitle('');
      refetchPages();
      setLocation(`/pages/${page.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create page: ${error.message}`);
    },
  });

  // Create database mutation
  const createDatabaseMutation = trpc.databases.create.useMutation({
    onSuccess: (database) => {
      toast.success('Database created successfully');
      setIsDatabaseDialogOpen(false);
      setNewDatabaseName('');
      refetchDatabases();
      setLocation(`/databases/${database.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create database: ${error.message}`);
    },
  });

  // Create event mutation
  const createEventMutation = trpc.timeline.create.useMutation({
    onSuccess: () => {
      toast.success('Event created successfully');
      setIsEventDialogOpen(false);
      setNewEventTitle('');
      setNewEventTime('09:00');
      refetchEvents();
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      toast.error('Please enter a page title');
      return;
    }
    if (!workspace) {
      toast.error('No workspace found');
      return;
    }
    await createPageMutation.mutateAsync({
      workspaceId: workspace.id,
      title: newPageTitle,
    });
  };

  const handleCreateDatabase = async () => {
    if (!newDatabaseName.trim()) {
      toast.error('Please enter a database name');
      return;
    }
    if (!workspace) {
      toast.error('No workspace found');
      return;
    }
    await createDatabaseMutation.mutateAsync({
      workspaceId: workspace.id,
      name: newDatabaseName,
      schema: JSON.stringify({
        properties: [
          { id: 'title', name: 'Title', type: 'title' },
          { id: 'status', name: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'] },
        ],
      }),
    });
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }
    const [hours, minutes] = newEventTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);

    await createEventMutation.mutateAsync({
      title: newEventTitle,
      startTime,
      estimatedDuration: 30,
    });
  };

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
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIsPageDialogOpen(true)}
          >
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

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIsDatabaseDialogOpen(true)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Database className="h-6 w-6 text-blue-500" />
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

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIsEventDialogOpen(true)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-500" />
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

        {/* Create Page Dialog */}
        <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Enter a title for your new page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="page-title">Title</Label>
                <Input
                  id="page-title"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="My New Page"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
                {createPageMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Page'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Database Dialog */}
        <Dialog open={isDatabaseDialogOpen} onOpenChange={setIsDatabaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Database</DialogTitle>
              <DialogDescription>
                Enter a name for your new database
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="database-name">Name</Label>
                <Input
                  id="database-name"
                  value={newDatabaseName}
                  onChange={(e) => setNewDatabaseName(e.target.value)}
                  placeholder="My Database"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDatabase()}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDatabaseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDatabase} disabled={createDatabaseMutation.isPending}>
                {createDatabaseMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Database'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Event Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Schedule a new event for today
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="My Event"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Event'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
