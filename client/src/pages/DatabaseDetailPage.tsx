import { useRoute } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { DatabaseTableView } from '@/components/DatabaseTableView';
import { DatabaseKanbanView } from '@/components/DatabaseKanbanView';
import { DatabaseCalendarView } from '@/components/DatabaseCalendarView';
import { DatabaseGalleryView } from '@/components/DatabaseGalleryView';
import { DatabaseListView } from '@/components/DatabaseListView';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Table, LayoutGrid, Calendar, List } from 'lucide-react';

/**
 * DatabaseDetailPage displays a single database with different view options.
 */
export default function DatabaseDetailPage() {
  const [, params] = useRoute('/databases/:id');
  const databaseId = params?.id ? parseInt(params.id) : 0;

  const { data: database, isLoading } = trpc.databases.getById.useQuery(
    { id: databaseId },
    { enabled: databaseId > 0 }
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!database) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Database not found</h2>
            <p className="text-muted-foreground">
              The database you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const schema = JSON.parse(database.schema);

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <span className="text-5xl">{database.icon || '📊'}</span>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{database.name}</h1>
            {database.description && (
              <p className="text-lg text-muted-foreground">{database.description}</p>
            )}
          </div>
        </div>

        {/* Views Tabs */}
        <Tabs defaultValue="table" className="w-full">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <DatabaseTableView databaseId={databaseId} schema={schema} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <DatabaseKanbanView databaseId={databaseId} schema={schema} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <DatabaseCalendarView databaseId={databaseId} schema={schema} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <DatabaseGalleryView databaseId={databaseId} schema={schema} />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <DatabaseListView databaseId={databaseId} schema={schema} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
