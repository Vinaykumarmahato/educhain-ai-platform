
import React from 'react';
import { Icons } from '../constants';
import { User, UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, setActiveTab, onLogout, user }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'success', label: 'Success Analytics', icon: Icons.TrendingUp, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'students', label: 'Students', icon: Icons.Users, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'faculty', label: 'Faculty', icon: Icons.Search, roles: [UserRole.ADMIN] },
    { id: 'attendance', label: 'Attendance', icon: Icons.CalendarCheck, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'courses', label: 'Courses', icon: Icons.BookOpen, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'grades', label: 'Grades & Marks', icon: Icons.ClipboardList, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'profile', label: 'My Portfolio', icon: Icons.Users, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      <aside className={`fixed left-0 top-0 h-full bg-slate-900 text-white w-64 transition-transform duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">EC</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">EduChain</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Enterprise</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-auto">
            <div
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 p-3 mb-3 rounded-xl cursor-pointer transition-all ${activeTab === 'profile' ? 'bg-blue-600/20 ring-1 ring-blue-500' : 'bg-slate-800/50 hover:bg-slate-800'}`}
            >
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} alt="avatar" className="w-9 h-9 rounded-full ring-2 ring-slate-700" />
              <div className="truncate">
                <p className="text-xs font-black truncate text-white">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{user.role}</p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center space-x-3 px-4 py-4 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/5"
            >
              <Icons.LogOut className="w-4 h-4" />
              <span>Complete Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[28px] mx-auto flex items-center justify-center mb-6">
              <Icons.LogOut className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Sign Out?</h3>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">Closing your active institutional session will require re-authentication.</p>
            <div className="space-y-3">
              <button onClick={onLogout} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95">Complete Sign Out</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Stay Signed In</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
