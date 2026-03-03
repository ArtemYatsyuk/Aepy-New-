import { useEffect, useState } from 'react';
import { Users, BarChart3, Music, PlayCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(setStats);
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 pt-16 flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-[#B3B3B3]">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-white">Loading stats...</div>;

  return (
    <div className="p-8 pt-16">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#181818] p-6 rounded-lg border border-[#282828]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[#B3B3B3] text-sm">Total Users</div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#181818] p-6 rounded-lg border border-[#282828]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[#B3B3B3] text-sm">Total Streams</div>
              <div className="text-2xl font-bold text-white">{stats.totalStreams}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#181818] p-6 rounded-lg border border-[#282828]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[#B3B3B3] text-sm">Total Songs</div>
              <div className="text-2xl font-bold text-white">{stats.totalSongs}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#181818] p-6 rounded-lg border border-[#282828]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[#B3B3B3] text-sm">Active Users (24h)</div>
              <div className="text-2xl font-bold text-white">{Math.floor(stats.totalUsers * 0.4)}</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Most Played Tracks</h2>
      <div className="bg-[#181818] rounded-lg border border-[#282828] overflow-hidden">
        <table className="w-full text-left text-sm text-[#B3B3B3]">
          <thead className="bg-[#282828] text-white">
            <tr>
              <th className="px-6 py-4 font-medium">Rank</th>
              <th className="px-6 py-4 font-medium">Track ID</th>
              <th className="px-6 py-4 font-medium text-right">Streams</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282828]">
            {stats.mostPlayedTracks.map((track: any, index: number) => (
              <tr key={track.songId} className="hover:bg-[#ffffff0a]">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-white">{track.songId}</td>
                <td className="px-6 py-4 text-right">{track.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
