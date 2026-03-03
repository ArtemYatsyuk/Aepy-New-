import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore, Song } from '../store/usePlayerStore';

export default function Library() {
  const { user } = useAuthStore();
  const { setQueue, currentSong, isPlaying, togglePlayPause } = usePlayerStore();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [followedArtists, setFollowedArtists] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const songsRes = await fetch('/api/songs');
      const allSongs = await songsRes.json();
      const userLikedSongs = user.likedSongs?.map(id => allSongs.find((s: any) => s.id === id)).filter(Boolean) || [];
      setLikedSongs(userLikedSongs);

      // In a real app, you'd fetch the actual artist details
      const userFollowedArtists = user.followedArtists?.map(id => ({
        id,
        name: `Artist ${id}`, // Fallback name
        imageUrl: `https://picsum.photos/seed/${id}/200/200`
      })) || [];
      setFollowedArtists(userFollowedArtists);
    }
    fetchData();
  }, [user]);

  const handlePlayLikedSongs = () => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs, 0);
    }
  };

  const isLikedSongsPlaying = currentSong && likedSongs.some(s => s.id === currentSong.id);

  return (
    <div className="p-8 pt-16">
      <h1 className="text-3xl font-bold text-white mb-6">Your Library</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
        <div 
          className="bg-gradient-to-br from-indigo-600 to-blue-400 p-6 rounded-md hover:scale-[1.02] transition-transform group cursor-pointer relative flex flex-col justify-end min-h-[200px]"
          onClick={() => isLikedSongsPlaying ? togglePlayPause() : handlePlayLikedSongs()}
        >
          <div className="mb-4">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          <h3 className="font-bold text-white text-2xl mb-1">Liked Songs</h3>
          <p className="text-sm text-white/80">{likedSongs.length} liked songs</p>
          
          <button 
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-105 translate-y-2 group-hover:translate-y-0"
            onClick={(e) => { e.stopPropagation(); isLikedSongsPlaying ? togglePlayPause() : handlePlayLikedSongs(); }}
          >
            {isLikedSongsPlaying && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
          </button>
        </div>

        {followedArtists.map(artist => (
          <Link key={artist.id} to={`/artist/${artist.id}`} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer relative flex flex-col items-center text-center">
            <div className="relative mb-4 w-full aspect-square">
              <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover rounded-full shadow-lg" />
            </div>
            <h3 className="font-bold text-white mb-1 truncate w-full">{artist.name}</h3>
            <p className="text-sm text-[#B3B3B3] truncate w-full">Artist</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
