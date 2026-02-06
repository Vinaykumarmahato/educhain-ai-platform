
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import CourseList from './pages/CourseList';
import GradeList from './pages/GradeList';
import AttendanceList from './pages/AttendanceList';
import SuccessAnalytics from './pages/SuccessAnalytics';
import FacultyList from './pages/FacultyList';
import ProfilePage from './pages/ProfilePage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'courses' | 'grades' | 'attendance' | 'success' | 'faculty' | 'profile'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('edu_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('edu_user', JSON.stringify(loggedInUser));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edu_user');
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('edu_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    const canSeeSuccess = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;
    const canSeeFaculty = user.role === UserRole.ADMIN;
    const canSeeAttendance = user.role !== UserRole.STUDENT;
    const canSeeStudents = user.role !== UserRole.STUDENT;

    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'students': return canSeeStudents ? <StudentList user={user} /> : <Dashboard user={user} />;
      case 'courses': return <CourseList user={user} />;
      case 'grades': return <GradeList user={user} />;
      case 'attendance': return canSeeAttendance ? <AttendanceList user={user} /> : <Dashboard user={user} />;
      case 'success': return canSeeSuccess ? <SuccessAnalytics user={user} /> : <Dashboard user={user} />;
      case 'faculty': return canSeeFaculty ? <FacultyList /> : <Dashboard user={user} />;
      case 'profile': return <ProfilePage user={user} onUpdateUser={handleUpdateUser} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar
          user={user}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
