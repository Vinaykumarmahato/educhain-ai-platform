
import React, { useState, useEffect, useRef } from 'react';
import { GradeRecord, User, UserRole, Student, Course } from '../types';
import { mockApi, BRANCHES } from '../services/mockApi';
import { Icons } from '../constants';

interface GradeListProps {
  user: User;
}

const GradeList: React.FC<GradeListProps> = ({ user }) => {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [studentsInDept, setStudentsInDept] = useState<Student[]>([]);
  const [coursesInDept, setCoursesInDept] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGrade, setEditGrade] = useState<GradeRecord | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<GradeRecord | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Searchable Dropdown States
  const [studentSearch, setStudentSearch] = useState('');
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [courseSearch, setCourseSearch] = useState('');
  const [isCourseSelectOpen, setIsCourseSelectOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const studentSelectRef = useRef<HTMLDivElement>(null);
  const courseSelectRef = useRef<HTMLDivElement>(null);

  const isStudent = user.role === UserRole.STUDENT;
  const isTeacher = user.role === UserRole.TEACHER;
  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    fetchGrades();
    if (!isStudent) {
      fetchDeptContext();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
      if (studentSelectRef.current && !studentSelectRef.current.contains(event.target as Node)) {
        setIsStudentSelectOpen(false);
      }
      if (courseSelectRef.current && !courseSelectRef.current.contains(event.target as Node)) {
        setIsCourseSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const fetchGrades = () => {
    setLoading(true);
    mockApi.getGrades(user).then(data => {
      if (isStudent) {
        setGrades(data.filter((g: any) => g.studentId === user.id || g.studentName.toLowerCase().includes(user.fullName.toLowerCase())));
      } else {
        setGrades(data);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Fetch error:', err);
      setLoading(false);
    });
  };

  const fetchDeptContext = async () => {
    const branch = isTeacher ? user.department || '' : '';
    const studentData = await mockApi.getStudents(user, 0, 1000, '', branch, '', '');
    const courseData = await mockApi.getCourses(user, 0, 1000, '', branch, '');
    setStudentsInDept(studentData.content);
    setCoursesInDept(courseData.content);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isStudent || !selectedStudent || !selectedCourse) return;

    const formData = new FormData(e.currentTarget);
    const score = parseInt(formData.get('score') as string);

    const calculateGrade = (s: number) => {
      if (s >= 90) return 'A+';
      if (s >= 80) return 'A';
      if (s >= 70) return 'B';
      if (s >= 60) return 'C';
      if (s >= 50) return 'D';
      return 'F';
    };

    const newGrade: any = {
      studentId: selectedStudent.studentId,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      courseName: selectedCourse.name,
      courseCode: selectedCourse.code,
      score: score,
      grade: calculateGrade(score),
      semester: 'Spring 2024',
      department: isTeacher ? user.department : selectedStudent.major
    };

    await mockApi.createGrade(newGrade);
    setShowAddModal(false);
    // Reset selections
    setSelectedStudent(null);
    setStudentSearch('');
    setSelectedCourse(null);
    setCourseSearch('');
    fetchGrades();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editGrade || isStudent) return;

    const calculateGrade = (s: number) => {
      if (s >= 90) return 'A+';
      if (s >= 80) return 'A';
      if (s >= 70) return 'B';
      if (s >= 60) return 'C';
      if (s >= 50) return 'D';
      return 'F';
    };

    const updatedGrade = {
      ...editGrade,
      grade: calculateGrade(editGrade.score)
    };

    await mockApi.updateGrade(updatedGrade.id, updatedGrade);
    setEditGrade(null);
    fetchGrades();
  };

  const handleDelete = async () => {
    if (!gradeToDelete || isStudent) return;
    await mockApi.deleteGrade(gradeToDelete.id);
    setGradeToDelete(null);
    fetchGrades();
  };

  const filteredStudents = studentsInDept.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCourses = coursesInDept.filter(c =>
    c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Grade Ledger</h2>
          <p className="text-slate-500 text-sm font-medium">
            {isTeacher ? `Academic oversight for ${user.department} students.` : isStudent ? 'Review your semester transcript.' : 'Institutional grade distribution and management.'}
          </p>
        </div>
        {!isStudent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center active:scale-95"
          >
            <Icons.Plus className="mr-2 w-4 h-4" /> Entry New Marks
          </button>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Active Session: Spring 2024</h3>
          </div>
          {!isStudent && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
              Authorized for: {isTeacher ? user.department : 'All Departments'}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Module</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                {!isStudent && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={isStudent ? 4 : 5} className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={isStudent ? 4 : 5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Icons.ClipboardList className="w-12 h-12 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No marks recorded for this domain.</p>
                    </div>
                  </td>
                </tr>
              ) : grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs mr-3 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {grade.studentName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">{grade.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{grade.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700">{grade.courseName}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{grade.department}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-black text-slate-900">{grade.score}</span>
                      <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div className={`h-full transition-all duration-1000 ${grade.score >= 80 ? 'bg-green-500' : grade.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`} style={{ width: `${grade.score}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${grade.grade.startsWith('A') ? 'bg-green-50 text-green-700 border-green-100' :
                      grade.grade === 'F' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                      {grade.grade}
                    </span>
                  </td>
                  {!isStudent && (
                    <td className="px-8 py-5 text-right">
                      <div className="relative inline-block" ref={openMenuId === grade.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === grade.id ? null : grade.id)}
                          className="text-slate-400 hover:text-blue-600 p-2 rounded-xl hover:bg-white transition-all"
                        >
                          <Icons.MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === grade.id && (
                          <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-[20px] shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                            <button
                              onClick={() => { setEditGrade(grade); setOpenMenuId(null); }}
                              className="w-full text-left px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center uppercase tracking-widest"
                            >
                              <Icons.Edit className="w-4 h-4 mr-3" /> Adjust Score
                            </button>
                            <button
                              onClick={() => { setGradeToDelete(grade); setOpenMenuId(null); }}
                              className="w-full text-left px-5 py-3 text-xs font-black text-red-600 hover:bg-red-50 flex items-center uppercase tracking-widest"
                            >
                              <Icons.Trash className="w-4 h-4 mr-3" /> Purge Entry
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enter Marks Modal */}
      {showAddModal && !isStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Record Academic Score</h3>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleAddSubmit}>

              {/* Searchable Student Selection */}
              <div className="space-y-2 relative" ref={studentSelectRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Student</label>
                <div className="relative group">
                  <Icons.Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isStudentSelectOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : "Search student by name or ID..."}
                    className={`w-full border-2 bg-slate-50 rounded-2xl pl-12 pr-5 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all ${selectedStudent ? 'border-blue-100 text-blue-700' : 'border-slate-50 text-slate-900'}`}
                    value={studentSearch}
                    onChange={(e) => { setStudentSearch(e.target.value); setIsStudentSelectOpen(true); }}
                    onFocus={() => setIsStudentSelectOpen(true)}
                  />
                  {selectedStudent && (
                    <button
                      type="button"
                      onClick={() => { setSelectedStudent(null); setStudentSearch(''); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500"
                    >
                      <Icons.Plus className="rotate-45 w-4 h-4" />
                    </button>
                  )}
                </div>

                {isStudentSelectOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">No students found</div>
                    ) : (
                      filteredStudents.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(s);
                            setStudentSearch('');
                            setIsStudentSelectOpen(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 group"
                        >
                          <div>
                            <p className="text-sm font-black text-slate-900 group-hover:text-blue-600">{s.firstName} {s.lastName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.studentId}</p>
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{s.major}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Searchable Course Selection */}
              <div className="space-y-2 relative" ref={courseSelectRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Course Module</label>
                <div className="relative group">
                  <Icons.Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isCourseSelectOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder={selectedCourse ? selectedCourse.name : "Search course by name or code..."}
                    className={`w-full border-2 bg-slate-50 rounded-2xl pl-12 pr-5 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all ${selectedCourse ? 'border-blue-100 text-blue-700' : 'border-slate-50 text-slate-900'}`}
                    value={courseSearch}
                    onChange={(e) => { setCourseSearch(e.target.value); setIsCourseSelectOpen(true); }}
                    onFocus={() => setIsCourseSelectOpen(true)}
                  />
                  {selectedCourse && (
                    <button
                      type="button"
                      onClick={() => { setSelectedCourse(null); setCourseSearch(''); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500"
                    >
                      <Icons.Plus className="rotate-45 w-4 h-4" />
                    </button>
                  )}
                </div>

                {isCourseSelectOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {filteredCourses.length === 0 ? (
                      <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">No courses found</div>
                    ) : (
                      filteredCourses.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCourse(c);
                            setCourseSearch('');
                            setIsCourseSelectOpen(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 group"
                        >
                          <div>
                            <p className="text-sm font-black text-slate-900 group-hover:text-blue-600">{c.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.code}</p>
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Sem {c.semester}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Verified Score (0-100)</label>
                <input name="score" type="number" min="0" max="100" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all focus:bg-white" placeholder="e.g. 85" required />
              </div>

              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-slate-50">Cancel</button>
                <button
                  type="submit"
                  disabled={!selectedStudent || !selectedCourse}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Commit Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Score Modal */}
      {editGrade && !isStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Adjust Academic Score</h3>
              <button onClick={() => setEditGrade(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleEditSubmit}>
              <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Student</span><span className="font-bold text-slate-900">{editGrade.studentName}</span></div>
                <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Course</span><span className="font-bold text-slate-900">{editGrade.courseName}</span></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Score (0-100)</label>
                <input
                  value={editGrade.score}
                  onChange={e => setEditGrade({ ...editGrade, score: parseInt(e.target.value) || 0 })}
                  type="number" min="0" max="100" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
              </div>
              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setEditGrade(null)} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-slate-50">Discard</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase tracking-widest text-xs transition-all active:scale-95">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purge Entry Modal */}
      {gradeToDelete && !isStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden border border-slate-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Icons.Trash className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Purge Grade Record?</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                You are about to permanently delete the score for <span className="text-slate-900 font-bold">{gradeToDelete.studentName}</span> in <span className="text-slate-900 font-bold">{gradeToDelete.courseName}</span>. This action is irreversible.
              </p>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex space-x-4">
              <button
                onClick={() => setGradeToDelete(null)}
                className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-white transition-all text-xs uppercase tracking-widest"
              >
                Abord
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-blue-500/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeList;
