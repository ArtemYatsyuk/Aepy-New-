import React from 'react';
import { Play, Pause, X, GripVertical } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function QueuePanel() {
  const { queue, queueIndex, currentSong, isQueuePanelOpen, toggleQueuePanel, playSong, setQueue, removeFromQueue, reorderQueue, isPlaying, togglePlayPause } = usePlayerStore();

  if (!isQueuePanelOpen) return null;

  const upcomingQueue = queue.slice(queueIndex + 1);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex !== dropIndex) {
      // Adjust indices to match the full queue array
      reorderQueue(queueIndex + 1 + dragIndex, queueIndex + 1 + dropIndex);
    }
  };

  return (
    <div className="w-80 bg-[#121212] border-l border-[#282828] h-full flex flex-col z-40">
      <div className="p-4 flex items-center justify-between border-b border-[#282828]">
        <h2 className="text-white font-bold">Queue</h2>
        <button onClick={toggleQueuePanel} className="text-[#B3B3B3] hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {currentSong && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white mb-3">Now Playing</h3>
            <div className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex-shrink-0">
                <img src={currentSong.albumCoverUrl} alt={currentSong.title} className="w-full h-full rounded" />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded cursor-pointer" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="w-5 h-5 text-white fill-current" /> : <Play className="w-5 h-5 text-white fill-current ml-1" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#1DB954] font-medium text-sm truncate">{currentSong.title}</div>
                <div className="text-[#B3B3B3] text-xs truncate">{currentSong.artist}</div>
              </div>
            </div>
          </div>
        )}

        {upcomingQueue.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Next In Queue</h3>
            <div className="flex flex-col gap-2">
              {upcomingQueue.map((song, idx) => (
                <div 
                  key={`${song.id}-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className="flex items-center gap-3 p-2 rounded hover:bg-[#282828] group cursor-grab active:cursor-grabbing"
                >
                  <div className="text-[#B3B3B3] opacity-0 group-hover:opacity-100 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="relative w-10 h-10 flex-shrink-0 cursor-pointer" onClick={() => setQueue(queue, queueIndex + 1 + idx)}>
                    <img src={song.albumCoverUrl} alt={song.title} className="w-full h-full rounded" />
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded">
                      <Play className="w-4 h-4 text-white fill-current ml-1" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setQueue(queue, queueIndex + 1 + idx)}>
                    <div className="text-white font-medium text-sm truncate group-hover:underline">{song.title}</div>
                    <div className="text-[#B3B3B3] text-xs truncate">{song.artist}</div>
                  </div>
                  <button 
                    onClick={() => removeFromQueue(queueIndex + 1 + idx)}
                    className="text-[#B3B3B3] hover:text-white opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
