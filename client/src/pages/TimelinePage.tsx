import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { COLORS } from '@shared/const';
import EmojiPicker from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * TimelinePage displays the visual timeline planner (Tiimo-style).
 * Shows events for the selected date with flexible scheduling.
 */
export default function TimelinePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);

  // Form state for new event
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventDuration, setNewEventDuration] = useState('30');
  const [newEventColor, setNewEventColor] = useState<string>(COLORS[4].value);
  const [newEventIcon, setNewEventIcon] = useState('📅');

  const { data: events, refetch } = trpc.timeline.getByDate.useQuery(
    { date: selectedDate },
    { enabled: !!user }
  );

  const createEventMutation = trpc.timeline.create.useMutation({
    onSuccess: () => {
      toast.success('Event created');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const updateEventMutation = trpc.timeline.update.useMutation({
    onSuccess: () => {
      toast.success('Event updated');
      refetch();
    },
  });

  const deleteEventMutation = trpc.timeline.delete.useMutation({
    onSuccess: () => {
      toast.success('Event deleted');
      refetch();
    },
  });

  const resetForm = () => {
    setNewEventTitle('');
    setNewEventTime('09:00');
    setNewEventDuration('30');
    setNewEventColor(COLORS[4].value);
    setNewEventIcon('📅');
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    const [hours, minutes] = newEventTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);

    await createEventMutation.mutateAsync({
      title: newEventTitle,
      startTime,
      estimatedDuration: parseInt(newEventDuration),
      color: newEventColor,
      icon: newEventIcon,
    });
  };

  const handleToggleComplete = async (eventId: number, completed: boolean) => {
    await updateEventMutation.mutateAsync({
      id: eventId,
      completed: !completed,
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    setDeleteEventId(eventId);
  };

  const confirmDeleteEvent = async () => {
    if (deleteEventId !== null) {
      await deleteEventMutation.mutateAsync({ id: deleteEventId });
      setDeleteEventId(null);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Timeline</h1>
            <p className="text-muted-foreground">
              Visual planning for your day
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>
                  Add a new event to your timeline
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Start Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newEventDuration}
                      onChange={(e) => setNewEventDuration(e.target.value)}
                      min="5"
                      step="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewEventColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newEventColor === color.value
                            ? 'border-foreground scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="text-2xl">
                        {newEventIcon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => setNewEventIcon(emojiData.emoji)}
                      />
                    </PopoverContent>
                  </Popover>
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
                  onClick={handleCreateEvent}
                  disabled={createEventMutation.isPending}
                >
                  Create Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Date Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const yesterday = new Date(selectedDate);
                  yesterday.setDate(yesterday.getDate() - 1);
                  setSelectedDate(yesterday);
                }}
              >
                Previous Day
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const tomorrow = new Date(selectedDate);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                }}
              >
                Next Day
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Events */}
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event: any) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 transition-all ${
                      event.completed ? 'opacity-60' : ''
                    }`}
                    style={{ borderLeftColor: event.color || '#3B82F6' }}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(event.id, event.completed)}
                        className="mt-1"
                      >
                        <CheckCircle2
                          className={`h-5 w-5 ${
                            event.completed ? 'text-success fill-success' : 'text-muted-foreground'
                          }`}
                        />
                      </button>

                      <span className="text-2xl">{event.icon || '📅'}</span>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold ${
                            event.completed ? 'line-through' : ''
                          }`}
                        >
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.startTime)}
                          </span>
                          {event.estimatedDuration && (
                            <span>{event.estimatedDuration} min</span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No events scheduled</p>
                <p className="mb-4">Add your first event to start planning your day</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteEventId !== null} onOpenChange={(open) => !open && setDeleteEventId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteEventId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteEvent}
                disabled={deleteEventMutation.isPending}
              >
                {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
