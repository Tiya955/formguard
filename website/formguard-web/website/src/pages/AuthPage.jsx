import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthPage({ onLogin, setActiveTab }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const userObj = {
      name: name || (isSignUp ? 'New Athlete' : 'Hemakshi Chauhan'),
      email: email || 'athlete@formguard.io',
      age: 21,
      gender: 'Female',
      height: 168,
      weight: 62,
      fitnessLevel: 'Beginner',
      conditions: isSignUp ? [] : ['knee_acl'],
      notes: isSignUp ? 'New profile initialized.' : 'Monitoring right knee valgus.',
    };
    onLogin(userObj);
    // Directly go to medical onboarding page as requested!
    setActiveTab('profile');
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Hemakshi Chauhan',
      email: 'hemakshi@formguard.io',
      age: 21,
      gender: 'Female',
      height: 168,
      weight: 62,
      fitnessLevel: 'Intermediate',
      conditions: ['knee_acl'],
      notes: 'Right knee ACL recovery; strictly monitoring knee valgus angle.',
    };
    onLogin(demoUser);
    setActiveTab('profile');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand Icon */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isSignUp ? 'Join FormGuard' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp
              ? 'Create an account to personalize joint safety tolerances'
              : 'Sign in to access your calibrated baseline and workout history'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`py-2 rounded-lg transition cursor-pointer ${
              !isSignUp ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`py-2 rounded-lg transition cursor-pointer ${
              isSignUp ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hemakshi Chauhan"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@formguard.io"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
          >
            <span>{isSignUp ? 'Create Profile & Enter Health Info' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Quick Demo Login (Pre-configured Athlete)
          </button>
        </div>

      </div>
    </div>
  );
}
