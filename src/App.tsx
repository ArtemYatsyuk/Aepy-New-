import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import QueuePanel from './components/QueuePanel';
import MobileNav from './components/MobileNav';
import Login from './pages/Login';
import { useAuthStore } from './store/useAuthStore';

const Home = lazy(() => import('./pages/Home'));
const PlaylistView = lazy(() => import('./pages/PlaylistView'));
const Search = lazy(() => import('./pages/Search'));
const ArtistView = lazy(() => import('./pages/ArtistView'));
const AlbumView = lazy(() => import('./pages/AlbumView'));
const Library = lazy(() => import('./pages/Library'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));

export default function App() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  if (!token) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#121212] to-black pb-40 md:pb-24">
          <Suspense fallback={<div className="p-8 text-white">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/playlist/:id" element={<PlaylistView />} />
              <Route path="/artist/:id" element={<ArtistView />} />
              <Route path="/album/:id" element={<AlbumView />} />
              <Route path="/library" element={<Library />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </Suspense>
        </main>
        <QueuePanel />
        <Player />
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

