import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  Star, 
  Heart, 
  ArrowLeftRight, 
  X, 
  Filter,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { COLLEGES } from './data/colleges';
import { College } from './types';
import { 
  auth, 
  logout, 
  saveBookmark, 
  removeBookmark, 
  getUserBookmarks,
  signInWithGoogle 
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// --- Utils ---
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// --- Components ---

const Navbar = ({ 
  onHome,
  bookmarksCount, 
  compareCount, 
  onShowBookmarks, 
  onShowCompare,
  searchQuery,
  setSearchQuery,
  selectedCourses,
  setSelectedCourses,
  setViewMode,
  viewMode,
  user,
  onLogin,
}: { 
  onHome: () => void;
  bookmarksCount: number; 
  compareCount: number;
  onShowBookmarks: () => void;
  onShowCompare: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCourses: string[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<string[]>>;
  setViewMode: (mode: 'discovery' | 'bookmarks' | 'compare' | 'predictor' | 'exams') => void;
  viewMode: 'discovery' | 'bookmarks' | 'compare' | 'predictor' | 'exams';
  user: User | null;
  onLogin: () => void;
}) => {

  return (
    <div className="flex flex-col w-full">
      {/* Tier 2: Brand Bar */}
      <nav className="bg-white px-6 h-20 flex items-center border-b border-slate-100">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onHome}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              ◈
            </div>
            <div className="text-2xl font-black tracking-tight text-slate-900">
              Uni<span className="text-indigo-600">Quest</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search Colleges, Courses & more..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-full transition-all outline-none text-sm font-medium text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={onShowCompare}
              className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              Compare
              {compareCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </button>
            <button 
              onClick={onShowBookmarks}
              className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              Shortlist
              {bookmarksCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {bookmarksCount}
                </span>
              )}
            </button>
            {!user ? (
              <div className="flex items-center gap-6">
                <button 
                  onClick={onLogin}
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={onLogin}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-xs font-bold text-slate-900">{user.displayName}</span>
                  <button onClick={logout} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600">Sign Out</button>
                </div>
                <img src={user.photoURL || ''} alt="avatar" className="w-10 h-10 rounded-full border-2 border-indigo-100 shadow-sm" />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Tier 3: Streams Nav */}
      <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="max-w-7xl mx-auto flex gap-10 items-center justify-center">
          {['Home', 'Engineering', 'Medical', 'Management', 'Law', 'Exams', 'All Colleges', 'Predictor', 'Compare'].map((item) => {
            const isActive = (item === 'Home' && viewMode === 'discovery' && searchQuery === '' && selectedCourses.length === 0) || 
                            (item === 'Exams' && viewMode === 'exams') ||
                            (item === 'Predictor' && viewMode === 'predictor') ||
                            (item === 'Engineering' && selectedCourses.includes('B.Tech')) ||
                            (item === 'Medical' && selectedCourses.includes('MBBS')) ||
                            (item === 'Management' && selectedCourses.includes('MBA')) ||
                            (item === 'Law' && selectedCourses.includes('L.L.B'));
            
            return (
              <button 
                key={item}
                onClick={() => {
                  if (item === 'Home') {
                    onHome();
                  } else if (item === 'Exams') {
                    setViewMode('exams');
                  } else if (item === 'Predictor') {
                    setViewMode('predictor');
                  } else if (item === 'All Colleges') {
                    setViewMode('discovery');
                    setSelectedCourses([]);
                    setSearchQuery('');
                  } else if (item === 'Engineering') {
                    setViewMode('discovery');
                    setSelectedCourses(['B.Tech']);
                  } else if (item === 'Medical') {
                    setViewMode('discovery');
                    setSelectedCourses(['MBBS']);
                  } else if (item === 'Management') {
                    setViewMode('discovery');
                    setSelectedCourses(['MBA']);
                  } else if (item === 'Law') {
                    setViewMode('discovery');
                    setSelectedCourses(['L.L.B']);
                  } else if (item === 'Compare') {
                    onShowCompare();
                  }
                }}
                className={cn(
                  "relative py-4 text-[13px] font-bold transition-all hover:text-indigo-600",
                  isActive ? "text-indigo-600" : "text-slate-600"
                )}
              >
                {item}
                {isActive && (
                  <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FilterSection = ({ 
  selectedCourses, 
  setSelectedCourses,
  selectedType,
  setSelectedType,
  maxFee,
  setMaxFee 
}: any) => {
  const courses = ['B.Tech', 'MBBS', 'MBA', 'B.Sc', 'B.A.', 'L.L.B'];
  
  return (
    <div className="w-64 flex-shrink-0 space-y-8 sticky top-24 self-start h-[calc(100vh-100px)] overflow-y-auto pr-4 custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
          Filters
        </h3>
        {(selectedCourses.length > 0 || selectedType.length > 0 || maxFee < 2500000) && (
          <button 
            onClick={() => {
              setSelectedCourses([]);
              setSelectedType([]);
              setMaxFee(2500000);
            }}
            className="text-[10px] font-bold text-indigo-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>
        
      <div className="space-y-8 bg-white p-5 border border-slate-200 rounded-xl">
        <section>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Degree Type</h4>
          <div className="space-y-2">
            {courses.map(course => (
              <label key={course} className="flex items-center gap-3 group cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedCourses.includes(course)}
                  onChange={() => {
                    setSelectedCourses((prev: string[]) => 
                      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
                    );
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                  {course}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Institute Type</h4>
          <div className="space-y-2">
            {['Public', 'Private'].map(type => (
              <label key={type} className="flex items-center gap-3 group cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedType.includes(type)}
                  onChange={() => {
                    setSelectedType((prev: string[]) => 
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    );
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Total Fees</h4>
            <span className="text-[10px] font-bold text-indigo-600">
              ₹{(maxFee / 100000).toFixed(1)}L
            </span>
          </div>
          <input 
            type="range"
            min="0"
            max="2500000"
            step="50000"
            value={maxFee}
            onChange={(e) => setMaxFee(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-2">
            <span>Range: ₹0 - ₹25L+</span>
          </div>
        </section>
      </div>
    </div>
  );
};

const CollegeCard = ({ 
  college, 
  onSelect, 
  isBookmarked, 
  onToggleBookmark,
  isInCompare,
  onToggleCompare 
}: { 
  college: College; 
  onSelect: (c: College) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isInCompare: boolean;
  onToggleCompare: (id: string) => void;
  key?: string | number;
}) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.98 }}
    className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row p-4 gap-6 relative"
  >
    <div className="w-full sm:w-44 h-44 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative">
      <img 
        src={college.image} 
        alt={college.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-black text-slate-900 flex items-center gap-1 shadow-sm">
        <Star className="w-3 h-3 text-yellow-500 fill-current" /> {college.rating}
      </div>
    </div>

    <div className="flex-1 flex flex-col min-w-0">
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase tracking-wider">
            NIRF {college.rankings.nirfCategory || 'Overall'}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Rating {college.rating}</span>
        </div>
        <h3 className="font-bold text-slate-900 leading-tight text-lg mb-1 group-hover:text-indigo-600 transition-colors italic uppercase tracking-tight">
          {college.name}
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
          <MapPin className="w-3 h-3" /> {college.location}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 mb-4">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Top Courses</span>
          <div className="flex flex-wrap gap-1">
            {college.courses.slice(0, 3).map(course => (
              <span key={course} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded">
                {course}
              </span>
            ))}
            {college.courses.length > 3 && <span className="text-[9px] text-slate-400">+{college.courses.length - 3}</span>}
          </div>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">NIRF Rank</span>
          <span className="text-sm font-black text-slate-900 italic">#{college.rankings.nirf || '--'} <span className="text-[10px] text-slate-500 not-italic">in {college.rankings.nirfCategory || 'Overall'}</span></span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Avg Fees</span>
            <span className="text-[11px] font-black text-slate-900">₹{(college.fees.average / 100000).toFixed(1)} L/Yr</span>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Est. Year</span>
            <span className="text-[11px] font-black text-slate-900">{college.estYear}</span>
          </div>
        </div>
        <button 
          onClick={() => onSelect(college)}
          className="px-5 py-2 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-black active:scale-95 shadow-md shadow-indigo-100"
        >
          View Details
        </button>
      </div>
    </div>

    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleBookmark(college.id); }}
        className={cn(
          "w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-all",
          isBookmarked ? "bg-red-50 text-red-500 border-red-200" : "bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300"
        )}
      >
        <Heart className={cn("w-4 h-4", isBookmarked && "fill-current")} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleCompare(college.id); }}
        className={cn(
          "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
          isInCompare ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:border-slate-300"
        )}
      >
        <ArrowLeftRight className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

const DetailView = ({ college, onClose }: { college: College, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto"
  >
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4 rotate-180" /> Back to Search
        </button>
        <div className="flex gap-4">
          <button className="p-2 bg-white border border-slate-200 rounded-md hover:border-indigo-600 transition-colors">
            <Heart className="w-5 h-5 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-md hover:bg-indigo-700 shadow-md">
            Apply Now
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Main Info */}
          <div className="lg:col-span-8 p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="flex items-start gap-6 mb-8">
              <img src={college.logo} alt="logo" className="w-20 h-20 object-contain bg-slate-50 border border-slate-100 rounded-xl p-2" referrerPolicy="no-referrer" />
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                  {college.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {college.location}</span>
                  <span className="flex items-center gap-1 text-yellow-600"><Star className="w-4 h-4 fill-current" /> {college.rating} Rating</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded">Established {college.estYear}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About the Institution</h2>
              <p className="text-slate-600 leading-relaxed text-base">
                {college.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">NIRF Rank</p>
                <p className="text-xl font-black text-blue-600">#{college.rankings.nirf || '--'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Rank</p>
                <p className="text-xl font-black text-slate-900">#{college.rankings.global || '--'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Fee/Yr</p>
                <p className="text-xl font-black text-slate-900">₹{(college.fees.average / 100000).toFixed(1)} L</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                <p className="text-xl font-black text-slate-900">{college.type}</p>
              </div>
            </div>
          </div>

          {/* Contact & Misc */}
          <div className="lg:col-span-4 p-8 sm:p-12 bg-slate-50/50">
            <div className="space-y-10">
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Course Offerings</h3>
                <div className="flex flex-wrap gap-2">
                  {college.courses.map(course => (
                    <span key={course} className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded shadow-sm">
                      {course}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {college.facilities.map(facility => (
                    <span key={facility} className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded shadow-sm">
                      {facility}
                    </span>
                  ))}
                </div>
              </section>

              <section className="pt-10 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Contact Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-600 transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{college.contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-600 transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-xs font-bold text-slate-700">{college.contact.phone}</p>
                    </div>
                  </div>
                  <a href={college.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-600 transition-all">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Official Website</p>
                      <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600">Visit Site <ExternalLink className="w-3 h-3 inline ml-1" /></p>
                    </div>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const CompareView = ({ colleges, onClose, onRemove }: { colleges: College[], onClose: () => void, onRemove: (id: string) => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
  >
    <div className="bg-white w-full max-w-7xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Compare Schools</h2>
          <p className="text-slate-500 text-sm font-medium">Detailed comparison table for your selections.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-slate-50/30">
        {colleges.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <ArrowLeftRight className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No schools selected for comparison.</p>
          </div>
        ) : (
          <table className="w-full min-w-[800px] border-collapse bg-white rounded-xl shadow-sm border border-slate-200">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-6 px-6 text-left w-64 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50">Details</th>
                {colleges.map(c => (
                  <th key={c.id} className="py-6 px-6 text-left min-w-[200px]">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <img src={c.logo} className="w-10 h-10 rounded-lg bg-white border border-slate-100 p-1 object-contain" referrerPolicy="no-referrer" />
                        <p className="font-bold text-slate-900 leading-tight line-clamp-2 text-sm">{c.name}</p>
                      </div>
                      <button onClick={() => onRemove(c.id)} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded self-start transition-colors">Remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { 
                  label: 'NIRF Rank', 
                  val: (c: College) => {
                    const allRanks = colleges.map(col => col.rankings.nirf).filter(Boolean) as number[];
                    const isBest = c.rankings.nirf === Math.min(...allRanks);
                    return <div className={cn("font-black", isBest ? "text-green-600 bg-green-50 px-2 py-1 rounded" : "text-indigo-600")}>#{c.rankings.nirf || '--'} {isBest && '🏆'}</div>;
                  }
                },
                { 
                  label: 'Rating', 
                  val: (c: College) => {
                    const allRatings = colleges.map(col => col.rating);
                    const isBest = c.rating === Math.max(...allRatings);
                    return <div className={cn("flex items-center gap-1 font-bold", isBest ? "text-green-600 bg-green-50 px-2 py-1 rounded" : "text-yellow-600")}><Star className="w-4 h-4 fill-current" /> {c.rating}</div>;
                  }
                },
                { 
                  label: 'Annual Fees', 
                  val: (c: College) => {
                    const allFees = colleges.map(col => col.fees.average);
                    const isBest = c.fees.average === Math.min(...allFees);
                    return <div className={cn("font-bold", isBest ? "text-green-600 bg-green-50 px-2 py-1 rounded" : "text-slate-900")}>₹{(c.fees.average / 100000).toFixed(1)} L</div>;
                  }
                },
                { label: 'Institution Type', val: (c: College) => <div className="font-bold text-slate-700 text-xs">{c.type}</div> },
                { label: 'Est. Year', val: (c: College) => <div className="text-sm font-bold text-slate-900">{c.estYear}</div> },
                { label: 'State', val: (c: College) => <div className="text-sm text-slate-600">{c.state}</div> },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/30">{row.label}</td>
                  {colleges.map(c => (
                    <td key={c.id} className="py-5 px-6">{row.val(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [maxFee, setMaxFee] = useState(2500000);
  
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [viewMode, setViewMode] = useState<'discovery' | 'bookmarks' | 'compare' | 'predictor' | 'exams'>('discovery');
  const [userRank, setUserRank] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error: any) {
      setAuthError(error.message || 'Failed to login. Please check your browser settings and try again.');
      console.error('Login Error:', error);
    }
  };

  // Sync Bookmarks with Firestore
  useEffect(() => {
    if (user) {
      getUserBookmarks(user.uid).then(ids => setBookmarks(ids));
    } else {
      setBookmarks([]);
    }
  }, [user]);

  // Filter Logic
  const filteredColleges = useMemo(() => {
    let list = COLLEGES;
    
    if (viewMode === 'bookmarks') {
      list = list.filter(c => bookmarks.includes(c.id));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.city.toLowerCase().includes(q) ||
        c.courses.some(course => course.toLowerCase().includes(q))
      );
    }

    if (selectedCourses.length > 0) {
      list = list.filter(c => c.courses.some(course => selectedCourses.includes(course)));
    }

    if (selectedType.length > 0) {
      list = list.filter(c => selectedType.includes(c.type));
    }

    list = list.filter(c => c.fees.average <= maxFee);

    return list;
  }, [searchQuery, selectedCourses, selectedType, maxFee, viewMode, bookmarks]);

  const handleHome = () => {
    setViewMode('discovery');
    setSearchQuery('');
    setSelectedCourses([]);
    setSelectedType([]);
    setMaxFee(2500000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBookmark = async (id: string) => {
    if (!user) {
      await handleLogin();
      return;
    }

    const isBookmarked = bookmarks.includes(id);
    
    // Update Local State
    setBookmarks(prev => isBookmarked ? prev.filter(i => i !== id) : [...prev, id]);

    // Sync with Firestore
    try {
      if (isBookmarked) {
        await removeBookmark(user.uid, id);
      } else {
        await saveBookmark(user.uid, id);
      }
    } catch (error) {
      // Revert local state on error
      setBookmarks(prev => isBookmarked ? [...prev, id] : prev.filter(i => i !== id));
      console.error('Failed to sync bookmark:', error);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar 
        onHome={handleHome}
        bookmarksCount={bookmarks.length}
        compareCount={compareList.length}
        onShowBookmarks={() => setViewMode('bookmarks')}
        onShowCompare={() => setViewMode('compare')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        setViewMode={setViewMode}
        viewMode={viewMode}
        user={user}
        onLogin={handleLogin}
      />
      
      <AnimatePresence>
        {authError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 font-bold text-sm"
          >
            <ShieldCheck className="w-5 h-5 text-red-400" />
            {authError}
            <button onClick={() => setAuthError(null)} className="ml-4 hover:text-red-800"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Discovery Hero Section */}
        {viewMode === 'discovery' && !searchQuery && selectedCourses.length === 0 && (
          <header className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[550px] mb-20 overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000" 
                alt="Campus Background" 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col items-center justify-center px-6 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl sm:text-8xl font-black tracking-tight text-white mb-6 uppercase"
              >
                Find Your <br/> <span className="text-indigo-400">Future Career</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-2xl text-slate-300 max-w-2xl font-medium mb-12"
              >
                Explore top colleges across India with real data.
              </motion.p>

              {/* Hero Search Box */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2"
              >
                <div className="flex items-center gap-2 bg-white rounded-xl flex-1 px-4 py-2">
                  <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">Colleges</span>
                    <ChevronRight className="w-4 h-4 rotate-90 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search colleges..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 font-bold placeholder:text-slate-400"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-lg font-black uppercase text-sm tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                    Search
                  </button>
                </div>
              </motion.div>
            </div>
          </header>
        )}

        {/* Discovery Grid: Career Streams */}
        {viewMode === 'discovery' && !searchQuery && selectedCourses.length === 0 && (
          <section className="mb-20">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 mb-3">Explore by Career Streams</h2>
              <p className="text-slate-500 font-medium">Choose your path and find the best institutions specialized in your field.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[
                { name: 'Engineering', icon: <GraduationCap />, count: '2,400+ Colleges', color: 'indigo', stream: 'B.Tech' },
                { name: 'Management', icon: <Globe />, count: '1,800+ Colleges', color: 'slate', stream: 'MBA' },
                { name: 'Medical', icon: <Star />, count: '1,200+ Colleges', color: 'indigo', stream: 'MBBS' },
                { name: 'Law', icon: <ShieldCheck />, count: '850+ Colleges', color: 'slate', stream: 'L.L.B' },
                { name: 'Science', icon: <Sparkles />, count: '3,100+ Colleges', color: 'indigo', stream: 'B.Sc' },
              ].map((stream) => (
                <motion.div 
                  key={stream.name}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedCourses([stream.stream])}
                  className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-center text-center group cursor-pointer hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                    stream.color === 'indigo' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                  )}>
                    {React.cloneElement(stream.icon as React.ReactElement, { className: "w-7 h-7" })}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600">{stream.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stream.count}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Predictor View */}
        {viewMode === 'predictor' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto">
              <div className="bg-indigo-600 rounded-3xl p-12 text-white mb-12 shadow-2xl shadow-indigo-200">
                <h2 className="text-4xl font-black mb-4 uppercase tracking-tight italic">College Predictor</h2>
                <p className="text-indigo-100 font-medium text-lg mb-8">Enter your entrance exam rank to see where you could land.</p>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex items-center">
                    <input 
                      type="number" 
                      placeholder="Enter your Rank (e.g. 1500)" 
                      className="flex-1 bg-transparent border-none focus:outline-none px-4 text-white font-bold placeholder:text-indigo-300"
                      value={userRank}
                      onChange={(e) => setUserRank(e.target.value)}
                    />
                    <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
                      Predict Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userRank ? (
                  COLLEGES.filter(c => {
                    const r = parseInt(userRank);
                    if (!c.rankings.nirf) return false;
                    if (r < 1000) return c.rankings.nirf <= 15;
                    if (r < 5000) return c.rankings.nirf <= 40;
                    return c.rankings.nirf > 20;
                  }).map(college => (
                    <div key={college.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-6 group hover:border-indigo-600 transition-all hover:shadow-xl">
                      <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
                        <img src={college.image} alt={college.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">NIRF #{college.rankings.nirf}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{college.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{college.city}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Enter your rank to start the prediction</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Exams View */}
        {viewMode === 'exams' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase italic">Top Entrance Exams</h2>
                {[
                  { id: 'mains', name: 'JEE Mains', target: 'NITs, IIITs, GFTIs', desc: 'Gateway to top government engineering colleges' },
                  { id: 'neet', name: 'NEET UG', target: 'Medical Colleges', desc: 'Sole entrance for MBBS/BDS programs across India' },
                  { id: 'cat', name: 'CAT', target: 'IIMs, Top B-Schools', desc: 'Entrance for premium management education' },
                  { id: 'clat', name: 'CLAT', target: 'National Law Universities', desc: 'The major law entrance exam for NLUs' },
                ].map(exam => (
                  <button 
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    className={cn(
                      "w-full text-left p-6 rounded-2xl border-2 transition-all group",
                      selectedExam === exam.id ? "border-indigo-600 bg-indigo-50" : "border-slate-100 bg-white hover:border-indigo-200"
                    )}
                  >
                    <h3 className="font-black text-slate-900 mb-1 uppercase italic tracking-tight group-hover:text-indigo-600">{exam.name}</h3>
                    <p className="text-xs text-indigo-600 font-bold mb-2">Target: {exam.target}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{exam.desc}</p>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedExam ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <GraduationCap className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Colleges accepting this exam</h2>
                        <p className="text-slate-500 font-medium">Mapped institutions based on historical trends</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {COLLEGES.filter(c => {
                        // Dummy filter logic: Engineering for JEE, Medical for NEET, etc.
                        if (selectedExam === 'mains') return c.courses.includes('B.Tech');
                        if (selectedExam === 'neet') return c.courses.includes('MBBS');
                        if (selectedExam === 'cat') return c.courses.includes('MBA');
                        if (selectedExam === 'clat') return c.courses.includes('L.L.B');
                        return false;
                      }).map(college => (
                        <div key={college.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl group border border-transparent hover:border-indigo-200 hover:bg-white transition-all cursor-pointer">
                          <img src={college.image} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase italic truncate max-w-[200px]">{college.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{college.city}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                      <ArrowLeftRight className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Select an entrance exam</h3>
                    <p className="text-slate-500 font-medium max-w-sm">Pick an exam from the list to see mapping colleges and eligibility criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="flex gap-12 relative">
          {/* Filters Sidebar */}
          {viewMode === 'discovery' && (
            <FilterSection 
              selectedCourses={selectedCourses}
              setSelectedCourses={setSelectedCourses}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              maxFee={maxFee}
              setMaxFee={setMaxFee}
            />
          )}

          {/* Listings */}
          {(viewMode === 'discovery' || viewMode === 'bookmarks') && (
            <div className="flex-1 space-y-6">
              <div className="text-[10px] font-bold text-slate-500 mb-4 tracking-widest uppercase flex items-center gap-2">
                <span 
                  className="hover:text-indigo-600 cursor-pointer transition-colors"
                  onClick={handleHome}
                >
                  Home
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-900 font-black">
                  {viewMode === 'bookmarks' ? 'Shortlisted' : 
                   selectedCourses.length > 0 ? selectedCourses.join(', ') : 
                   searchQuery ? `Search: ${searchQuery}` : 'All Colleges'}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-400">Top Institutions in India</span>
              </div>

              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 flex items-baseline gap-2">
                  {viewMode === 'bookmarks' ? 'Your Shortlist' : 
                   selectedCourses.includes('B.Tech') ? 'Top Engineering Colleges' :
                   selectedCourses.includes('MBBS') ? 'Top Medical Colleges' :
                   selectedCourses.includes('MBA') ? 'Top Management Colleges' :
                   selectedCourses.includes('L.L.B') ? 'Top Law Colleges' : 'Top Colleges in India'}
                  <span className="text-sm font-normal text-slate-500">({filteredColleges.length} Found)</span>
                </h2>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-500">Sort by: <b className="text-slate-900 cursor-pointer">NIRF Ranking ▾</b></span>
                {viewMode !== 'discovery' && (
                  <button 
                    onClick={() => setViewMode('discovery')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Back to Discovery
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredColleges.map((college) => (
                  <CollegeCard 
                    key={college.id} 
                    college={college} 
                    onSelect={setSelectedCollege}
                    isBookmarked={bookmarks.includes(college.id)}
                    onToggleBookmark={toggleBookmark}
                    isInCompare={compareList.includes(college.id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredColleges.length === 0 && (
              <div className="py-32 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No schools found</h3>
                <p className="text-slate-500 text-sm font-medium">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {selectedCollege && (
          <DetailView 
            college={selectedCollege} 
            onClose={() => setSelectedCollege(null)} 
          />
        )}
        {viewMode === 'compare' && (
          <CompareView 
            colleges={COLLEGES.filter(c => compareList.includes(c.id))}
            onClose={() => setViewMode('discovery')}
            onRemove={toggleCompare}
          />
        )}
      </AnimatePresence>

      {/* Compare Bar (Overlay) */}
      <AnimatePresence>
        {compareList.length > 0 && viewMode !== 'compare' && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 text-white z-50 flex items-center px-8 justify-between shadow-2xl"
          >
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Comparison Tray</span>
                <span className="text-[10px] text-slate-400">Select up to 4 colleges to compare</span>
              </div>
              <div className="flex gap-2">
                {compareList.map(id => {
                  const college = COLLEGES.find(c => c.id === id);
                  return (
                    <div key={id} className="w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold overflow-hidden" title={college?.name}>
                      {college?.logo ? <img src={college.logo} className="w-full h-full object-contain p-1" /> : id}
                    </div>
                  );
                })}
                {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, i) => (
                  <div key={i} className="w-9 h-9 rounded border border-slate-700/50 border-dashed flex items-center justify-center text-slate-600 text-sm">
                    +
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setCompareList([])}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={() => setViewMode('compare')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold transition-colors"
              >
                Compare Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-slate-200 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-xl">◈</div>
              <span className="text-xl font-black tracking-tight text-slate-900 italic">UniQuest</span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Empowering the next generation of students with real data and unbiased insights. Your journey starts here.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900 mb-6">Explore</h4>
            <div className="space-y-3">
              {['Top Colleges', 'Compare Schools', 'Shortlist', 'Admissions'].map(item => (
                <p key={item} className="text-sm font-medium text-slate-600 hover:text-blue-600 cursor-pointer transition-colors">{item}</p>
              ))}
            </div>
          </div>
           <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900 mb-6">Locations</h4>
            <div className="space-y-3">
              {['Delhi NCR', 'Mumbai', 'Bangalore', 'Pune', 'Chennai'].map(city => (
                <p key={city} className="text-sm font-medium text-slate-600 hover:text-blue-600 cursor-pointer transition-colors">{city}</p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900 mb-6">Support</h4>
            <div className="space-y-3">
               {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(item => (
                <p key={item} className="text-sm font-medium text-slate-600 hover:text-blue-600 cursor-pointer transition-colors">{item}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 UniQuest Platform. All rights reserved.</p>
          <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-slate-900 cursor-pointer">Security</span>
            <span className="hover:text-slate-900 cursor-pointer">Compliance</span>
            <span className="hover:text-slate-900 cursor-pointer">Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
