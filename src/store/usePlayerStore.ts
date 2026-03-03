import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumId: string;
  albumCoverUrl: string;
  durationMs: number;
  audioUrl: string;
  popularity?: number;
}

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progressMs: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playbackSpeed: number;
  sleepTimer: number | null; // minutes
  crossfade: number; // seconds
  isQueuePanelOpen: boolean;
  
  setQueue: (queue: Song[], startIndex?: number) => void;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progressMs: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  setCrossfade: (seconds: number) => void;
  toggleQueuePanel: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  removeFromQueue: (index: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  const savedState = localStorage.getItem('playerState');
  const parsedState = savedState ? JSON.parse(savedState) : {};
  const initialState = {
    currentSong: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    volume: 1,
    progressMs: 0,
    isShuffle: false,
    repeatMode: 'off',
    playbackSpeed: 1,
    sleepTimer: null,
    crossfade: 0,
    isQueuePanelOpen: false,
    ...parsedState
  };

  // Ensure isPlaying is false on reload so it doesn't auto-play unexpectedly
  initialState.isPlaying = false;
  initialState.isQueuePanelOpen = false; // Always close queue panel on load
  initialState.playbackSpeed = initialState.playbackSpeed || 1; // Ensure playbackSpeed is valid

  return {
    ...initialState,

    setQueue: (queue, startIndex = 0) => {
      set({ queue, queueIndex: startIndex, currentSong: queue[startIndex] || null, isPlaying: true });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },
    
    playSong: (song) => {
      set({ currentSong: song, isPlaying: true });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },

    togglePlayPause: () => {
      set((state) => {
        const newState = { isPlaying: !state.isPlaying };
        localStorage.setItem('playerState', JSON.stringify({ ...get(), ...newState }));
        return newState;
      });
    },

    nextSong: () => {
      const { queue, queueIndex, isShuffle, repeatMode } = get();
      if (queue.length === 0) return;

      if (repeatMode === 'one') {
        set({ progressMs: 0, isPlaying: true });
        localStorage.setItem('playerState', JSON.stringify(get()));
        return;
      }

      let nextIndex = queueIndex + 1;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          set({ isPlaying: false, progressMs: 0 });
          localStorage.setItem('playerState', JSON.stringify(get()));
          return;
        }
      }

      set({ queueIndex: nextIndex, currentSong: queue[nextIndex], isPlaying: true, progressMs: 0 });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },

    prevSong: () => {
      const { queue, queueIndex, progressMs } = get();
      if (queue.length === 0) return;

      if (progressMs > 3000) {
        set({ progressMs: 0 });
        localStorage.setItem('playerState', JSON.stringify(get()));
        return;
      }

      let prevIndex = queueIndex - 1;
      if (prevIndex < 0) prevIndex = queue.length - 1;

      set({ queueIndex: prevIndex, currentSong: queue[prevIndex], isPlaying: true, progressMs: 0 });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },

    setVolume: (volume) => {
      set({ volume });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },
    setProgress: (progressMs) => {
      set({ progressMs });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },
    
    toggleShuffle: () => {
      set((state) => {
        const newState = { isShuffle: !state.isShuffle };
        localStorage.setItem('playerState', JSON.stringify({ ...get(), ...newState }));
        return newState;
      });
    },
    
    toggleRepeat: () => {
      set((state) => {
        const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
        const newState = { repeatMode: nextMode };
        localStorage.setItem('playerState', JSON.stringify({ ...get(), ...newState }));
        return newState;
      });
    },
    
    setIsPlaying: (isPlaying) => {
      set({ isPlaying });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },

    setPlaybackSpeed: (speed) => {
      set({ playbackSpeed: speed });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },

    setSleepTimer: (minutes) => {
      set({ sleepTimer: minutes });
      // Don't persist sleep timer
    },

    setCrossfade: (seconds) => {
      set({ crossfade: seconds });
      localStorage.setItem('playerState', JSON.stringify(get()));
    },

    toggleQueuePanel: () => {
      set((state) => ({ isQueuePanelOpen: !state.isQueuePanelOpen }));
    },

    reorderQueue: (startIndex, endIndex) => {
      set((state) => {
        const newQueue = Array.from(state.queue);
        const [removed] = newQueue.splice(startIndex, 1);
        newQueue.splice(endIndex, 0, removed);
        
        let newQueueIndex = state.queueIndex;
        if (startIndex === state.queueIndex) {
          newQueueIndex = endIndex;
        } else if (startIndex < state.queueIndex && endIndex >= state.queueIndex) {
          newQueueIndex--;
        } else if (startIndex > state.queueIndex && endIndex <= state.queueIndex) {
          newQueueIndex++;
        }

        const newState = { queue: newQueue, queueIndex: newQueueIndex };
        localStorage.setItem('playerState', JSON.stringify({ ...get(), ...newState }));
        return newState;
      });
    },

    removeFromQueue: (index) => {
      set((state) => {
        if (index === state.queueIndex) return state; // Can't remove currently playing song
        
        const newQueue = Array.from(state.queue);
        newQueue.splice(index, 1);
        
        let newQueueIndex = state.queueIndex;
        if (index < state.queueIndex) {
          newQueueIndex--;
        }

        const newState = { queue: newQueue, queueIndex: newQueueIndex };
        localStorage.setItem('playerState', JSON.stringify({ ...get(), ...newState }));
        return newState;
      });
    }
  };
});
