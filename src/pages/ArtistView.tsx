import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Share2, CheckCircle2 } from 'lucide-react';
import { usePlayerStore, Song } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

export default function ArtistView() {
  const { id } = useParams();
  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [showShareToast, setShowShareToast] = useState(false);
  const { setQueue, currentSong, isPlaying, togglePlayPause } = usePlayerStore();
  const { user, toggleFollow } = useAuthStore();

  useEffect(() => {
    fetch(`/api/artists/${id}`).then(res => res.json()).then(setArtist);
    fetch('/api/songs').then(res => res.json()).then(allSongs => {
      const artistSongs = allSongs.filter((s: any) => s.artist === artist?.name || s.albumId.includes(id));
      setTopTracks(artistSongs.slice(0, 5));
    });
    fetch('/api/albums').then(res => res.json()).then(allAlbums => {
      setAlbums(allAlbums.filter((a: any) => a.artistId === id));
    });
  }, [id, artist?.name]);

  if (!artist) return <div className="p-8 text-white">Loading...</div>;

  const isFollowing = user?.followedArtists?.includes(artist.id);
  const isArtistPlaying = currentSong && topTracks.some(s => s.id === currentSong.id);

  const handlePlayArtist = () => {
    if (isArtistPlaying) {
      togglePlayPause();
    } else if (topTracks.length > 0) {
      setQueue(topTracks, 0);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="pb-8 relative">
      {showShareToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-[#282828] text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1DB954]" />
          Link copied to clipboard
        </div>
      )}

      <div 
        className="h-80 bg-cover bg-center flex items-end p-8 relative"
        style={{ backgroundImage: `url(${artist.bannerUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent"></div>
        <div className="relative z-10 flex flex-col gap-2 text-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Verified Artist</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter">{artist.name}</h1>
          <div className="text-sm mt-2 font-medium">
            {artist.monthlyListeners.toLocaleString()} monthly listeners
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={handlePlayArtist}
            className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isArtistPlaying && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 ml-1 fill-current" />
            )}
          </button>
          <button 
            onClick={() => toggleFollow(artist.id)}
            className={`px-4 py-1 rounded-full border text-sm font-bold uppercase tracking-widest transition-colors ${isFollowing ? 'border-white text-white' : 'border-[#B3B3B3] text-[#B3B3B3] hover:border-white hover:text-white'}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          
          <button 
            onClick={handleShare}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>
        <div className="flex flex-col mb-10">
          {topTracks.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div 
                key={song.id}
                onClick={() => setQueue(topTracks, index)}
                className={`grid grid-cols-[16px_minmax(120px,1fr)_minmax(120px,1fr)] gap-4 px-4 py-2 rounded-md hover:bg-[#ffffff1a] cursor-pointer group items-center text-sm ${isCurrent ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}
              >
                <div className="relative flex items-center justify-center w-4 h-4">
                  <span className={`group-hover:hidden ${isCurrent ? 'text-[#1DB954]' : ''}`}>{index + 1}</span>
                  <Play className={`w-4 h-4 absolute hidden group-hover:block ${isCurrent ? 'text-[#1DB954]' : 'text-white'} fill-current`} />
                </div>
                <div className="flex items-center gap-3">
                  <img src={song.albumCoverUrl} alt={song.title} className="w-10 h-10 rounded" />
                  <span className={`font-medium truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</span>
                </div>
                <div className="flex justify-end">{Math.floor(song.durationMs / 60000)}:{(Math.floor(song.durationMs / 1000) % 60).toString().padStart(2, '0')}</div>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Discography</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {albums.map(album => (
            <Link key={album.id} to={`/album/${album.id}`} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer relative block">
              <div className="relative mb-4">
                <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover rounded shadow-lg" />
                <button 
                  onClick={(e) => { e.preventDefault(); /* Play album logic */ }}
                  className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-105 translate-y-2 group-hover:translate-y-0"
                >
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </button>
              </div>
              <h3 className="font-bold text-white mb-1 truncate">{album.title}</h3>
              <p className="text-sm text-[#B3B3B3] truncate">{album.year} • Album</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
