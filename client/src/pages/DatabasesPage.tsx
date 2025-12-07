import { useState } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Database, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import EmojiPicker from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * DatabasesPage displays all databases in the workspace.
 */
export default function DatabasesPage() {
  const { workspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state
  const [newDbName, setNewDbName] = useState('');
  const [newDbDescription, setNewDbDescription] = useState('');
  const [newDbIcon, setNewDbIcon] = useState('📊');

  const { data: databases, isLoading, refetch } = trpc.databases.getByWorkspace.useQuery(
    { workspaceId: workspace?.id || 0 },
    { enabled: !!workspace }
  );

  const createDatabaseMutation = trpc.databases.create.useMutation({
    onSuccess: () => {
      toast.success('Database created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create database: ${error.message}`);
    },
  });

  const resetForm = () => {
    setNewDbName('');
    setNewDbDescription('');
    setNewDbIcon('📊');
  };

  const handleCreateDatabase = async () => {
    if (!workspace) return;
    if (!newDbName.trim()) {
      toast.error('Please enter a database name');
      return;
    }

    // Create default schema with basic properties
    const defaultSchema = JSON.stringify({
      properties: [
        { id: '1', name: 'Name', type: 'title', required: true },
        { id: '2', name: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Complete'] },
        { id: '3', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
        { id: '4', name: 'Due Date', type: 'date' },
      ],
    });

    await createDatabaseMutation.mutateAsync({
      workspaceId: workspace.id,
      name: newDbName,
      description: newDbDescription || undefined,
      icon: newDbIcon,
      schema: defaultSchema,
    });
  };

  const filteredDatabases = databases?.filter((db: any) =>
    db.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Databases</h1>
            <p className="text-muted-foreground">
              Organize and visualize your structured data
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Database
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Database</DialogTitle>
                <DialogDescription>
                  Create a new database to organize your information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="text-3xl h-auto p-3">
                        {newDbIcon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => setNewDbIcon(emojiData.emoji)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="db-name">Name</Label>
                  <Input
                    id="db-name"
                    value={newDbName}
                    onChange={(e) => setNewDbName(e.target.value)}
                    placeholder="My Database"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="db-description">Description (optional)</Label>
                  <Textarea
                    id="db-description"
                    value={newDbDescription}
                    onChange={(e) => setNewDbDescription(e.target.value)}
                    placeholder="What is this database for?"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDatabase}
                  disabled={createDatabaseMutation.isPending}
                >
                  Create Database
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search databases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Databases Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading databases...
          </div>
        ) : filteredDatabases && filteredDatabases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatabases.map((db: any) => (
              <Link key={db.id} href={`/databases/${db.id}`}>
                <a>
                  <Card className="hover:shadow-lg transition-all hover:scale-105">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <span className="text-4xl">{db.icon || '📊'}</span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate">{db.name}</CardTitle>
                          {db.description && (
                            <CardDescription className="line-clamp-2">
                              {db.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Updated {new Date(db.updatedAt).toLocaleDateString()}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No databases yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first database to start organizing your data
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Database
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
