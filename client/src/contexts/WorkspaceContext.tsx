import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Workspace type matching database schema.
 */
export interface Workspace {
  id: number;
  name: string;
  icon: string | null;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  refreshWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

/**
 * WorkspaceProvider manages the current workspace state.
 * For MVP, each user has a single default workspace.
 * Future: Support multiple workspaces per user.
 */
export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.workspaces.getOrCreateDefault.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (data) {
      setWorkspace(data as Workspace);
    }
  }, [data]);

  const refreshWorkspace = () => {
    refetch();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        isLoading,
        error: error as Error | null,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Hook to access workspace context.
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
