import { useEffect, useState } from 'react';
import { Search as SearchIcon, Play, Filter } from 'lucide-react';
import { usePlayerStore, Song } from '../store/usePlayerStore';

export default function Search() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<{ songs: Song[], albums: any[], artists: any[] }>({ songs: [], albums: [], artists: [] });
  const { setQueue } = usePlayerStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || genre || year || sort) {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (genre) params.append('genre', genre);
        if (year) params.append('year', year);
        if (sort) params.append('sort', sort);

        fetch(`/api/search?${params.toString()}`)
          .then(res => res.json())
          .then(setResults);
      } else {
        setResults({ songs: [], albums: [], artists: [] });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, genre, year, sort]);

  return (
    <div className="p-8 pt-16">
      <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-black" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-full leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm font-medium"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-colors ${showFilters ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-[#181818] rounded-xl border border-[#282828]">
          <select 
            value={genre} 
            onChange={e => setGenre(e.target.value)}
            className="bg-[#282828] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          >
            <option value="">All Genres</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hip hop">Hip Hop</option>
            <option value="electronic">Electronic</option>
          </select>

          <select 
            value={year} 
            onChange={e => setYear(e.target.value)}
            className="bg-[#282828] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>

          <select 
            value={sort} 
            onChange={e => setSort(e.target.value)}
            className="bg-[#282828] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          >
            <option value="">Sort By</option>
            <option value="popularity">Popularity</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
          
          {(genre || year || sort) && (
            <button 
              onClick={() => { setGenre(''); setYear(''); setSort(''); }}
              className="text-[#B3B3B3] hover:text-white px-4 py-2 text-sm font-bold"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {(query || genre || year || sort) && (
        <div className="space-y-8">
          {results.songs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
              <div className="flex flex-col gap-2">
                {results.songs.map(song => (
                  <div 
                    key={song.id}
                    onClick={() => setQueue([song], 0)}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-[#ffffff1a] cursor-pointer group"
                  >
                    <div className="relative">
                      <img src={song.albumCoverUrl} alt={song.title} className="w-12 h-12 rounded" />
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{song.title}</div>
                      <div className="text-[#B3B3B3] text-sm">{song.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.albums.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.albums.map(album => (
                  <div key={album.id} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors cursor-pointer">
                    <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover rounded mb-4 shadow-lg" />
                    <h3 className="font-bold text-white mb-1 truncate">{album.title}</h3>
                    <p className="text-sm text-[#B3B3B3] truncate">{album.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {results.songs.length === 0 && results.albums.length === 0 && results.artists.length === 0 && (
             <div className="text-center text-[#B3B3B3] mt-12">
               <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
               <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
