
import React, { useState, useEffect, useRef } from 'react';
import { Course, User, UserRole } from '../types';
import { mockApi, BRANCHES, SEMESTERS } from '../services/mockApi';
import { Icons } from '../constants';

interface CourseListProps {
  user: User;
}

const CourseList: React.FC<CourseListProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState(user.role === UserRole.TEACHER ? user.department || '' : '');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 6;
  const isTeacher = user.role === UserRole.TEACHER;
  const isAdmin = user.role === UserRole.ADMIN;
  const isStudent = user.role === UserRole.STUDENT;

  useEffect(() => {
    fetchCourses();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [page, search, branchFilter, semesterFilter]);

  const fetchCourses = () => {
    setLoading(true);
    mockApi.getCourses(user, page, ITEMS_PER_PAGE, search, branchFilter, semesterFilter)
      .then(data => {
        setCourses(data.content);
        setTotalItems(data.total);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse || isStudent) return;
    await mockApi.updateCourse(editCourse.id, editCourse);
    setEditCourse(null);
    fetchCourses();
  };

  const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isStudent) return;
    const formData = new FormData(e.currentTarget);
    const newCourse: Omit<Course, 'id' | 'studentCount'> = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      department: isTeacher ? user.department! : formData.get('department') as string,
      semester: parseInt(formData.get('semester') as string),
      credits: parseInt(formData.get('credits') as string) || 3,
      capacity: parseInt(formData.get('capacity') as string) || 100,
      instructor: formData.get('instructor') as string || 'TBD'
    };
    await mockApi.createCourse(newCourse);
    setShowAddModal(false);
    fetchCourses();
  };

  const confirmDelete = async () => {
    if (!courseToDelete || isStudent) return;
    await mockApi.deleteCourse(courseToDelete.id);
    setCourseToDelete(null);
    setOpenMenuId(null);
    fetchCourses();
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getCapacityTextColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 70) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Curriculum Registry</h2>
          <p className="text-slate-500 text-sm font-medium">
            {isTeacher ? `Academic modules for the ${user.department} department.` : 'Global institutional course catalog and workload management.'}
          </p>
        </div>
        <div className="flex space-x-3">
          {!isStudent && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center active:scale-95 text-[10px] uppercase tracking-widest"
            >
              <Icons.Plus className="mr-2 w-4 h-4" /> Add Academic Module
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[28px] p-5 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by module name or code..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:border-blue-500 transition-all outline-none"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        <div className="flex space-x-2">
          <select
            disabled={isTeacher}
            className={`bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all ${isTeacher ? 'opacity-60 cursor-not-allowed text-blue-600' : ''}`}
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Branches</option>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            className="bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all"
            value={semesterFilter}
            onChange={(e) => { setSemesterFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-white border border-slate-100 rounded-[32px] animate-pulse"></div>
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icons.BookOpen className="text-slate-300 w-8 h-8" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Curricula entries found.</p>
          </div>
        ) : courses.map(course => {
          const utilization = Math.round((course.studentCount / course.capacity) * 100);
          const isMenuOpen = openMenuId === course.id;

          return (
            <div key={course.id} className="bg-white border border-slate-200 rounded-[32px] overflow-visible shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all group flex flex-col relative">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex flex-col">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-blue-100 inline-block mb-1.5">
                      {course.code}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Semester {course.semester}</span>
                  </div>

                  {!isStudent && (
                    <div className="relative" ref={isMenuOpen ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : course.id)}
                        className={`p-2 rounded-xl transition-all ${isMenuOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                        <Icons.MoreVertical className="w-5 h-5" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                          <button
                            onClick={() => { setEditCourse(course); setOpenMenuId(null); }}
                            className="w-full text-left px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center uppercase tracking-widest"
                          >
                            <Icons.Edit className="w-4 h-4 mr-3 text-blue-600" /> Modify
                          </button>
                          <button
                            onClick={() => { setCourseToDelete(course); setOpenMenuId(null); }}
                            className="w-full text-left px-5 py-3 text-xs font-black text-red-600 hover:bg-red-50 flex items-center uppercase tracking-widest"
                          >
                            <Icons.Trash className="w-4 h-4 mr-3 text-red-600" /> Purge
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight min-h-[56px] group-hover:text-blue-600 transition-colors">
                  {course.name}
                </h4>

                <div className="flex items-center text-xs text-slate-500 mb-8 font-bold bg-slate-50 py-2 px-3 rounded-xl inline-flex border border-slate-100">
                  <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center mr-2 text-[8px] font-black text-white uppercase">
                    {course.instructor?.[0]}
                  </div>
                  {course.instructor}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Enrollment Density</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getCapacityTextColor(utilization)}`}>
                      {utilization}% Filled
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-100">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${getCapacityColor(utilization)}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                    <div className="flex flex-col">
                      <span className="text-slate-400">Total Seats</span>
                      <span className="text-slate-900">{course.capacity}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400">Credits</span>
                      <span className="text-slate-900">{course.credits} Units</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-[32px]">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{course.department}</span>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Curriculum Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-12">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-12 h-12 rounded-[18px] font-black text-xs transition-all shadow-sm ${page === i ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showAddModal && !isStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Academic Module</h3>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleAddCourse}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Module Code</label>
                  <input name="code" type="text" placeholder="e.g. CS-402" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Credit Units</label>
                  <input name="credits" type="number" defaultValue={3} className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Module Full Title</label>
                <input name="name" type="text" placeholder="e.g. Advanced Operating Systems" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Instructor Assignment</label>
                <input name="instructor" type="text" placeholder="Institutional Faculty Name" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Academic Branch</label>
                  <select
                    disabled={isTeacher}
                    name="department" className={`w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all ${isTeacher ? 'opacity-60' : ''}`}
                    defaultValue={isTeacher ? user.department : ''}
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Semester Cycle</label>
                  <select name="semester" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all">
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Enrollment Capacity</label>
                <input name="capacity" type="number" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" defaultValue={120} required />
              </div>
              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs transition-all active:scale-95">Verify & Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODIFY COURSE MODAL */}
      {editCourse && !isStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Modify Module</h3>
              <button onClick={() => setEditCourse(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleUpdateCourse}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Module Code</label>
                  <input
                    value={editCourse.code}
                    onChange={e => setEditCourse({ ...editCourse, code: e.target.value })}
                    type="text" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Credits</label>
                  <input
                    value={editCourse.credits}
                    onChange={e => setEditCourse({ ...editCourse, credits: parseInt(e.target.value) || 0 })}
                    type="number" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Title</label>
                <input
                  value={editCourse.name}
                  onChange={e => setEditCourse({ ...editCourse, name: e.target.value })}
                  type="text" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Instructor</label>
                <input
                  value={editCourse.instructor}
                  onChange={e => setEditCourse({ ...editCourse, instructor: e.target.value })}
                  type="text" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Capacity</label>
                  <input
                    value={editCourse.capacity}
                    onChange={e => setEditCourse({ ...editCourse, capacity: parseInt(e.target.value) || 0 })}
                    type="number" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Semester Cycle</label>
                  <select
                    value={editCourse.semester}
                    onChange={e => setEditCourse({ ...editCourse, semester: parseInt(e.target.value) })}
                    className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all">
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setEditCourse(null)} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-slate-50">Discard</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs transition-all active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {courseToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden border border-slate-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Icons.Trash className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Purge Curriculum?</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                You are about to delete <span className="text-slate-900 font-bold">{courseToDelete.name}</span>. This will affect institutional reporting and student transcripts.
              </p>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex space-x-4">
              <button
                onClick={() => setCourseToDelete(null)}
                className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-white transition-all text-[10px] uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-red-500/30 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
