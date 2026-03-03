import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, Pause, Heart, Users, Share2, Download, CheckCircle2 } from 'lucide-react';
import { usePlayerStore, Song } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

export default function PlaylistView() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const { setQueue, currentSong, isPlaying, togglePlayPause } = usePlayerStore();
  const { user, toggleLike } = useAuthStore();

  useEffect(() => {
    async function fetchData() {
      const plRes = await fetch(`/api/playlists/${id}`);
      if (!plRes.ok) return;
      const plData = await plRes.json();
      setPlaylist(plData);

      const songsRes = await fetch('/api/songs');
      const allSongs = await songsRes.json();
      const plSongs = plData.songIds.map((songId: string) => allSongs.find((s: any) => s.id === songId)).filter(Boolean);
      setSongs(plSongs);
    }
    fetchData();
  }, [id]);

  if (!playlist) return <div className="p-8 text-white">Loading...</div>;

  const totalDuration = songs.reduce((acc, song) => acc + song.durationMs, 0);
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isPlaylistPlaying = currentSong && songs.some(s => s.id === currentSong.id);

  const handlePlayPlaylist = () => {
    if (isPlaylistPlaying) {
      togglePlayPause();
    } else {
      setQueue(songs, 0);
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
      
      <div className="h-64 bg-gradient-to-b from-blue-800 to-[#121212] flex items-end p-8 gap-6">
        <div className="w-48 h-48 shadow-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white font-bold text-6xl">{playlist.name.charAt(0)}</span>
        </div>
        <div className="flex flex-col gap-2 text-white">
          <span className="text-sm font-bold uppercase">Playlist</span>
          <h1 className="text-5xl font-black tracking-tighter">{playlist.name}</h1>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="font-bold">{playlist.ownerId}</span>
            {playlist.collaborators?.length > 0 && (
              <span className="flex items-center gap-1 text-[#B3B3B3]"><Users className="w-4 h-4" /> {playlist.collaborators.length}</span>
            )}
            <span className="text-[#B3B3B3]">• {songs.length} songs,</span>
            <span className="text-[#B3B3B3]">{Math.floor(totalDuration / 60000)} min</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={handlePlayPlaylist}
            className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaylistPlaying && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 ml-1 fill-current" />
            )}
          </button>
          
          <button 
            onClick={() => setIsDownloaded(!isDownloaded)}
            className={`w-8 h-8 flex items-center justify-center rounded-full border ${isDownloaded ? 'border-[#1DB954] bg-[#1DB954] text-black' : 'border-[#B3B3B3] text-[#B3B3B3] hover:border-white hover:text-white'} transition-colors`}
            title={isDownloaded ? "Remove download" : "Download"}
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleShare}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-[16px_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)] gap-4 px-4 py-2 text-[#B3B3B3] text-sm border-b border-[#282828] mb-4">
          <div>#</div>
          <div>Title</div>
          <div>Artist</div>
          <div>Album</div>
          <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
        </div>

        <div className="flex flex-col">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isLiked = user?.likedSongs?.includes(song.id);
            return (
              <div 
                key={song.id}
                className={`grid grid-cols-[16px_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)] gap-4 px-4 py-2 rounded-md hover:bg-[#ffffff1a] group items-center text-sm ${isCurrent ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}
              >
                <div className="relative flex items-center justify-center w-4 h-4 cursor-pointer" onClick={() => setQueue(songs, index)}>
                  <span className={`group-hover:hidden ${isCurrent ? 'text-[#1DB954]' : ''}`}>{index + 1}</span>
                  <Play className={`w-4 h-4 absolute hidden group-hover:block ${isCurrent ? 'text-[#1DB954]' : 'text-white'} fill-current`} />
                </div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setQueue(songs, index)}>
                  <img src={song.albumCoverUrl} alt={song.title} className="w-10 h-10 rounded" />
                  <span className={`font-medium truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</span>
                </div>
                <div className="truncate group-hover:text-white transition-colors cursor-pointer">
                  <Link to={`/artist/${song.artist}`} onClick={e => e.stopPropagation()}>{song.artist}</Link>
                </div>
                <div className="truncate group-hover:text-white transition-colors cursor-pointer">
                  <Link to={`/album/${song.albumId}`} onClick={e => e.stopPropagation()}>{song.albumId}</Link>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <button onClick={() => toggleLike(song.id)} className="opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <Heart className={`w-4 h-4 ${isLiked ? 'text-[#1DB954] fill-current opacity-100' : 'text-[#B3B3B3] hover:text-white'}`} />
                  </button>
                  {formatDuration(song.durationMs)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
