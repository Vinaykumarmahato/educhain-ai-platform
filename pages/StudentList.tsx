
import React, { useState, useEffect, useRef } from 'react';
import { Student, User, UserRole } from '../types';
import { mockApi, BRANCHES, SEMESTERS } from '../services/mockApi';
import { Icons } from '../constants';
import { downloadCSV } from '../utils/csvExport';

interface StudentListProps {
  user: User;
}

const StudentList: React.FC<StudentListProps> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState(user.role === UserRole.TEACHER ? user.department || '' : '');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const menuRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;
  const isAdmin = user.role === UserRole.ADMIN;
  const isTeacher = user.role === UserRole.TEACHER;

  useEffect(() => {
    fetchStudents();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [page, search, branchFilter, semesterFilter, statusFilter]);

  const fetchStudents = () => {
    setLoading(true);
    mockApi.getStudents(user, page, ITEMS_PER_PAGE, search, branchFilter, semesterFilter, statusFilter)
      .then(data => {
        setStudents(data.content);
        setTotalItems(data.total);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportCSV = () => {
    const columns = {
      studentId: 'Student ID',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      mobileNumber: 'Mobile',
      password: 'Password',
      major: 'Branch',
      semester: 'Semester',
      status: 'Status',
      gpa: 'GPA',
      enrollmentDate: 'Enrollment Date'
    };
    downloadCSV(students, `Students_Export_${new Date().toISOString().split('T')[0]}`, columns);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.currentTarget);
    const newStudent: Omit<Student, 'id'> = {
      studentId: `EDU-2024-${Math.floor(Math.random() * 9000) + 1000}`,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      mobileNumber: formData.get('mobileNumber') as string,
      password: `Pass@${Math.floor(Math.random() * 9000) + 1000}`,
      major: formData.get('major') as string,
      semester: parseInt(formData.get('semester') as string),
      enrollmentDate: formData.get('enrollmentDate') as string,
      status: 'ACTIVE',
      gpa: 0.0
    };

    console.log('Attempting to register student:', newStudent);
    try {
      await mockApi.createStudent(newStudent);
      console.log('Student registered successfully');
      setShowAddModal(false);
      fetchStudents();
    } catch (error: any) {
      console.error('Failed to register student:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Unknown server error';
      alert(`Failed to register student: ${errorMessage}`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editStudent) return;
    await mockApi.updateStudent(editStudent.id, editStudent);
    setEditStudent(null);
    fetchStudents();
  };

  const handleDelete = async () => {
    if (!studentToDelete || !isAdmin) return;
    await mockApi.deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    fetchStudents();
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 leading-none mb-1">Student Directory</h2>
          <p className="text-slate-500 text-sm">
            {isTeacher ? `Managing students for ${user.department} branch.` : 'Review credentials and academic status for verified enrollment.'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export CSV
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center"
            >
              <Icons.Plus className="mr-2" /> Register Student
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[200px]">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, Name, or Mobile..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>

          <div className="flex space-x-2">
            <select
              disabled={isTeacher}
              className={`bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isTeacher ? 'opacity-60 cursor-not-allowed font-black text-blue-600 bg-slate-100' : ''}`}
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Branches</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={semesterFilter}
              onChange={(e) => { setSemesterFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>

            <select
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal Credentials</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-slate-100 rounded"></div></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No students found in your department.</td>
                </tr>
              ) : students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold mr-3 uppercase">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.major}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID:</span>
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-600">{student.studentId}</code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PW:</span>
                        <div className="flex items-center bg-slate-100 px-1.5 py-0.5 rounded group/pw">
                          <code className="text-xs font-mono font-bold text-slate-700 w-24 overflow-hidden">
                            {visiblePasswords[student.id] ? student.password : '••••••••'}
                          </code>
                          <button onClick={() => togglePassword(student.id)} className="ml-2 text-slate-400 hover:text-blue-600">
                            {visiblePasswords[student.id] ? <Icons.EyeOff className="w-3 h-3" /> : <Icons.Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{student.mobileNumber || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{student.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                      student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block" ref={openMenuId === student.id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                        className="text-slate-400 hover:text-blue-600 p-1"
                      >
                        <Icons.MoreVertical />
                      </button>
                      {openMenuId === student.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5">
                          <button
                            onClick={() => { setEditStudent(student); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center"
                          >
                            <Icons.Edit className="w-4 h-4 mr-2" /> Edit Record
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => { setStudentToDelete(student); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Icons.Trash className="w-4 h-4 mr-2" /> Remove Profile
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {page + 1} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal (ADMIN ONLY) */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Register Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">First Name</label>
                  <input name="firstName" type="text" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                  <input name="lastName" type="text" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
                  <input name="email" type="email" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Mobile Number</label>
                  <input name="mobileNumber" type="tel" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Academic Branch</label>
                  <select name="major" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold">
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Semester</label>
                  <select name="semester" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold">
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Enrollment Date</label>
                <input name="enrollmentDate" type="date" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-slate-400 uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase tracking-widest text-xs">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Faculty/Admin) */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Update Student Profile</h3>
              <button onClick={() => setEditStudent(null)} className="text-slate-400 hover:text-slate-600">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">First Name</label>
                  <input
                    value={editStudent.firstName}
                    onChange={e => setEditStudent({ ...editStudent, firstName: e.target.value })}
                    type="text" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                  <input
                    value={editStudent.lastName}
                    onChange={e => setEditStudent({ ...editStudent, lastName: e.target.value })}
                    type="text" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
                  <input
                    value={editStudent.email}
                    onChange={e => setEditStudent({ ...editStudent, email: e.target.value })}
                    type="email" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Mobile Number</label>
                  <input
                    value={editStudent.mobileNumber || ''}
                    onChange={e => setEditStudent({ ...editStudent, mobileNumber: e.target.value })}
                    type="tel" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Branch</label>
                  <select
                    disabled={isTeacher}
                    value={editStudent.major}
                    onChange={e => setEditStudent({ ...editStudent, major: e.target.value })}
                    className={`w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold ${isTeacher ? 'opacity-50' : ''}`}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Semester</label>
                  <select
                    value={editStudent.semester}
                    onChange={e => setEditStudent({ ...editStudent, semester: parseInt(e.target.value) })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold">
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Status</label>
                <select
                  value={editStudent.status}
                  onChange={e => setEditStudent({ ...editStudent, status: e.target.value as any })}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setEditStudent(null)} className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-slate-400 uppercase tracking-widest text-xs">Discard</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase tracking-widest text-xs">Update Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (ADMIN ONLY) */}
      {studentToDelete && isAdmin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden border border-slate-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icons.Trash className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Confirm Deletion</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Remove <span className="text-slate-900 font-bold">{studentToDelete.firstName} {studentToDelete.lastName}</span> from the institutional directory?
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex space-x-4">
              <button onClick={() => setStudentToDelete(null)} className="flex-1 px-6 py-3 border-2 border-slate-200 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-white">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-blue-500/30 uppercase tracking-widest text-xs active:scale-95 transition-all">Delete Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
