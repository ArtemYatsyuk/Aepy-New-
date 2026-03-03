import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Home() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const { setQueue, currentSong, isPlaying, togglePlayPause } = usePlayerStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetch('/api/playlists').then(res => res.json()).then(setPlaylists);
    fetch('/api/albums').then(res => res.json()).then(setAlbums);
    fetch('/api/songs').then(res => res.json()).then(setSongs);
  }, []);

  const handlePlayAlbum = async (albumId: string) => {
    const albumSongs = songs.filter((s: any) => s.albumId === albumId);
    if (albumSongs.length > 0) {
      setQueue(albumSongs, 0);
    }
  };

  const handlePlayPlaylist = async (playlist: any) => {
    const plSongs = playlist.songIds.map((id: string) => songs.find(s => s.id === id)).filter(Boolean);
    if (plSongs.length > 0) {
      setQueue(plSongs, 0);
    }
  };

  const recentlyPlayedSongs = user?.recentlyPlayed?.map((rp: any) => songs.find(s => s.id === rp.songId)).filter(Boolean) || [];

  return (
    <div className="p-8 pt-16">
      <h2 className="text-2xl font-bold text-white mb-6">Good evening</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {playlists.slice(0, 6).map(pl => {
          const isThisPlaying = currentSong && pl.songIds.includes(currentSong.id);
          return (
            <div
              key={pl.id}
              className="bg-[#ffffff1a] hover:bg-[#ffffff33] transition-colors rounded flex items-center group overflow-hidden cursor-pointer"
              onClick={() => isThisPlaying ? togglePlayPause() : handlePlayPlaylist(pl)}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{pl.name.charAt(0)}</span>
              </div>
              <div className="px-4 font-bold flex-1 truncate">
                <Link to={`/playlist/${pl.id}`} className={`hover:underline ${isThisPlaying ? 'text-[#1DB954]' : 'text-white'}`} onClick={e => e.stopPropagation()}>
                  {pl.name}
                </Link>
              </div>
              {isThisPlaying && isPlaying ? (
                <div className="mr-4 flex gap-1 items-end h-4">
                  <div className="w-1 bg-[#1DB954] h-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 bg-[#1DB954] h-2/3 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 bg-[#1DB954] h-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <button className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black opacity-0 group-hover:opacity-100 mr-4 shadow-xl transition-all hover:scale-105">
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {recentlyPlayedSongs.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-white mb-6 hover:underline cursor-pointer">Recently Played</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
            {recentlyPlayedSongs.slice(0, 5).map((song: any) => {
              const isThisPlaying = currentSong?.id === song.id;
              return (
                <div key={`recent-${song.id}`} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer relative" onClick={() => isThisPlaying ? togglePlayPause() : setQueue([song], 0)}>
                  <div className="relative mb-4">
                    <img src={song.albumCoverUrl} alt={song.title} className="w-full aspect-square object-cover rounded shadow-lg" />
                    {isThisPlaying && isPlaying ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                        <div className="flex gap-1 items-end h-6">
                          <div className="w-1.5 bg-[#1DB954] h-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 bg-[#1DB954] h-2/3 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 bg-[#1DB954] h-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-105 translate-y-2 group-hover:translate-y-0"
                      >
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      </button>
                    )}
                  </div>
                  <h3 className={`font-bold mb-1 truncate ${isThisPlaying ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</h3>
                  <p className="text-sm text-[#B3B3B3] truncate">{song.artist}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 className="text-2xl font-bold text-white mb-6 hover:underline cursor-pointer">Popular Albums</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {albums.map(album => {
          const albumSongs = songs.filter(s => s.albumId === album.id);
          const isThisPlaying = currentSong && albumSongs.some(s => s.id === currentSong.id);
          return (
            <div key={album.id} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer relative" onClick={() => isThisPlaying ? togglePlayPause() : handlePlayAlbum(album.id)}>
              <div className="relative mb-4">
                <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover rounded shadow-lg" />
                {isThisPlaying && isPlaying ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                    <div className="flex gap-1 items-end h-6">
                      <div className="w-1.5 bg-[#1DB954] h-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 bg-[#1DB954] h-2/3 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 bg-[#1DB954] h-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-105 translate-y-2 group-hover:translate-y-0"
                  >
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  </button>
                )}
              </div>
              <h3 className={`font-bold mb-1 truncate ${isThisPlaying ? 'text-[#1DB954]' : 'text-white'}`}>{album.title}</h3>
              <p className="text-sm text-[#B3B3B3] truncate">{album.year}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
