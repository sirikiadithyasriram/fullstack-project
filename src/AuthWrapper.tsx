import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, LogIn, Sparkles, ShieldCheck, Globe, Star } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-900 font-black animate-pulse uppercase tracking-widest text-[10px]">Initializing UniQuest...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        {/* Left Side: Visual/Hero */}
        <div className="lg:w-1/2 bg-slate-950 relative overflow-hidden flex flex-col justify-center p-12 text-white">
          {/* Enhanced Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1523050853063-88021e0a97d4?auto=format&fit=crop&q=80&w=2000" 
              alt="Campus" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-slate-950"></div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-950/50">
                <GraduationCap className="text-white w-9 h-9" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter">Uni<span className="text-indigo-500">Quest</span></h1>
            </div>
            
            <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] tracking-tighter">
              FIND YOUR <br/> <span className="text-indigo-500">FUTURE CAREER.</span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-md font-medium leading-relaxed">
              Explore top colleges across India with real data, unbiased reviews, and interactive comparison tools.
            </p>

            <div className="flex flex-wrap gap-6 pt-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Verified Data</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-widest">50k+ Colleges</span>
              </div>
            </div>
          </motion.div>
          
          <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <span>© 2026 UniQuest Platform</span>
            <div className="flex gap-4">
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 sm:p-20 bg-slate-50">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-white border border-slate-200 p-8 sm:p-12 rounded-[2rem] shadow-2xl shadow-slate-200/50"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-sm border border-indigo-100">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h3>
              <p className="text-slate-500 font-medium">Please sign in to access the platform</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full h-16 bg-slate-900 text-white flex items-center justify-center gap-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 brightness-200" alt="Google" />
                Sign in with Google
              </button>
              
              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400 italic">Secure Authentication</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 italic text-sm text-slate-600 leading-relaxed text-center">
                "Finding the right college is the first step to your career. Join thousands of other students who have found their dream campus."
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
