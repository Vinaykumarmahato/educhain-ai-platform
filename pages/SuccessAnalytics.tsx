
import React, { useState, useEffect, useMemo } from 'react';
import { Student, User, UserRole } from '../types';
import { mockApi, BRANCHES } from '../services/mockApi';
import { Icons } from '../constants';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SuccessAnalyticsProps {
  user: User;
}

const SuccessAnalytics: React.FC<SuccessAnalyticsProps> = ({ user }) => {
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const isTeacher = user.role === UserRole.TEACHER;
  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    fetchRiskData();
  }, [user]);

  const fetchRiskData = async () => {
    setLoading(true);
    const data = await mockApi.getAtRiskStudents(user);
    setAtRiskStudents(data);
    if (data.length > 0) {
      setSelectedStudent(data[0]);
    }
    setLoading(false);
  };

  const riskDistributionData = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    atRiskStudents.forEach(s => {
      if (s.riskLevel) counts[s.riskLevel]++;
    });
    return [
      { name: 'Critical Risk', value: counts.HIGH, color: '#ef4444' },
      { name: 'Monitor Status', value: counts.MEDIUM, color: '#f59e0b' },
      { name: 'Low Priority', value: counts.LOW, color: '#10b981' }
    ].filter(d => d.value > 0);
  }, [atRiskStudents]);

  const branchRiskData = useMemo(() => {
    return BRANCHES.map(b => ({
      name: b,
      count: atRiskStudents.filter(s => s.major === b).length
    })).sort((a, b) => b.count - a.count);
  }, [atRiskStudents]);

  const generateIntervention = async (student: Student) => {
    setGenerating(true);
    setAiAnalysis('');
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error('Missing API Key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Act as an Educational Success Strategist. Analyze this student record and provide a high-impact intervention plan:
      - Name: ${student.firstName} ${student.lastName}
      - Current GPA: ${student.gpa}
      - Success Score: ${student.successScore}/100
      - Department: ${student.major}
      - Semester: ${student.semester}
      - Risk Category: ${student.riskLevel}

      Provide your analysis in 3 sections:
      1. CRITICAL DIAGNOSIS (What is the primary blocker?)
      2. 30-DAY RECOVERY ROADMAP (Specific academic steps)
      3. FACULTY RECOMMENDATION (How should the professor approach this student?)
      
      Maintain a professional, data-centric, and empathetic tone.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiAnalysis(response.text() || 'Analysis pipeline returned empty results.');
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      setAiAnalysis(`AI Error: ${err.message || 'Service unavailable'}. Check console for details.`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning student success vectors...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header & Global Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Success Command Center</h2>
          <p className="text-slate-500 font-medium text-sm">
            {isTeacher ? `Oversight for ${user.department} academic health.` : 'Global institutional retention and performance analytics.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-6 py-4 rounded-[24px] border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <Icons.TrendingUp className="rotate-180" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Alerted Students</p>
              <p className="text-xl font-black text-slate-900">{atRiskStudents.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 px-6 py-4 rounded-[24px] shadow-xl flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Icons.Dashboard />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Status</p>
              <p className="text-xl font-black text-white">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Column: List & Distribution */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Queue</h3>
              <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">High Priority</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-50">
              {atRiskStudents.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Priority Alerts</p>
                </div>
              ) : atRiskStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => { setSelectedStudent(student); setAiAnalysis(''); }}
                  className={`w-full text-left p-5 transition-all group hover:bg-slate-50 relative ${selectedStudent?.id === student.id ? 'bg-blue-50/30' : ''}`}
                >
                  {selectedStudent?.id === student.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{student.studentId}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${student.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {student.riskLevel}
                    </span>
                  </div>
                  <p className={`text-sm font-black transition-colors ${selectedStudent?.id === student.id ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`}>
                    {student.firstName} {student.lastName}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-bold text-slate-400">{student.major}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">{student.successScore}% Score</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Global Risk Distribution</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {riskDistributionData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="xl:col-span-3 space-y-8">
          {selectedStudent ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
              {/* Student Insight Glass Panel */}
              <div className="bg-white border border-slate-200 rounded-[40px] shadow-xl overflow-hidden">
                <div className="p-10 flex flex-col md:flex-row gap-10">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <img
                        src={`https://ui-avatars.com/api/?name=${selectedStudent.firstName}+${selectedStudent.lastName}&background=f1f5f9&color=64748b&size=128`}
                        alt="profile"
                        className="w-32 h-32 rounded-[40px] object-cover ring-4 ring-slate-50 shadow-2xl"
                      />
                      <div className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${selectedStudent.riskLevel === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                        {selectedStudent.riskLevel} Risk
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-2xl font-black text-slate-900 leading-none mb-2">{selectedStudent.firstName} {selectedStudent.lastName}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{selectedStudent.studentId}</p>
                      <button className="flex items-center text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">
                        <Icons.Eye className="w-4 h-4 mr-2" /> View Full Dossier
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Momentum</p>
                        <div className="flex items-end space-x-2">
                          <span className="text-5xl font-black text-slate-900 leading-none">{selectedStudent.gpa}</span>
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">CGPA Index</span>
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Probability</span>
                          <span className="text-xs font-black text-slate-900">{selectedStudent.successScore}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${selectedStudent.successScore! < 50 ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${selectedStudent.successScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Semester</p>
                          <p className="text-lg font-black text-slate-900">{selectedStudent.semester}</p>
                        </div>
                        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p>
                          <p className="text-lg font-black text-slate-900">12/18</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div> Strength: Critical Reasoning
                        </div>
                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div> Blocker: Low Attendance (62%)
                        </div>
                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div> Potential: Fast Learner
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-10 py-8 bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                      <h5 className="text-white font-black text-lg leading-none mb-1">Strategic AI Intervention</h5>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Generate recovery roadmap with Gemini 3</p>
                    </div>
                  </div>
                  <button
                    onClick={() => generateIntervention(selectedStudent)}
                    disabled={generating}
                    className="w-full md:w-auto px-10 py-4 bg-white text-slate-900 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                  >
                    {generating ? 'Engine Initializing...' : 'Synthesize Recovery Plan'}
                  </button>
                </div>
              </div>

              {/* AI Insight Results */}
              {aiAnalysis && (
                <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div> Output: Recovery Roadmap v1.0
                    </h4>
                    <button className="text-slate-300 hover:text-blue-600 transition-colors">
                      <Icons.LogOut className="rotate-90 w-5 h-5" />
                    </button>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                  <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Generated via Gemini-1.5-Flash Institutional Node</p>
                    <div className="flex space-x-3">
                      <button className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white transition-all">Export Plan</button>
                      <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Send to Student</button>
                    </div>
                  </div>
                </div>
              )}

              {generating && (
                <div className="bg-white border border-slate-200 rounded-[40px] p-20 flex flex-col items-center justify-center space-y-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Neural weights aligning... Constructing 30-day intervention trajectory.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] h-[600px] flex flex-col items-center justify-center text-center p-20">
              <Icons.Users className="w-16 h-16 text-slate-200 mb-6" />
              <h4 className="text-2xl font-black text-slate-300">Queue Selection Required</h4>
              <p className="text-slate-400 font-medium max-w-xs mt-2">Select a flagged record from the left-hand monitoring queue to initialize diagnostic analysis.</p>
            </div>
          )}

          {/* Institutional Risk Distribution */}
          {!aiAnalysis && !generating && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Cross-Branch Concentration</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchRiskData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-center">
                <div className="text-center">
                  <div className="inline-block p-4 bg-emerald-50 text-emerald-600 rounded-3xl mb-4">
                    <Icons.CalendarCheck className="w-10 h-10" />
                  </div>
                  <h5 className="text-xl font-black text-slate-900">Preventative Measure</h5>
                  <p className="text-slate-500 text-sm font-medium mt-2 mb-6">Early intervention has shown to improve retention by 24% in the previous academic cycle.</p>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Schedule Global Success Workshop</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessAnalytics;
