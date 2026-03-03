import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Repeat1, Heart, ListMusic, Timer, Gauge } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { io, Socket } from 'socket.io-client';

export default function Player() {
  const {
    currentSong,
    isPlaying,
    volume,
    progressMs,
    isShuffle,
    repeatMode,
    playbackSpeed,
    sleepTimer,
    togglePlayPause,
    nextSong,
    prevSong,
    setVolume,
    setProgress,
    toggleShuffle,
    toggleRepeat,
    setIsPlaying,
    setPlaybackSpeed,
    setSleepTimer,
    toggleQueuePanel,
    isQueuePanelOpen,
    queue
  } = usePlayerStore();

  const { user, toggleLike, recordPlay } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [deviceId] = useState(() => Math.random().toString(36).substring(7));
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const playRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    
    if (user) {
      newSocket.emit('join', user.id);
    }

    newSocket.on('playback_state_sync', (state) => {
      if (state.deviceId !== deviceId) {
        if (state.isPlaying !== isPlaying) {
          setIsPlaying(state.isPlaying);
        }
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, deviceId]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('update_playback', {
        userId: user.id,
        state: {
          deviceId,
          currentSongId: currentSong?.id || null,
          positionMs: progressMs,
          isPlaying,
          volume,
          queue: queue.map(s => s.id)
        }
      });
    }
  }, [currentSong, isPlaying, progressMs, volume, socket, user, deviceId, queue]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackSpeed || 1;
    }
  }, [volume, playbackSpeed]);

  // Sync initial progress when song changes or component mounts
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (Math.abs(audioRef.current.currentTime * 1000 - progressMs) > 1000) {
        audioRef.current.currentTime = progressMs / 1000;
      }
      playRecordedRef.current = null; // Reset play record tracker for new song
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Sleep Timer Logic
  useEffect(() => {
    if (sleepTimer !== null && isPlaying) {
      const timerId = setTimeout(() => {
        setIsPlaying(false);
        setSleepTimer(null);
      }, sleepTimer * 60 * 1000);
      return () => clearTimeout(timerId);
    }
  }, [sleepTimer, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTimeMs = audioRef.current.currentTime * 1000;
      setProgress(currentTimeMs);

      // Record play if played for more than 10 seconds
      if (currentTimeMs > 10000 && currentSong && playRecordedRef.current !== currentSong.id) {
        recordPlay(currentSong.id);
        playRecordedRef.current = currentSong.id;
      }
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextSong();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time * 1000);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLiked = currentSong && user?.likedSongs?.includes(currentSong.id);

  if (!currentSong) {
    return (
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-16 md:h-24 bg-[#181818] border-t border-[#282828] flex items-center justify-between px-4 z-50">
        <div className="hidden md:block w-1/3"></div>
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
          <div className="flex items-center gap-6">
            <Shuffle className="hidden md:block w-5 h-5 text-[#B3B3B3]" />
            <SkipBack className="hidden md:block w-5 h-5 text-[#B3B3B3]" />
            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
              <Play className="w-4 h-4 ml-1" />
            </button>
            <SkipForward className="hidden md:block w-5 h-5 text-[#B3B3B3]" />
            <Repeat className="hidden md:block w-5 h-5 text-[#B3B3B3]" />
          </div>
          <div className="hidden md:flex w-full max-w-md mt-2 items-center gap-2 text-xs text-[#B3B3B3]">
            <span>0:00</span>
            <div className="flex-1 h-1 bg-[#4d4d4d] rounded-full"></div>
            <span>0:00</span>
          </div>
        </div>
        <div className="hidden md:flex w-1/3 justify-end items-center gap-2 text-[#B3B3B3]">
          <Volume2 className="w-5 h-5" />
          <div className="w-24 h-1 bg-[#4d4d4d] rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-16 md:h-24 bg-[#181818] border-t border-[#282828] flex items-center justify-between px-2 md:px-4 z-50">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      <div className="w-1/2 md:w-1/3 flex items-center gap-2 md:gap-4">
        <img src={currentSong.albumCoverUrl} alt={currentSong.title} className="w-10 h-10 md:w-14 md:h-14 rounded" />
        <div className="truncate">
          <div className="text-white text-sm hover:underline cursor-pointer truncate">{currentSong.title}</div>
          <div className="text-[#B3B3B3] text-xs hover:underline cursor-pointer truncate">{currentSong.artist}</div>
        </div>
        <button onClick={() => toggleLike(currentSong.id)} className="ml-2 md:ml-4 flex-shrink-0">
          <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'text-[#1DB954] fill-current' : 'text-[#B3B3B3] hover:text-white'}`} />
        </button>
      </div>

      <div className="w-1/2 md:w-1/3 flex flex-col items-end md:items-center justify-center pr-2 md:pr-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={toggleShuffle} className={`hidden md:block ${isShuffle ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}>
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={prevSong} className="hidden md:block text-[#B3B3B3] hover:text-white">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-1 fill-current" />}
          </button>
          <button onClick={nextSong} className="text-[#B3B3B3] hover:text-white">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button onClick={toggleRepeat} className={`hidden md:block ${repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}>
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="hidden md:flex w-full max-w-md mt-2 items-center gap-2 text-xs text-[#B3B3B3]">
          <span className="w-8 text-right">{formatTime(progressMs)}</span>
          <input
            type="range"
            min={0}
            max={currentSong.durationMs / 1000}
            value={progressMs / 1000}
            onChange={handleSeek}
            className="flex-1 h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="w-8">{formatTime(currentSong.durationMs)}</span>
        </div>
      </div>

      <div className="hidden md:flex w-1/3 justify-end items-center gap-4 text-[#B3B3B3]">
        <div className="relative">
          <button onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowTimerMenu(false); }} className={`hover:text-white ${playbackSpeed !== 1 ? 'text-[#1DB954]' : ''}`}>
            <Gauge className="w-5 h-5" />
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#282828] rounded shadow-lg py-2 w-32 z-50">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                <button 
                  key={speed} 
                  onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#3E3E3E] ${playbackSpeed === speed ? 'text-[#1DB954]' : 'text-white'}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowTimerMenu(!showTimerMenu); setShowSpeedMenu(false); }} className={`hover:text-white ${sleepTimer !== null ? 'text-[#1DB954]' : ''}`}>
            <Timer className="w-5 h-5" />
          </button>
          {showTimerMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#282828] rounded shadow-lg py-2 w-32 z-50">
              <button onClick={() => { setSleepTimer(null); setShowTimerMenu(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#3E3E3E] ${sleepTimer === null ? 'text-[#1DB954]' : 'text-white'}`}>Off</button>
              {[5, 15, 30, 60].map(mins => (
                <button 
                  key={mins} 
                  onClick={() => { setSleepTimer(mins); setShowTimerMenu(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#3E3E3E] ${sleepTimer === mins ? 'text-[#1DB954]' : 'text-white'}`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={toggleQueuePanel} className={`hover:text-white ${isQueuePanelOpen ? 'text-[#1DB954]' : ''}`}>
          <ListMusic className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="hover:text-white">
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
