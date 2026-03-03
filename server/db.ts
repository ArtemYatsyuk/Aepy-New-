export const db = {
  users: [
    {
      id: "user1",
      email: "test@example.com",
      passwordHash: "placeholder",
      subscription: "premium",
      playlists: ["pl1", "pl2"],
      likedSongs: ["song1", "song3"],
      recentlyPlayed: [],
      followedArtists: ["art1"],
      notifications: [],
      role: "user"
    },
    {
      id: "admin1",
      email: "admin@example.com",
      passwordHash: "placeholder",
      subscription: "premium",
      playlists: [],
      likedSongs: [],
      recentlyPlayed: [],
      followedArtists: [],
      notifications: [],
      role: "admin"
    }
  ],
  artists: [
    { id: "art1", name: "The Midnight", imageUrl: "https://picsum.photos/seed/midnight/300/300", bannerUrl: "https://picsum.photos/seed/midnightbanner/1200/400", monthlyListeners: 1200500 },
    { id: "art2", name: "FM-84", imageUrl: "https://picsum.photos/seed/fm84/300/300", bannerUrl: "https://picsum.photos/seed/fm84banner/1200/400", monthlyListeners: 850000 },
    { id: "art3", name: "Timecop1983", imageUrl: "https://picsum.photos/seed/timecop/300/300", bannerUrl: "https://picsum.photos/seed/timecopbanner/1200/400", monthlyListeners: 950000 }
  ],
  albums: [
    { id: "alb1", title: "Endless Summer", artistId: "art1", coverUrl: "https://picsum.photos/seed/endless/300/300", year: 2016, genre: "Synthwave" },
    { id: "alb2", title: "Atlas", artistId: "art2", coverUrl: "https://picsum.photos/seed/atlas/300/300", year: 2016, genre: "Synthwave" },
    { id: "alb3", title: "Night Drive", artistId: "art3", coverUrl: "https://picsum.photos/seed/nightdrive/300/300", year: 2018, genre: "Retrowave" }
  ],
  songs: [
    {
      id: "song1",
      title: "Sunset",
      artist: "The Midnight",
      albumId: "alb1",
      albumCoverUrl: "https://picsum.photos/seed/endless/300/300",
      durationMs: 326000,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      popularity: 95
    },
    {
      id: "song2",
      title: "Vampires",
      artist: "The Midnight",
      albumId: "alb1",
      albumCoverUrl: "https://picsum.photos/seed/endless/300/300",
      durationMs: 317000,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      popularity: 88
    },
    {
      id: "song3",
      title: "Running In The Night",
      artist: "FM-84",
      albumId: "alb2",
      albumCoverUrl: "https://picsum.photos/seed/atlas/300/300",
      durationMs: 270000,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      popularity: 92
    },
    {
      id: "song4",
      title: "On The Run",
      artist: "Timecop1983",
      albumId: "alb3",
      albumCoverUrl: "https://picsum.photos/seed/nightdrive/300/300",
      durationMs: 315000,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      popularity: 85
    },
    {
      id: "song5",
      title: "Neon Nights",
      artist: "Timecop1983",
      albumId: "alb3",
      albumCoverUrl: "https://picsum.photos/seed/nightdrive/300/300",
      durationMs: 290000,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      popularity: 80
    }
  ],
  playlists: [
    {
      id: "pl1",
      name: "Synthwave Essentials",
      ownerId: "user1",
      songIds: ["song1", "song2", "song3", "song4", "song5"],
      visibility: "public",
      createdAt: Date.now(),
      collaborators: []
    },
    {
      id: "pl2",
      name: "Late Night Drive",
      ownerId: "user1",
      songIds: ["song3", "song4", "song1"],
      visibility: "public",
      createdAt: Date.now() - 86400000,
      collaborators: []
    }
  ],
  streams: [] // { songId, userId, timestamp }
};
