import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

export const apiRouter = Router();

const JWT_SECRET = "super-secret-key-for-mock-spotify";
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || "placeholder-client-id";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user: any) => {
      if (err) return res.sendStatus(403);
      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Auth
apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (user) {
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

apiRouter.post("/auth/register", (req, res) => {
  const { email, password } = req.body;
  const existing = db.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User exists" });
  }
  const newUser = {
    id: `user${db.users.length + 1}`,
    email,
    passwordHash: "placeholder",
    subscription: "free",
    playlists: [],
    likedSongs: [],
    recentlyPlayed: [],
    followedArtists: [],
    notifications: [],
    role: "user"
  };
  db.users.push(newUser);
  const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, user: newUser });
});

apiRouter.post("/auth/google", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const email = payload.email;
    let user = db.users.find(u => u.email === email);

    if (!user) {
      // Create new user
      user = {
        id: `user${db.users.length + 1}`,
        email,
        passwordHash: "google-oauth",
        subscription: "free",
        playlists: [],
        likedSongs: [],
        recentlyPlayed: [],
        followedArtists: [],
        notifications: [],
        role: "user"
      };
      db.users.push(user);
    }

    const jwtToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

apiRouter.get("/users/me", authenticate, (req, res) => {
  const userId = (req as any).user.userId;
  const user = db.users.find(u => u.id === userId);
  if (user) res.json(user);
  else res.status(404).json({ error: "User not found" });
});

// User Actions
apiRouter.post("/users/like", authenticate, (req, res) => {
  const userId = (req as any).user.userId;
  const { songId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    if (user.likedSongs.includes(songId)) {
      user.likedSongs = user.likedSongs.filter(id => id !== songId);
    } else {
      user.likedSongs.push(songId);
    }
    res.json({ likedSongs: user.likedSongs });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

apiRouter.post("/users/recently-played", authenticate, (req, res) => {
  const userId = (req as any).user.userId;
  const { songId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.recentlyPlayed = [{ songId, timestamp: Date.now() }, ...user.recentlyPlayed.filter(r => r.songId !== songId)].slice(0, 50);
    db.streams.push({ songId, userId, timestamp: Date.now() } as any);
    res.json({ recentlyPlayed: user.recentlyPlayed });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

apiRouter.post("/users/follow", authenticate, (req, res) => {
  const userId = (req as any).user.userId;
  const { artistId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    if (user.followedArtists.includes(artistId)) {
      user.followedArtists = user.followedArtists.filter(id => id !== artistId);
    } else {
      user.followedArtists.push(artistId);
    }
    res.json({ followedArtists: user.followedArtists });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Songs
apiRouter.get("/songs", (req, res) => {
  res.json(db.songs);
});

// Albums
apiRouter.get("/albums", (req, res) => {
  res.json(db.albums);
});

apiRouter.get("/albums/:id", (req, res) => {
  const album = db.albums.find(a => a.id === req.params.id);
  if (album) res.json(album);
  else res.status(404).json({ error: "Album not found" });
});

// Artists
apiRouter.get("/artists", (req, res) => {
  res.json(db.artists);
});

apiRouter.get("/artists/:id", (req, res) => {
  const artist = db.artists.find(a => a.id === req.params.id);
  if (artist) res.json(artist);
  else res.status(404).json({ error: "Artist not found" });
});

// Playlists
apiRouter.get("/playlists", (req, res) => {
  res.json(db.playlists);
});

apiRouter.get("/playlists/:id", (req, res) => {
  const playlist = db.playlists.find(p => p.id === req.params.id);
  if (playlist) {
    res.json(playlist);
  } else {
    res.status(404).json({ error: "Playlist not found" });
  }
});

// Search
apiRouter.get("/search", (req, res) => {
  const q = (req.query.q as string || "").toLowerCase();
  const genre = (req.query.genre as string || "").toLowerCase();
  const year = req.query.year as string;
  const sort = req.query.sort as string;

  if (!q && !genre && !year) return res.json({ songs: [], albums: [], artists: [] });

  let songs = db.songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  let albums = db.albums.filter(a => a.title.toLowerCase().includes(q));
  let artists = db.artists.filter(a => a.name.toLowerCase().includes(q));

  if (genre) {
    albums = albums.filter(a => a.genre?.toLowerCase() === genre);
    songs = songs.filter(s => {
      const album = db.albums.find(a => a.id === s.albumId);
      return album?.genre?.toLowerCase() === genre;
    });
  }

  if (year) {
    albums = albums.filter(a => a.year.toString() === year);
    songs = songs.filter(s => {
      const album = db.albums.find(a => a.id === s.albumId);
      return album?.year.toString() === year;
    });
  }

  if (sort === 'popularity') {
    songs.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else if (sort === 'alphabetical') {
    songs.sort((a, b) => a.title.localeCompare(b.title));
  }

  res.json({ songs, albums, artists });
});

// Admin
apiRouter.get("/admin/stats", authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

  const totalStreams = db.streams.length;
  const activeUsers = db.users.length;
  
  const songCounts: Record<string, number> = {};
  db.streams.forEach(s => {
    songCounts[(s as any).songId] = (songCounts[(s as any).songId] || 0) + 1;
  });
  
  const mostPlayed = Object.entries(songCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([songId, count]) => ({
      song: db.songs.find(s => s.id === songId),
      count
    }));

  res.json({ totalStreams, activeUsers, mostPlayed });
});

