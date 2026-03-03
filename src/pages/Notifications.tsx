import { useAuthStore } from '../store/useAuthStore';
import { Bell, UserPlus, Music, Heart } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuthStore();

  const notifications = user?.notifications || [
    { id: 1, type: 'follow', message: 'John Doe started following you', time: '2 hours ago' },
    { id: 2, type: 'release', message: 'New single from The Weekend is out now!', time: '1 day ago' },
    { id: 3, type: 'like', message: 'Jane liked your playlist "Chill Vibes"', time: '3 days ago' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'release': return <Music className="w-5 h-5 text-[#1DB954]" />;
      case 'like': return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      default: return <Bell className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="p-8 pt-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="text-center text-[#B3B3B3] mt-12">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold text-white mb-2">No notifications yet</h2>
          <p>When you get notifications, they'll show up here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif: any) => (
            <div key={notif.id} className="flex items-start gap-4 p-4 bg-[#181818] rounded-lg hover:bg-[#282828] transition-colors cursor-pointer">
              <div className="mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{notif.message}</p>
                <p className="text-sm text-[#B3B3B3] mt-1">{notif.time}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#1DB954] mt-2"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
