import { Home as HomeIcon, Search, Library, PlusSquare, Bell, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function Sidebar() {
  const location = useLocation();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => setPlaylists(data));
  }, []);

  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Library, label: 'Your Library', path: '/library' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ icon: Settings, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="w-64 bg-black h-full flex-col pt-6 px-2 hidden md:flex">
      <div className="px-4 mb-6">
        <h1 className="text-white font-bold text-2xl tracking-tighter">Spotify</h1>
      </div>
      
      <nav className="flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-2 py-2 rounded transition-colors ${
                isActive ? 'text-white' : 'text-[#B3B3B3] hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 px-4">
        <button className="flex items-center gap-4 text-[#B3B3B3] hover:text-white transition-colors">
          <PlusSquare className="w-6 h-6" />
          <span className="font-bold text-sm">Create Playlist</span>
        </button>
      </div>

      <div className="mt-4 border-t border-[#282828] mx-4 pt-4 flex-1 overflow-y-auto">
        {playlists.map(pl => (
          <Link
            key={pl.id}
            to={`/playlist/${pl.id}`}
            className="block py-2 text-sm text-[#B3B3B3] hover:text-white truncate"
          >
            {pl.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
