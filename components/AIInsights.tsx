
import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DashboardStats, UserRole } from '../types';

interface AIInsightsProps {
  stats: DashboardStats;
  userRole: UserRole;
}

const AIInsights: React.FC<AIInsightsProps> = ({ stats, userRole }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error('Missing API Key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      let roleContext = "";

      if (userRole === UserRole.ADMIN) {
        roleContext = "institutional administrator focusing on high-level growth and operational efficiency";
      } else if (userRole === UserRole.TEACHER) {
        roleContext = "faculty member focusing on classroom engagement, student retention, and academic success";
      } else {
        roleContext = "student seeking academic improvement and career readiness";
      }

      const prompt = `As an educational AI consultant for a(n) ${roleContext}, analyze these metrics and provide 3 tailored, actionable recommendations:
      - Total Students: ${stats.totalStudents}
      - Total Courses: ${stats.totalCourses}
      - Active Faculty: ${stats.activeTeachers}
      - Average GPA: ${stats.averageGpa}
      ${userRole === UserRole.STUDENT ? `- Personal GPA: ${stats.studentStats?.personalGpa}` : ""}
      ${userRole === UserRole.TEACHER ? `- Teacher Load: ${stats.teacherStats?.assignedCourses} courses` : ""}
      
      Maintain a highly professional, encouraging, and data-driven tone. Format in Markdown with bullet points.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setInsight(response.text() || 'Unable to generate insights at this time.');
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      setInsight(`AI Error: ${err.message || 'Service unavailable'}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" /></svg>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Enterprise AI Insights</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tailored for {userRole}</p>
            </div>
          </div>
          {!insight && (
            <button
              onClick={generateInsight}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Synthesizing...' : 'Analyze My Performance'}
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center space-x-4 text-slate-400 bg-slate-800/30 p-4 rounded-2xl">
            <div className="flex space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Processing institutional vectors...</span>
          </div>
        )}

        {insight && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800/40 rounded-3xl p-6 text-slate-200 border border-slate-700/50 whitespace-pre-wrap leading-relaxed text-sm font-medium">
              {insight}
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setInsight('')}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-black uppercase tracking-widest transition-colors"
              >
                Refresh Analysis
              </button>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Gemini 3 Flash • Verified Decision Support</span>
            </div>
          </div>
        )}

        {!insight && !loading && (
          <p className="text-sm text-slate-400 font-medium">
            Leverage EduChain's advanced neural processing to gain strategic visibility into your specific institutional domain.
          </p>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
