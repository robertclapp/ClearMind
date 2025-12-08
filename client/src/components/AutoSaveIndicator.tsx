import { useEffect, useState } from 'react';
import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
}

/**
 * AutoSaveIndicator displays the current save status of the editor.
 * 
 * States:
 * - idle: No recent changes
 * - saving: Currently saving changes
 * - saved: Successfully saved
 * - error: Save failed
 * 
 * Features:
 * - Visual status icons
 * - Relative time display ("Saved 2 minutes ago")
 * - Smooth transitions between states
 */
export function AutoSaveIndicator({ status, lastSaved, className }: AutoSaveIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState('');

  // Update relative time every minute
  useEffect(() => {
    if (!lastSaved) return;

    const updateRelativeTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffSeconds < 10) {
        setRelativeTime('just now');
      } else if (diffSeconds < 60) {
        setRelativeTime(`${diffSeconds} seconds ago`);
      } else if (diffMinutes < 60) {
        setRelativeTime(`${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`);
      } else {
        setRelativeTime(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-muted-foreground',
        };
      case 'saved':
        return {
          icon: <Check className="h-4 w-4" />,
          text: relativeTime ? `Saved ${relativeTime}` : 'Saved',
          color: 'text-green-600 dark:text-green-400',
        };
      case 'error':
        return {
          icon: <CloudOff className="h-4 w-4" />,
          text: 'Save failed',
          color: 'text-destructive',
        };
      case 'idle':
      default:
        return {
          icon: <Cloud className="h-4 w-4" />,
          text: relativeTime ? `Last saved ${relativeTime}` : 'Auto-save enabled',
          color: 'text-muted-foreground',
        };
    }
  };

  const { icon, text, color } = getStatusDisplay();

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm transition-colors',
        color,
        className
      )}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}
