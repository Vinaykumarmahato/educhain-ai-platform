
import React, { useEffect, useState, useRef } from 'react';
import { DashboardStats, User, UserRole, Student, Course, Faculty } from '../types';
import { mockApi } from '../services/mockApi';
import StatCard from '../components/StatCard';
import AIInsights from '../components/AIInsights';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { downloadCSV } from '../utils/csvExport';
import { Icons } from '../constants';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard Search States
  const [dbSearchTerm, setDbSearchTerm] = useState('');
  const [dbSearchResults, setDbSearchResults] = useState<{ students: Student[], courses: Course[], faculty: Faculty[] } | null>(null);
  const [isDbSearching, setIsDbSearching] = useState(false);

  useEffect(() => {
    mockApi.getDashboardStats(user).then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  // Handle Dashboard-specific Resource Search
  useEffect(() => {
    if (dbSearchTerm.length < 2) {
      setDbSearchResults(null);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsDbSearching(true);
      const results = await mockApi.globalSearch(dbSearchTerm);
      setDbSearchResults(results);
      setIsDbSearching(false);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [dbSearchTerm]);

  const chartData = [
    { name: 'Mon', count: 40 },
    { name: 'Tue', count: 52 },
    { name: 'Wed', count: 38 },
    { name: 'Thu', count: 65 },
    { name: 'Fri', count: 48 },
    { name: 'Sat', count: 72 },
    { name: 'Sun', count: 85 },
  ];

  const handleExportStats = () => {
    if (!stats) return;
    const columns = { name: 'Branch Name', val: 'Student Count' };
    downloadCSV(stats.branchDistribution, `Branch_Distribution_${new Date().toISOString().split('T')[0]}`, columns);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Enrolled Students" value={stats?.totalStudents || 0} change="+12%" type="info" />
        <StatCard title="Total Courses" value={stats?.totalCourses || 0} change="+2" type="success" />
        <StatCard title="Active Faculty" value={stats?.activeTeachers || 0} change="Stable" type="warning" />
        <StatCard title="Average CGPA" value={stats?.averageGpa || 0} change="+0.12" type="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {stats && <AIInsights stats={stats} userRole={user.role} />}
        </div>

        {/* FUNCTIONAL SEARCH RESOURCES AREA */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Command</h3>
            <Icons.Search className="w-4 h-4 text-slate-300" />
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search registry & files..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3 text-xs font-bold focus:border-blue-500 focus:bg-white transition-all outline-none"
              value={dbSearchTerm}
              onChange={(e) => setDbSearchTerm(e.target.value)}
            />
            {isDbSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {dbSearchResults ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {dbSearchResults.students.length > 0 && (
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mb-2">Registry Matches</p>
                    {dbSearchResults.students.slice(0, 2).map(s => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-700">{s.firstName} {s.lastName}</span>
                        <span className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">Student</span>
                      </div>
                    ))}
                  </div>
                )}
                {dbSearchResults.courses.length > 0 && (
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mb-2">Module Matches</p>
                    {dbSearchResults.courses.slice(0, 2).map(c => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-700">{c.name}</span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">Module</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-4">Quick Resources</p>
                {[
                  { label: 'Academic Calendar 2024', icon: Icons.CalendarCheck },
                  { label: 'Institutional Policy v2', icon: Icons.ClipboardList },
                  { label: 'Faculty Onboarding Kit', icon: Icons.Users },
                  { label: 'System Documentation', icon: Icons.BookOpen }
                ].map((res, i) => (
                  <button key={i} className="w-full p-4 bg-slate-50 rounded-2xl flex items-center space-x-4 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100 group">
                    <res.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{res.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
            <Icons.TrendingUp className="w-4 h-4 mr-2 text-blue-600" /> Enrollment Velocity
          </h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 'black', fontSize: '12px' }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={1} fill="url(#colorCount)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Branch Distribution</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.branchDistribution || []}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="val" radius={[12, 12, 0, 0]} barSize={32}>
                  {(stats?.branchDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Top Branch</span>
              <span className="text-blue-600">B.Tech (32%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[32%]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">System Activity Log</h3>
          <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Logs</button>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { user: 'Admin', action: 'Modified course catalog', time: '2 mins ago', icon: '📝' },
            { user: 'Dr. Reed', action: 'Finalized grades for CS202', time: '45 mins ago', icon: '🎓' },
            { user: 'System', action: 'Automated attendance backup complete', time: '1 hour ago', icon: '⚙️' }
          ].map((item, i) => (
            <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-lg shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{item.action}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">By {item.user}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Assigned Courses" value={stats?.teacherStats?.assignedCourses || 0} change="Current" type="info" />
        <StatCard title="Avg Class GPA" value={`${stats?.teacherStats?.avgClassPerformance || 0}%`} change="+2.4%" type="success" />
        <StatCard title="Pending Attendance" value={stats?.teacherStats?.pendingAttendance || 0} change="Action Required" type="warning" />
      </div>

      {stats && <AIInsights stats={stats} userRole={user.role} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Class Performance Velocity</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'CS101', score: 82 },
                { name: 'DBMS', score: 75 },
                { name: 'DSA', score: 88 },
                { name: 'Web Dev', score: 91 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <Bar dataKey="score" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Faculty Quick Portal</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Attendance', icon: Icons.CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Marks Entry', icon: Icons.ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Class Mail', icon: Icons.Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Curriculum', icon: Icons.BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' }
            ].map((btn, i) => (
              <button key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group text-left">
                <btn.icon className={`w-7 h-7 ${btn.color} mb-3 group-hover:scale-110 transition-transform`} />
                <p className="font-black text-[10px] uppercase tracking-widest text-slate-900">{btn.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Grading Status</h3>
        <div className="space-y-4">
          {[
            { name: 'Data Structures (CS201)', progress: 100, status: 'Completed' },
            { name: 'Database Systems (CS202)', progress: 45, status: 'In Progress' },
            { name: 'Web Architectures (CS205)', progress: 0, status: 'Not Started' }
          ].map((course, i) => (
            <div key={i} className="flex items-center space-x-6 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-black text-slate-900 mb-1">{course.name}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${course.progress === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {course.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Academic GPA" value={stats?.studentStats?.personalGpa || 0} change="Top 10%" type="success" />
        <StatCard title="Presence Rate" value={`${stats?.studentStats?.attendanceRate || 0}%`} change="Excellent" type="info" />
        <StatCard title="Credit Completion" value={stats?.studentStats?.creditsEarned || 0} change="/ 140" type="warning" />
      </div>

      {stats && <AIInsights stats={stats} userRole={user.role} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Upcoming Milestones</h3>
          <div className="space-y-4">
            {stats?.studentStats?.upcomingDeadlines.map((deadline, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icons.ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{deadline.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Submit by {new Date(deadline.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10">Submit</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Degree Progress Gauge</h3>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="80" cy="80" r="70" fill="none" stroke="#22c55e" strokeWidth="12"
                  strokeDasharray="440" strokeDashoffset={440 - (440 * (stats?.studentStats?.creditsEarned || 0) / 140)}
                  strokeLinecap="round" className="transition-all duration-[2000ms] ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{Math.round((stats?.studentStats?.creditsEarned || 0) / 1.4)}%</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Complete</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500">
              You have earned <span className="text-emerald-600 font-black">{stats?.studentStats?.creditsEarned}</span> units of the required 140.
              Keep it up, you are in the 85th percentile of your cohort.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Grade Trajectory</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Sem 1', gpa: 3.5, target: 3.6 },
              { name: 'Sem 2', gpa: 3.7, target: 3.6 },
              { name: 'Sem 3', gpa: 3.65, target: 3.7 },
              { name: 'Sem 4', gpa: 3.82, target: 3.8 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
              <YAxis domain={[3, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="gpa" stroke="#22c55e" fill="#f0fdf4" strokeWidth={4} />
              <Area type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="5 5" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
            <div className="w-3 h-1 bg-emerald-600 mr-2"></div> Actual GPA
          </div>
          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            <div className="w-3 h-1 bg-slate-300 mr-2 border-dashed"></div> Target Goal
          </div>
        </div>
      </div>
    </>
  );

  const getRoleTitle = () => {
    switch (user.role) {
      case UserRole.ADMIN: return "Institutional Oversight";
      case UserRole.TEACHER: return "Faculty Workstation";
      case UserRole.STUDENT: return "Learning Success Hub";
      default: return "Academic Dashboard";
    }
  };

  const getRoleDesc = () => {
    switch (user.role) {
      case UserRole.ADMIN: return "Enterprise-level visibility and multi-department analytics.";
      case UserRole.TEACHER: return "Classroom metrics, curriculum health, and grading workflows.";
      case UserRole.STUDENT: return "Personal performance tracking and academic roadmap.";
      default: return "";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{getRoleTitle()}</h2>
          <p className="text-slate-500 font-medium text-sm">{getRoleDesc()}</p>
        </div>
        <div className="flex items-center space-x-3">
          {user.role === UserRole.ADMIN && (
            <button
              onClick={handleExportStats}
              className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black shadow-sm hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center text-xs uppercase tracking-widest active:scale-95"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Global Export
            </button>
          )}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center space-x-1 border border-slate-200 shadow-inner">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full ml-1"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Live Session</span>
          </div>
        </div>
      </div>

      {user.role === UserRole.ADMIN && renderAdminDashboard()}
      {user.role === UserRole.TEACHER && renderTeacherDashboard()}
      {user.role === UserRole.STUDENT && renderStudentDashboard()}
    </div>
  );
};

export default Dashboard;
