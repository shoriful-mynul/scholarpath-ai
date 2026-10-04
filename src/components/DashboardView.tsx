import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Calendar,
  Compass,
  FileSearch,
  UserCheck,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    setActiveTab,
    currentProfile,
    loadDemoAnalysis,
    sampleOpportunities,
    recentAnalyses,
    setCurrentAnalysis,
    runAnalysis,
    serverHealth
  } = useApp();

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic Educational Opportunity Intelligence</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">Deterministic Verification & Multi-Agent Planning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Understand opportunities. Know where you stand. Apply with confidence.
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            ScholarPath AI executes a coordinated five-agent pipeline that audits complex scholarship, fellowship, and internship requirements, compares your academic qualifications with deterministic precision, and synthesizes an actionable milestone plan.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('analyze')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Analyze an Opportunity</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={loadDemoAnalysis}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Explore Pre-loaded Demo Report</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Edit Student Profile →
            </button>
          </div>

          {/* Quick system status */}
          <div className="pt-4 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${serverHealth?.hasOpenRouterKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{serverHealth?.hasGeminiKey ? 'OpenRouter Agent Mode' : 'Deterministic Mode (Key ready in Secrets)'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Deterministic GPA & Rules Engine Active</span>
            <span aria-hidden="true">·</span>
            <span>Zero Hallucination Guardrails</span>
          </div>
        </div>
      </section>

      {/* Active Profile & Quick Launch Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Candidate Snapshot */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Student Profile</span>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-indigo-600 hover:underline font-medium"
              >
                Change
              </button>
            </div>

            <div className="pt-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{currentProfile.name}</h3>
                <p className="text-xs text-slate-500">
                  {currentProfile.currentDegree} · {currentProfile.fieldOfStudy}
                </p>
                <p className="text-xs text-slate-500">{currentProfile.university}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Cumulative GPA</span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums text-sm">
                    {currentProfile.gpa.toFixed(2)} / {currentProfile.maxGpa || 4.0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Graduation Year</span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums text-sm">
                    {currentProfile.expectedGraduationYear}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nationality</span>
                  <span className="font-medium text-slate-700 truncate block">
                    {currentProfile.nationality}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Technical Skills</span>
                  <span className="font-medium text-slate-700 block">
                    {currentProfile.technicalSkills.length + currentProfile.programmingLanguages.length} Listed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <button
              onClick={() => setActiveTab('analyze')}
              className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors text-center"
            >
              Analyze with this Profile
            </button>
          </div>
        </div>

        {/* 1-Click Curated Opportunities */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Curated Sample Opportunities (Instant Test)</span>
            </div>
            <span className="text-[11px] text-slate-400">Verified official listings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {sampleOpportunities.slice(0, 4).map((opp) => (
              <div
                key={opp.id}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col justify-between group text-left"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium text-indigo-600">{opp.organization}</span>
                    <span>{opp.type}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {opp.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{opp.deadlineDisplay.split('at')[0]}</span>
                  </span>
                  <button
                    onClick={() => {
                      runAnalysis(opp.rawText);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Run Pipeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-Agent Architecture Breakdown */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-lg">
        <div className="max-w-2xl mb-8">
          <div className="text-xs font-semibold text-indigo-400 tracking-wider mb-2">
            MODULAR AGENTIC ARCHITECTURE
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Five Dedicated Agents. One Trustworthy Decision Engine.
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            ScholarPath AI replaces opaque single-prompt LLM generation with a modular sequence of specialized agents equipped with hard deterministic code gates and adversarial hallucination auditing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
                <FileSearch className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-white">1. Opportunity Analyzer</h4>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                Extracts criteria and locks exact quotation snippets from the source text. Never invents requirements.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-700 text-[10px] text-slate-400">
              Evidence Grounding
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-white">2. Eligibility Analyzer</h4>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                Runs hard mathematical comparisons in application code (GPA, country, degree level) to avoid AI hallucinations.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-700 text-[10px] text-slate-400">
              Deterministic Code Logic
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-white">3. Opportunity Match</h4>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                Evaluates holistic alignment across projects, research, leadership, and technical skills with transparent reasoning.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-700 text-[10px] text-slate-400">
              Qualitative Fit Analysis
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-white">4. Application Planner</h4>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                Maps missing documents, recommends skills to emphasize, and organizes tasks chronologically around the deadline.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-700 text-[10px] text-slate-400">
              Personalized Action Plan
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-white">5. Verification Agent</h4>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                Adversarial auditor that verifies citations, flags contradictions, and separates evidence vs. student vs. AI claims.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-700 text-[10px] text-slate-400">
              Provenance & Truth Audit
            </div>
          </div>
        </div>
      </section>

      {/* Recent Evaluations History (if any) */}
      {recentAnalyses.length > 0 && (
        <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recent Evaluations ({recentAnalyses.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">Cached in local session</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAnalyses.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{item.opportunityName}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{item.studentName}</span>
                    <span aria-hidden="true">·</span>
                    <span className={item.eligibility.overallStatus === 'Met' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                      Eligibility: {item.eligibility.overallStatus}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.match.compatibilityTier}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentAnalysis(item);
                    setActiveTab('results');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 rounded-md transition-colors"
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
