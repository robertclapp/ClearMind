import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users } from "lucide-react";

/**
 * CollaborationIndicators Component
 * 
 * Shows who is currently viewing or editing a page.
 * Provides real-time presence awareness for collaboration.
 * 
 * Features:
 * - Active user avatars
 * - Hover tooltips with user names
 * - Typing indicators
 * - Last active timestamps
 * 
 * Note: Full real-time collaboration requires WebSocket implementation.
 * This component provides the UI foundation for future WebSocket integration.
 */

interface ActiveUser {
  id: number;
  name: string;
  isTyping?: boolean;
  lastActive: Date;
}

interface CollaborationIndicatorsProps {
  pageId: number;
  activeUsers?: ActiveUser[];
  className?: string;
}

export function CollaborationIndicators({
  pageId,
  activeUsers = [],
  className,
}: CollaborationIndicatorsProps) {
  // TODO: Replace with real-time WebSocket data
  // For now, this is a UI-only component showing the structure
  
  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Users className="h-4 w-4 text-muted-foreground" />
      
      <div className="flex items-center -space-x-2">
        {activeUsers.slice(0, 5).map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isTyping && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background animate-pulse" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {user.name}
                {user.isTyping && " is typing..."}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {activeUsers.length > 5 && (
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                <AvatarFallback className="text-xs">
                  +{activeUsers.length - 5}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {activeUsers.slice(5).map(u => u.name).join(", ")}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

/**
 * SyncStatusIndicator Component
 * 
 * Shows the current sync status for offline-first architecture.
 * Indicates when changes are being synced to the server.
 */

interface SyncStatusIndicatorProps {
  status: "synced" | "syncing" | "offline" | "error";
  className?: string;
}

export function SyncStatusIndicator({ status, className }: SyncStatusIndicatorProps) {
  const statusConfig = {
    synced: {
      color: "bg-green-500",
      text: "All changes saved",
      icon: "✓",
    },
    syncing: {
      color: "bg-yellow-500 animate-pulse",
      text: "Syncing changes...",
      icon: "⟳",
    },
    offline: {
      color: "bg-gray-500",
      text: "Offline - changes saved locally",
      icon: "⚠",
    },
    error: {
      color: "bg-red-500",
      text: "Sync error - retrying...",
      icon: "!",
    },
  };

  const config = statusConfig[status];

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`gap-2 ${className}`}>
          <div className={`h-2 w-2 rounded-full ${config.color}`} />
          <span className="text-xs">{config.icon}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{config.text}</p>
      </TooltipContent>
    </Tooltip>
  );
}
