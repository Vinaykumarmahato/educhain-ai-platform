
import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, User, UserRole } from '../types';
import { mockApi, BRANCHES, SEMESTERS } from '../services/mockApi';
import { Icons } from '../constants';
import { downloadCSV } from '../utils/csvExport';

interface AttendanceListProps {
  user: User;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState(user.role === UserRole.TEACHER ? user.department || '' : BRANCHES[0]);
  const [semester, setSemester] = useState(SEMESTERS[0].toString());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE'>('ALL');
  const [viewMode, setViewMode] = useState<'marking' | 'report'>('marking');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  const isTeacher = user.role === UserRole.TEACHER;

  useEffect(() => {
    fetchAttendance();
  }, [date, branch, semester, search]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getAttendance(user, date, branch, semester, search);
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    // 1. ATOMIC UPDATE: Ensure the student has ONLY ONE status.
    // Changing to PRESENT automatically removes them from ABSENT because status is a single field.
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
    setSavingId(studentId);

    try {
      // 2. Persist immediately
      await mockApi.updateAttendance(date, studentId, status, branch, parseInt(semester));
    } catch (error) {
      console.error('Persistence failure', error);
    } finally {
      // Small UI delay to show synced state
      setTimeout(() => setSavingId(null), 300);
    }
  };

  const handleMarkAll = async (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setRecords(prev => prev.map(r => ({ ...r, status })));
    setLoading(true);
    const updates = records.map(record => mockApi.updateAttendance(date, record.studentId, status, branch, parseInt(semester)));
    await Promise.all(updates);
    setLoading(false);
  };

  // 3. STRICT FILTERING: Derive visible records based on status bucket.
  // If marking "Present" while in "Absent Only" view, the student will vanish immediately.
  const filteredRecords = useMemo(() => {
    if (statusFilter === 'ALL') return records;
    return records.filter(r => r.status === statusFilter);
  }, [records, statusFilter]);

  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const totalCount = records.length;
  const attendancePercentage = totalCount > 0
    ? Math.round(((presentCount + lateCount) / totalCount) * 100)
    : 0;

  const handleNotifyAbsentees = async () => {
    const absentees = records.filter(r => r.status === 'ABSENT');
    if (absentees.length === 0) return;
    setNotifying(true);
    try {
      await mockApi.sendAbsenteeNotifications(absentees);
      setNotificationSuccess(`${absentees.length} absenteeism alerts dispatched.`);
      setTimeout(() => setNotificationSuccess(null), 4000);
    } finally {
      setNotifying(false);
    }
  };

  const handleExportCSV = () => {
    const columns = { date: 'Date', studentId: 'ID', studentName: 'Name', branch: 'Branch', semester: 'Semester', status: 'Status' };
    downloadCSV(records, `Attendance_${branch}_${date}`, columns);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {notificationSuccess && (
        <div className="fixed top-24 right-8 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center border border-slate-700 animate-in slide-in-from-right-10">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
          <span className="font-black text-[10px] uppercase tracking-widest">{notificationSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Attendance Marking Hub</h2>
          <p className="text-slate-500 text-sm font-medium">Atomic presence tracking with instant verification.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button onClick={() => setViewMode('marking')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'marking' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Roll Call</button>
          <button onClick={() => setViewMode('report')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'report' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Analytics</button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Branch</label>
          <select disabled={isTeacher} className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" value={branch} onChange={(e) => setBranch(e.target.value)}>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Semester Slot</label>
          <select className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" value={semester} onChange={(e) => setSemester(e.target.value)}>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Session Date</label>
          <input type="date" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status Bucket View</label>
          <select className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all text-blue-600" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="ALL">Show All Students</option>
            <option value="PRESENT">Present Students Only</option>
            <option value="ABSENT">Absent Students Only</option>
            <option value="LATE">Late Students Only</option>
          </select>
        </div>
      </div>

      {viewMode === 'marking' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            <div className="flex space-x-3">
              <button onClick={() => handleMarkAll('PRESENT')} className="bg-green-50 text-green-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white border border-green-100 transition-all active:scale-95 shadow-sm">Bulk Present</button>
              <button onClick={() => handleMarkAll('ABSENT')} className="bg-red-50 text-red-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white border border-red-100 transition-all active:scale-95 shadow-sm">Bulk Absent</button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search by name..." className="pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button onClick={handleNotifyAbsentees} disabled={notifying || absentCount === 0} className="bg-slate-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                {notifying ? 'Dispatched' : `Alert ${absentCount} Absentees`}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verification Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Synchronization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={3} className="px-8 py-8"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Icons.Dashboard className="w-12 h-12 text-slate-200 mb-4" />
                          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No students currently in this bucket.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.map((record) => (
                    <tr key={record.studentId} className={`transition-all group ${record.status === 'PRESENT' ? 'bg-green-50/10' :
                      record.status === 'ABSENT' ? 'bg-red-50/5' : ''
                      }`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs mr-4 transition-all shadow-sm ${record.status === 'PRESENT' ? 'bg-green-600 text-white' :
                            record.status === 'LATE' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {record.studentName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{record.studentName}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sem {record.semester}</span>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${record.status === 'PRESENT' ? 'text-green-600 bg-green-50 border border-green-100' :
                                record.status === 'ABSENT' ? 'text-red-600 bg-red-50 border border-red-100' : 'text-amber-600 bg-amber-50 border border-amber-100'
                                }`}>{record.status}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleStatusChange(record.studentId, 'PRESENT')}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${record.status === 'PRESENT' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-green-500 hover:text-green-500'
                              }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(record.studentId, 'LATE')}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${record.status === 'LATE' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-amber-500 hover:text-amber-500'
                              }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleStatusChange(record.studentId, 'ABSENT')}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${record.status === 'ABSENT' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-red-500 hover:text-red-500'
                              }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          {savingId === record.studentId ? (
                            <div className="flex items-center space-x-2 animate-pulse text-blue-600">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Syncing</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-emerald-500">
                              <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                              <Icons.CalendarCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Capacity</p>
              <h4 className="text-4xl font-black text-slate-900">{totalCount}</h4>
            </div>
            <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-green-600">Present Registry</p>
              <h4 className="text-4xl font-black text-green-600">{presentCount}</h4>
            </div>
            <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-red-600">Absent Registry</p>
              <h4 className="text-4xl font-black text-red-600">{absentCount}</h4>
            </div>
            <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-blue-600">Engagement Score</p>
              <h4 className="text-4xl font-black text-blue-600">{attendancePercentage}%</h4>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-10 flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="90" fill="none" stroke="#f8fafc" strokeWidth="20" />
                <circle cx="112" cy="112" r="90" fill="none" stroke="#2563eb" strokeWidth="20" strokeDasharray="565" strokeDashoffset={565 - (565 * attendancePercentage / 100)} strokeLinecap="round" className="transition-all duration-[1000ms] ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{attendancePercentage}%</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Rate</span>
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Institutional Report: {branch}</h3>
                <p className="text-slate-500 text-base font-medium">Session analysis for {date}. Data ensures exclusive status per student record.</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency Check</p>
                  <p className="text-xl font-black text-slate-900">{presentCount + absentCount + lateCount === totalCount ? 'System Atomic' : 'Divergent'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Action Required</p>
                  <p className="text-xl font-black text-red-600">{absentCount} Flags</p>
                </div>
              </div>
              <button onClick={handleExportCSV} className="flex items-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                <Icons.ClipboardList className="w-4 h-4 mr-2" /> Download Atomic Registry (CSV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
