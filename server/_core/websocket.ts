import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

/**
 * WebSocket Server for Real-Time Collaboration
 * 
 * Provides real-time features:
 * - Presence tracking (who's viewing what page)
 * - Typing indicators
 * - Live cursor positions
 * - Content synchronization
 * - Notifications
 */

interface UserPresence {
  userId: number;
  userName: string;
  pageId?: number;
  isTyping?: boolean;
  cursorPosition?: { x: number; y: number };
  lastActive: Date;
}

// Store active users and their presence
const activeUsers = new Map<string, UserPresence>();
const pageViewers = new Map<number, Set<string>>();

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Configure based on your deployment
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Handle user authentication
    socket.on("authenticate", (data: { userId: number; userName: string }) => {
      activeUsers.set(socket.id, {
        userId: data.userId,
        userName: data.userName,
        lastActive: new Date(),
      });

      console.log(`[WebSocket] User authenticated: ${data.userName} (${socket.id})`);
      
      // Broadcast user joined
      socket.broadcast.emit("user:joined", {
        userId: data.userId,
        userName: data.userName,
      });
    });

    // Handle page viewing
    socket.on("page:view", (data: { pageId: number }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      // Remove from previous page
      if (user.pageId) {
        const viewers = pageViewers.get(user.pageId);
        if (viewers) {
          viewers.delete(socket.id);
          if (viewers.size === 0) {
            pageViewers.delete(user.pageId);
          }
        }
      }

      // Add to new page
      user.pageId = data.pageId;
      user.lastActive = new Date();

      if (!pageViewers.has(data.pageId)) {
        pageViewers.set(data.pageId, new Set());
      }
      pageViewers.get(data.pageId)!.add(socket.id);

      // Join page room
      socket.join(`page:${data.pageId}`);

      // Notify others in the page
      const viewers = Array.from(pageViewers.get(data.pageId) || [])
        .map((id) => activeUsers.get(id))
        .filter(Boolean);

      io.to(`page:${data.pageId}`).emit("page:viewers", {
        pageId: data.pageId,
        viewers: viewers.map((v) => ({
          userId: v!.userId,
          userName: v!.userName,
          isTyping: v!.isTyping,
        })),
      });
    });

    // Handle typing indicators
    socket.on("typing:start", (data: { pageId: number }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      user.isTyping = true;
      user.lastActive = new Date();

      socket.to(`page:${data.pageId}`).emit("user:typing", {
        userId: user.userId,
        userName: user.userName,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (data: { pageId: number }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      user.isTyping = false;
      user.lastActive = new Date();

      socket.to(`page:${data.pageId}`).emit("user:typing", {
        userId: user.userId,
        userName: user.userName,
        isTyping: false,
      });
    });

    // Handle cursor position updates
    socket.on("cursor:move", (data: { pageId: number; x: number; y: number }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      user.cursorPosition = { x: data.x, y: data.y };
      user.lastActive = new Date();

      socket.to(`page:${data.pageId}`).emit("cursor:update", {
        userId: user.userId,
        userName: user.userName,
        position: { x: data.x, y: data.y },
      });
    });

    // Handle content updates
    socket.on("content:update", (data: { pageId: number; content: any }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      user.lastActive = new Date();

      // Broadcast to others in the page
      socket.to(`page:${data.pageId}`).emit("content:changed", {
        userId: user.userId,
        userName: user.userName,
        content: data.content,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      
      if (user) {
        console.log(`[WebSocket] User disconnected: ${user.userName} (${socket.id})`);

        // Remove from page viewers
        if (user.pageId) {
          const viewers = pageViewers.get(user.pageId);
          if (viewers) {
            viewers.delete(socket.id);
            
            // Notify others
            socket.to(`page:${user.pageId}`).emit("user:left", {
              userId: user.userId,
              userName: user.userName,
            });

            if (viewers.size === 0) {
              pageViewers.delete(user.pageId);
            }
          }
        }

        activeUsers.delete(socket.id);

        // Broadcast user left
        socket.broadcast.emit("user:left", {
          userId: user.userId,
          userName: user.userName,
        });
      }
    });
  });

  // Cleanup inactive users periodically
  setInterval(() => {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    activeUsers.forEach((user, socketId) => {
      if (now.getTime() - user.lastActive.getTime() > timeout) {
        console.log(`[WebSocket] Cleaning up inactive user: ${user.userName}`);
        activeUsers.delete(socketId);
        
        if (user.pageId) {
          const viewers = pageViewers.get(user.pageId);
          if (viewers) {
            viewers.delete(socketId);
            if (viewers.size === 0) {
              pageViewers.delete(user.pageId);
            }
          }
        }
      }
    });
  }, 60 * 1000); // Check every minute

  console.log("[WebSocket] Server initialized");
  return io;
}
