import { Home, Search, Library, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] flex justify-around items-center h-16 z-50 md:hidden pb-safe">
      <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px]">Home</span>
      </NavLink>
      <NavLink to="/search" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>
        <Search className="w-6 h-6" />
        <span className="text-[10px]">Search</span>
      </NavLink>
      <NavLink to="/library" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>
        <Library className="w-6 h-6" />
        <span className="text-[10px]">Library</span>
      </NavLink>
      <NavLink to="/notifications" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>
        <Bell className="w-6 h-6" />
        <span className="text-[10px]">Alerts</span>
      </NavLink>
    </nav>
  );
}
