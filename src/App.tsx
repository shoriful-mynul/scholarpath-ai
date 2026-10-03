import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { AnalyzeView } from './components/AnalyzeView';
import { ResultsView } from './components/ResultsView';
import { PipelineRunnerModal } from './components/PipelineRunnerModal';
import { ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'analyze' && <AnalyzeView />}
        {activeTab === 'results' && <ResultsView />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
              <GraduationCap className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-800">ScholarPath AI</span>
            <span aria-hidden="true">·</span>
            <span>Five-Agent Educational Opportunity Intelligence</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-slate-900 transition-colors">
              Dashboard
            </button>
            <button onClick={() => setActiveTab('profile')} className="hover:text-slate-900 transition-colors">
              Student Profile
            </button>
            <button onClick={() => setActiveTab('analyze')} className="hover:text-slate-900 transition-colors">
              Analyze Opportunity
            </button>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded in Source Evidence</span>
            </span>
          </div>
        </div>
      </footer>

      <PipelineRunnerModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
