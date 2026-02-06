
import React, { useState, useEffect, useRef } from 'react';
import { Faculty } from '../types';
import { mockApi, BRANCHES, DESIGNATIONS } from '../services/mockApi';
import { Icons } from '../constants';

const FacultyList: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFaculty();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [search, branchFilter, statusFilter]);

  const fetchFaculty = () => {
    setLoading(true);
    mockApi.getFaculty(search, branchFilter, statusFilter)
      .then(data => {
        setFaculty(data);
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

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFaculty: Omit<Faculty, 'id'> = {
      employeeId: `FAC-2024-${Math.floor(Math.random() * 900) + 100}`,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      mobileNumber: formData.get('mobileNumber') as string,
      password: `Fac@${Math.floor(Math.random() * 900) + 100}`,
      department: formData.get('department') as string,
      designation: formData.get('designation') as string,
      status: 'ACTIVE',
      joiningDate: new Date().toISOString()
    };
    await mockApi.createFaculty(newFaculty);
    setShowAddModal(false);
    fetchFaculty();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editFaculty) return;
    await mockApi.updateFaculty(editFaculty.id, editFaculty);
    setEditFaculty(null);
    fetchFaculty();
  };

  const handleDelete = async () => {
    if (!facultyToDelete) return;
    await mockApi.deleteFaculty(facultyToDelete.id);
    setFacultyToDelete(null);
    fetchFaculty();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Faculty Directory</h2>
          <p className="text-slate-500 font-medium text-sm">Secure credential management and academic staff registry.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center uppercase tracking-widest text-xs"
        >
          <Icons.Plus className="mr-2 w-4 h-4" /> Recruit Faculty
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[240px]">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by ID, Name, or Mobile..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex space-x-3">
            <select
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="RESIGNED">Resigned</option>
              <option value="INACTIVE">Inactive (Pending)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Credentials</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6"><div className="h-12 bg-slate-100 rounded-2xl"></div></td>
                  </tr>
                ))
              ) : faculty.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-black uppercase tracking-widest text-xs">No faculty records match your query.</td>
                </tr>
              ) : faculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm mr-4 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {f.firstName[0]}{f.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">{f.firstName} {f.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{f.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emp ID:</span>
                        <code className="text-xs bg-indigo-50 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-600">{f.employeeId}</code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PW:</span>
                        <div className="flex items-center bg-slate-100 px-1.5 py-0.5 rounded group/pw">
                          <code className="text-xs font-mono font-bold text-slate-700 w-24 overflow-hidden">
                            {visiblePasswords[f.id] ? f.password : '••••••••'}
                          </code>
                          <button onClick={() => togglePassword(f.id)} className="ml-2 text-slate-400 hover:text-indigo-600">
                            {visiblePasswords[f.id] ? <Icons.EyeOff className="w-3 h-3" /> : <Icons.Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{f.mobileNumber || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{f.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${f.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                        f.status === 'ON_LEAVE' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                      {f.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="relative inline-block" ref={openMenuId === f.id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
                        className="text-slate-400 hover:text-blue-600 p-2 rounded-xl hover:bg-white transition-all"
                      >
                        <Icons.MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === f.id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-[20px] shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                          <button
                            onClick={() => { setEditFaculty(f); setOpenMenuId(null); }}
                            className="w-full text-left px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center uppercase tracking-widest"
                          >
                            <Icons.Edit className="w-4 h-4 mr-3" /> Update Profile
                          </button>
                          <button
                            onClick={() => { setFacultyToDelete(f); setOpenMenuId(null); }}
                            className="w-full text-left px-5 py-3 text-xs font-black text-red-600 hover:bg-red-50 flex items-center uppercase tracking-widest"
                          >
                            <Icons.Trash className="w-4 h-4 mr-3" /> Terminate Contract
                          </button>
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recruit New Faculty</h3>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                  <input name="firstName" type="text" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                  <input name="lastName" type="text" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <input name="email" type="email" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp/Mobile</label>
                  <input name="mobileNumber" type="tel" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                  <select name="department" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all">
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Designation</label>
                  <select name="designation" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all">
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase tracking-widest text-xs transition-all active:scale-95">Complete Recruitment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Update Faculty Profile</h3>
              <button onClick={() => setEditFaculty(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                  <input
                    value={editFaculty.firstName}
                    onChange={e => setEditFaculty({ ...editFaculty, firstName: e.target.value })}
                    type="text" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                  <input
                    value={editFaculty.lastName}
                    onChange={e => setEditFaculty({ ...editFaculty, lastName: e.target.value })}
                    type="text" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp</label>
                  <input
                    value={editFaculty.mobileNumber || ''}
                    onChange={e => setEditFaculty({ ...editFaculty, mobileNumber: e.target.value })}
                    type="tel" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                  <select
                    value={editFaculty.status}
                    onChange={e => setEditFaculty({ ...editFaculty, status: e.target.value as any })}
                    className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all">
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="INACTIVE">Inactive (Pending)</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setEditFaculty(null)} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-slate-50">Discard</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase tracking-widest text-xs transition-all active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {facultyToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden border border-slate-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Icons.Trash className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Termination</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                You are about to terminate the contract for <span className="text-slate-900 font-bold">{facultyToDelete.firstName} {facultyToDelete.lastName}</span>. This action will revoke all system access.
              </p>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex space-x-4">
              <button onClick={() => setFacultyToDelete(null)} className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs transition-all hover:bg-white">Abord</button>
              <button onClick={handleDelete} className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-red-500/30 uppercase tracking-widest text-xs active:scale-95 transition-all">Confirm Termination</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyList;
