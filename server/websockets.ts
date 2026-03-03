import { Server, Socket } from "socket.io";

interface PlaybackState {
  userId: string;
  deviceId: string;
  currentSongId: string | null;
  positionMs: number;
  isPlaying: boolean;
  volume: number;
  queue: string[];
}

const userPlaybackStates = new Map<string, PlaybackState>();

export function setupWebSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      const state = userPlaybackStates.get(userId);
      if (state) {
        socket.emit("playback_state_sync", state);
      }
    });

    socket.on("update_playback", (data: { userId: string, state: PlaybackState }) => {
      userPlaybackStates.set(data.userId, data.state);
      // Broadcast to all other devices of this user
      socket.to(data.userId).emit("playback_state_sync", data.state);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
