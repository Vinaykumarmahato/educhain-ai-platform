
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { mockApi, BRANCHES, DESIGNATIONS } from '../services/mockApi';
import { Icons } from '../constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'thankyou'>('login');
  const [username, setUsername] = useState('vinay');
  const [password, setPassword] = useState('ADVindiancoder@860964');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Fields
  const [regData, setRegData] = useState({
    role: UserRole.STUDENT,
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    branch: BRANCHES[0],
    designation: DESIGNATIONS[0]
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await mockApi.login(username, password);
      onLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await mockApi.register(regData);
      setMode('thankyou');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional ID / Email</label>
        <input
          type="text"
          className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-black text-slate-900"
          placeholder="e.g. EDU-2023-1000"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Password</label>
          <a href="#" className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">Reset</a>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full px-5 py-4 pr-14 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-black text-slate-900"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors p-1"
          >
            {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center group"
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <>
            Access Personal Workspace
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </>
        )}
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-500">
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-2">
        <button
          type="button"
          onClick={() => setRegData({ ...regData, role: UserRole.STUDENT })}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regData.role === UserRole.STUDENT ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRegData({ ...regData, role: UserRole.TEACHER })}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regData.role === UserRole.TEACHER ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}
        >
          Faculty
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none transition-all text-xs font-bold"
            placeholder="John"
            value={regData.firstName}
            onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none transition-all text-xs font-bold"
            placeholder="Doe"
            value={regData.lastName}
            onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
        <input
          type="email"
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none transition-all text-xs font-bold"
          placeholder="j.doe@institution.edu"
          value={regData.email}
          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp Number</label>
        <input
          type="tel"
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none transition-all text-xs font-bold"
          placeholder="+91-XXXXXXXXXX"
          value={regData.mobileNumber}
          onChange={(e) => setRegData({ ...regData, mobileNumber: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
          <select
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none transition-all text-xs font-bold"
            value={regData.branch}
            onChange={(e) => setRegData({ ...regData, branch: e.target.value })}
          >
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {regData.role === UserRole.TEACHER && (
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Position</label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none transition-all text-xs font-bold"
              value={regData.designation}
              onChange={(e) => setRegData({ ...regData, designation: e.target.value })}
            >
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center mt-4"
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : 'Submit Registration Request'}
      </button>
    </form>
  );

  const renderThankYouScreen = () => (
    <div className="py-12 px-6 text-center animate-in zoom-in fade-in duration-700">
      <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[32px] mx-auto flex items-center justify-center mb-8 border border-emerald-100 shadow-2xl shadow-emerald-500/10">
        <Icons.CalendarCheck className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-4">Registration Received!</h2>
      <div className="space-y-6 text-slate-500 text-sm font-medium leading-relaxed">
        <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100 text-emerald-900 font-bold shadow-inner">
          "Thank you for registering. You will get your ID and password soon on your given WhatsApp number. Thank you."
        </div>
        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
          Institutional Verification in progress...
        </p>
      </div>
      <button
        onClick={() => setMode('login')}
        className="mt-12 w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
      >
        Return to Portal
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-800">
          <div className="p-10 pb-0 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[28px] mx-auto flex items-center justify-center text-white font-black text-4xl mb-6 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">EC</div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">EduChain</h1>
            <p className="text-slate-500 mt-2 font-medium text-sm">Enterprise Identity Service</p>
          </div>

          {mode !== 'thankyou' && (
            <div className="px-10 mt-8">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Join Now
                </button>
              </div>
            </div>
          )}

          <div className="p-10 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center animate-in shake duration-300">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {mode === 'login' ? renderLoginForm() : mode === 'register' ? renderRegisterForm() : renderThankYouScreen()}
          </div>

          <div className="px-10 pb-10">
            <p className="text-[9px] text-slate-400 font-medium text-center mt-6 uppercase tracking-widest opacity-60">
              Identity Governance by Vinay Kumar Mahato
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
