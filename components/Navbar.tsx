
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { User, UserRole, Notification, Student, Course, Faculty } from '../types';
import { mockApi } from '../services/mockApi';

interface NavbarProps {
  user: User;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  setActiveTab: (tab: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, toggleSidebar, isSidebarOpen, setActiveTab }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ students: Student[], courses: Course[], faculty: Faculty[] }>({
    students: [], courses: [], faculty: []
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      const data = await mockApi.getNotifications();
      setNotifications(data);
    };
    fetchNotifs();

    const interval = setInterval(fetchNotifs, 5000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global Search Logic with Debouncing
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults({ students: [], courses: [], faculty: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      const results = await mockApi.globalSearch(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await mockApi.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'System Administrator';
      case UserRole.TEACHER: return 'Faculty Member';
      case UserRole.STUDENT: return 'Undergraduate Student';
      default: return 'User';
    }
  };

  const handleResultClick = (tab: string) => {
    setActiveTab(tab);
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const hasAnyResults = searchResults.students.length > 0 || searchResults.courses.length > 0 || searchResults.faculty.length > 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
          aria-label="Toggle Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* FUNCTIONAL SEARCH BOX */}
        <div className="relative" ref={searchRef}>
          <div className={`hidden md:flex items-center bg-slate-50 rounded-2xl px-4 py-2 w-80 border transition-all ${isSearchOpen ? 'border-blue-400 bg-white ring-4 ring-blue-500/10' : 'border-slate-200 focus-within:border-blue-400'}`}>
            <Icons.Search className={`mr-2 w-4 h-4 transition-colors ${isSearchOpen ? 'text-blue-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search ID, Module, or Faculty..." 
              className="bg-transparent text-xs font-bold focus:outline-none w-full text-slate-600"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-300 hover:text-red-500">
                <Icons.Plus className="rotate-45 w-4 h-4" />
              </button>
            )}
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {isSearchOpen && (searchTerm.length >= 2) && (
            <div className="absolute top-full left-0 mt-3 w-[400px] bg-white border border-slate-200 rounded-[28px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 glass-panel">
              <div className="max-h-[500px] overflow-y-auto">
                {isSearching ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="flex justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Institutional Registry...</p>
                  </div>
                ) : !hasAnyResults ? (
                  <div className="p-10 text-center">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No matching records found.</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Students Section */}
                    {searchResults.students.length > 0 && (
                      <div className="px-2 pb-4">
                        <div className="px-4 py-2">
                           <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Students</h5>
                        </div>
                        {searchResults.students.map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => handleResultClick('students')}
                            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all">
                              ST
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-black text-slate-900 leading-none mb-1">{s.firstName} {s.lastName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{s.studentId} • {s.major}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Courses Section */}
                    {searchResults.courses.length > 0 && (
                      <div className="px-2 pb-4">
                        <div className="px-4 py-2">
                           <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Academic Modules</h5>
                        </div>
                        {searchResults.courses.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => handleResultClick('courses')}
                            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-black text-[10px] group-hover:bg-emerald-600 group-hover:text-white transition-all">
                              AC
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-black text-slate-900 leading-none mb-1">{c.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{c.code} • Sem {c.semester}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Faculty Section */}
                    {searchResults.faculty.length > 0 && (
                      <div className="px-2 pb-2">
                        <div className="px-4 py-2">
                           <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty Members</h5>
                        </div>
                        {searchResults.faculty.map(f => (
                          <button 
                            key={f.id} 
                            onClick={() => handleResultClick('faculty')}
                            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              FC
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-black text-slate-900 leading-none mb-1">{f.firstName} {f.lastName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{f.designation} • {f.department}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Institutional Contextual Search v1.2</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-6">
        <div className="hidden lg:flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Network Secure</span>
        </div>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2.5 rounded-xl transition-all group ${isNotifOpen ? 'bg-blue-50' : 'hover:bg-slate-100'}`}
          >
            <Icons.Bell className={`${isNotifOpen ? 'text-blue-600' : 'text-slate-500'} group-hover:text-blue-600 transition-colors`} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-[24px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Alerts</h4>
                 <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{unreadCount} New</span>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No notifications</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                      onClick={() => markRead(notif.id)}
                    >
                      <div className="flex items-start space-x-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                           notif.type === 'REGISTRATION' ? 'bg-emerald-100 text-emerald-600' :
                           notif.type === 'SYSTEM' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                         }`}>
                           {notif.type === 'REGISTRATION' ? <Icons.Users className="w-4 h-4" /> : <Icons.Bell className="w-4 h-4" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className={`text-xs font-black mb-0.5 ${notif.read ? 'text-slate-500' : 'text-slate-900'}`}>{notif.title}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed truncate">{notif.message}</p>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-1 block">{notif.time}</span>
                         </div>
                         {!notif.read && (
                           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                         )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="w-full py-3 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                View All Archives
              </button>
            </div>
          )}
        </div>
        
        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
        
        <div className="flex items-center space-x-3 pl-2 group cursor-pointer">
          <div className="hidden md:block text-right">
            <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getRoleLabel(user.role)}</p>
          </div>
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
            alt="profile" 
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm group-hover:ring-blue-200 transition-all"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
