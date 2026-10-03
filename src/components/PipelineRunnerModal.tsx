import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Loader2, Sparkles, FileSearch, Scale, Compass, CalendarCheck, ShieldCheck, FileText } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    step: 1,
    name: 'Reading Opportunity',
    detail: 'Parsing uploaded PDF/document or pasted announcement text.',
    icon: FileText,
    isImplemented: true
  },
  {
    step: 2,
    name: 'Extracting Requirements (Agent 1: Opportunity Analyzer)',
    detail: 'Extracting GPA, citizenship, degrees, required documents, and locking source evidence quotes.',
    icon: FileSearch,
    isImplemented: true
  },
  {
    step: 3,
    name: 'Checking Eligibility (Agent 2: Eligibility Analyzer)',
    detail: 'Executing deterministic code checks for GPA arithmetic, country, and academic standing.',
    icon: Scale,
    isImplemented: true
  },
  {
    step: 4,
    name: 'Analyzing Profile Match (Agent 3: Profile Match Agent)',
    detail: 'Evaluating background alignment, skills, and projects without acceptance speculation.',
    icon: Compass,
    isImplemented: true
  },
  {
    step: 5,
    name: 'Building Application Plan (Agent 4: Application Planner)',
    detail: 'Structuring priority tasks, document checklist, and deadline milestone timeline.',
    icon: CalendarCheck,
    isImplemented: true
  },
  {
    step: 6,
    name: 'Verifying Integrity (Agent 5: Verification Agent)',
    detail: 'Adversarial audit detecting unsupported claims, hallucinations, and contradictions.',
    icon: ShieldCheck,
    isImplemented: true
  }
];

export const PipelineRunnerModal: React.FC = () => {
  const { isAnalyzing, pipelineStep, pipelineMessage } = useApp();

  if (!isAnalyzing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">ScholarPath Analysis Engine</h3>
              <p className="text-xs text-slate-500">Step 2: Opportunity Analyzer & Eligibility Analyzer active</p>
            </div>
          </div>
        </div>

        {/* Pipeline Stepper */}
        <div className="px-6 py-5 space-y-4">
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-medium flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-indigo-600" />
            <span className="truncate">{pipelineMessage || 'Processing opportunity evaluation...'}</span>
          </div>

          <div className="space-y-2.5">
            {PIPELINE_STAGES.map((stage) => {
              const isPast = stage.isImplemented && pipelineStep > stage.step;
              const isCurrent = stage.isImplemented && pipelineStep === stage.step;
              const isUpcomingStep3 = !stage.isImplemented;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.step}
                  className={`p-3 rounded-lg border transition-all duration-300 flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-indigo-50/40 border-indigo-200 shadow-xs ring-1 ring-indigo-200'
                      : isPast
                      ? 'bg-slate-50/80 border-slate-200'
                      : isUpcomingStep3
                      ? 'bg-slate-50/40 border-dashed border-slate-200 opacity-60'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    ) : isUpcomingStep3 ? (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-mono">
                        ○
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                        {stage.step}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-600' : isPast ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <h4 className={`text-xs font-semibold ${isCurrent ? 'text-indigo-900' : isUpcomingStep3 ? 'text-slate-500' : 'text-slate-800'}`}>
                          {stage.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 tabular-nums">
                        {isPast ? '✓ Completed' : isCurrent ? '● In Progress' : isUpcomingStep3 ? 'Upcoming in Step 3' : '○ Queued'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {stage.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Full 5-Agent Pipeline Active</span>
          <span className="font-mono text-[11px] tabular-nums">Stage {Math.min(pipelineStep, 6)} of 6</span>
        </div>
      </div>
    </div>
  );
};
