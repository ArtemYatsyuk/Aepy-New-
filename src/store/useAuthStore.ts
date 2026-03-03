import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  toggleLike: (songId: string) => Promise<void>;
  toggleFollow: (artistId: string) => Promise<void>;
  recordPlay: (songId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  fetchUser: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      }
    } catch (e) {
      console.error(e);
    }
  },
  toggleLike: async (songId: string) => {
    const { token, user } = get();
    if (!token || !user) return;
    
    // Optimistic update
    const isLiked = user.likedSongs?.includes(songId);
    const newLikedSongs = isLiked 
      ? user.likedSongs.filter((id: string) => id !== songId)
      : [...(user.likedSongs || []), songId];
      
    set({ user: { ...user, likedSongs: newLikedSongs } });

    try {
      const res = await fetch('/api/users/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ songId })
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: { ...user, likedSongs: data.likedSongs } });
        localStorage.setItem('user', JSON.stringify({ ...user, likedSongs: data.likedSongs }));
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      set({ user });
    }
  },
  toggleFollow: async (artistId: string) => {
    const { token, user } = get();
    if (!token || !user) return;
    
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ artistId })
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: { ...user, followedArtists: data.followedArtists } });
        localStorage.setItem('user', JSON.stringify({ ...user, followedArtists: data.followedArtists }));
      }
    } catch (e) {
      console.error(e);
    }
  },
  recordPlay: async (songId: string) => {
    const { token, user } = get();
    if (!token || !user) return;
    
    try {
      const res = await fetch('/api/users/recently-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ songId })
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: { ...user, recentlyPlayed: data.recentlyPlayed } });
        localStorage.setItem('user', JSON.stringify({ ...user, recentlyPlayed: data.recentlyPlayed }));
      }
    } catch (e) {
      console.error(e);
    }
  }
}));
