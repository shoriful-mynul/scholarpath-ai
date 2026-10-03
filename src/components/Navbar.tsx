import React from 'react';
import { useApp, NavTab } from '../context/AppContext';
import { Sparkles, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, currentAnalysis } = useApp();

  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Student Profile' },
    { id: 'analyze', label: 'Analyze Opportunity' },
    { id: 'results', label: currentAnalysis ? 'Analysis Results' : 'Results' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-left group flex items-center gap-2.5 focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs group-hover:bg-indigo-600 transition-colors">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            ScholarPath AI
          </span>
        </button>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`transition-colors relative py-1 ${
                  isActive
                    ? 'text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('analyze')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Analyze Opportunity</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-2 bg-slate-50 text-xs font-medium text-slate-600">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1.5 rounded-md transition-colors ${
              activeTab === item.id ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
