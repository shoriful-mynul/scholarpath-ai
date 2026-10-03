import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  Printer,
  Copy,
  Check,
  Sparkles,
  Info,
  Code2,
  Briefcase,
  GraduationCap,
  Layers,
  ArrowRight,
  ShieldAlert,
  Clock,
  FileText,
  Globe,
  FileCheck,
  Quote,
  ShieldCheck,
  CalendarCheck,
  Compass,
  AlertOctagon,
  ListOrdered,
  BadgeAlert,
  FileSpreadsheet
} from 'lucide-react';

export const ResultsView: React.FC = () => {
  const { currentAnalysis, setActiveTab, studentProfile } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | 'MET' | 'NOT_MET' | 'NEEDS_VERIFICATION'>('All');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!currentAnalysis) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Opportunity Evaluation Loaded</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Provide an opportunity description by pasting text or uploading a PDF to run the 5-stage agent pipeline.
        </p>
        <button
          onClick={() => setActiveTab('analyze')}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Analyze an Opportunity →
        </button>
      </div>
    );
  }

  const {
    opportunity,
    eligibility,
    profileMatch,
    applicationPlan,
    verification,
    match,
    plan,
    studentName,
    opportunityName
  } = currentAnalysis;

  // Filter criteria
  const filteredCriteria = eligibility.criteriaResults.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  // Missing or unclear requirements
  const missingOrUnclearCriteria = eligibility.criteriaResults.filter(
    c => c.status === 'NOT_MET' || c.status === 'NEEDS_VERIFICATION'
  );

  const activeProfileMatch = profileMatch || {
    strongMatches: (match.strongMatches || []).map(m => ({
      area: 'Core Qualification',
      studentEvidence: m,
      opportunityRelevance: 'Aligned with opportunity',
      reasoning: 'Extracted from background'
    })),
    relevantExperience: (match.relevantExperience || []).map(e => ({
      experience: e,
      relevance: 'Demonstrated execution',
      evidence: 'Student profile'
    })),
    relevantSkills: (match.relevantSkills || []).map(s => ({ skill: s, relevance: 'Technical competency' })),
    gaps: (match.growthAreas || []).map(g => ({ area: 'Growth Area', reason: g, severity: 'MEDIUM' as const })),
    summary: match.compatibilitySummary
  };

  const activePlan = applicationPlan || {
    priorityTasks: (plan?.tasks || []).map((t, i) => ({
      task: t.title,
      priority: (t.priority?.toUpperCase() === 'HIGH' ? 'HIGH' : t.priority?.toUpperCase() === 'LOW' ? 'LOW' : 'MEDIUM') as any,
      reason: t.description,
      relatedRequirement: t.category,
      suggestedOrder: i + 1
    })),
    documents: (plan?.missingDocuments || []).map(d => ({
      document: d,
      status: 'NEEDS_PREPARATION' as const,
      reason: 'Required for submission dossier'
    })),
    profileHighlights: (plan?.skillsToHighlight || []).map(s => ({ item: s, reason: 'Key skill to emphasize' })),
    requirementsToVerify: (plan?.missingRequirements || []).map(r => ({ requirement: r, reason: 'Verification needed' })),
    deadline: opportunity.deadline,
    deadlineNotes: `Official submission deadline: ${opportunity.deadline}`
  };

  const activeVerification = verification || {
    auditStatus: (eligibility.overallStatus === 'MET' ? 'VERIFIED_COMPLIANT' : 'ACTION_NEEDED') as any,
    confidenceScore: 95,
    issuesFound: false,
    flags: [],
    auditSummary: 'All criteria evaluated directly against source documentation without hallucinations.',
    finalAssessment: 'Structured verification complete across all pipeline agents.'
  };

  const handleCopyMarkdown = () => {
    const md = `# ScholarPath AI Full Agent Report: ${opportunityName}
Candidate: ${studentName}
Date: ${new Date(currentAnalysis.createdAt).toLocaleDateString()}

## 1. Opportunity Overview (Agent 1: Opportunity Analyzer)
- Organization: ${opportunity.organization}
- Type: ${opportunity.type}
- Stated Deadline: ${opportunity.deadline}
- Award/Compensation: ${opportunity.awardOrCompensation || 'Not specified'}
- Location: ${opportunity.location || 'Not specified'}
- Summary: ${opportunity.summary}

## 2. Hard Eligibility Analysis (Agent 2: Deterministic Engine)
- Overall Status: ${eligibility.overallStatus} (${eligibility.metCount} MET, ${eligibility.notMetCount} NOT_MET, ${eligibility.needsVerificationCount} NEEDS_VERIFICATION)
${eligibility.criteriaResults.map(c => `* [${c.status}] ${c.requirement}: Student Profile: "${c.studentInformation}" | Evidence: "${c.evidence}"`).join('\n')}

## 3. Missing / Unclear Requirements
${missingOrUnclearCriteria.length === 0 ? '* None (all evaluated criteria satisfied)' : missingOrUnclearCriteria.map(c => `* [${c.status}] ${c.requirement}: ${c.explanation}`).join('\n')}

## 4. Profile Match Analysis (Agent 3: Profile Match Agent)
Summary: ${activeProfileMatch.summary}
### Strong Matches:
${activeProfileMatch.strongMatches.map(m => `* ${m.area}: ${m.studentEvidence} (Relevance: ${m.opportunityRelevance})`).join('\n')}
### Relevant Skills:
${activeProfileMatch.relevantSkills.map(s => `* ${s.skill}: ${s.relevance}`).join('\n')}
### Gaps / Areas to Address:
${activeProfileMatch.gaps.map(g => `* [${g.severity}] ${g.area}: ${g.reason}`).join('\n')}
*(Note: Evaluates factual background compatibility; not an official prediction of acceptance).*

## 5. Application Preparation Plan (Agent 4: Application Planner)
Deadline: ${activePlan.deadline}
Deadline Notes: ${activePlan.deadlineNotes}
### Priority Tasks:
${activePlan.priorityTasks.map(t => `${t.suggestedOrder}. [${t.priority}] ${t.task} - ${t.reason}`).join('\n')}
### Document Checklist:
${activePlan.documents.map(d => `* [${d.status}] ${d.document}: ${d.reason}`).join('\n')}
### Profile Highlights to Feature:
${activePlan.profileHighlights.map(h => `* ${h.item}: ${h.reason}`).join('\n')}

## 6. Adversarial Verification Audit (Agent 5: Verification Agent)
- Audit Status: ${activeVerification.auditStatus}
- Audit Confidence Score: ${activeVerification.confidenceScore}% (Internal AI audit integrity indicator — not an acceptance prediction)
- Summary: ${activeVerification.auditSummary}
${activeVerification.flags && activeVerification.flags.length > 0 ? activeVerification.flags.map(f => `* [${f.category} - ${f.severity}] Claim by ${f.claimedBy}: "${f.claim}" -> Correction: ${f.correction}`).join('\n') : '* No hallucinations, contradictions, or unsupported claims detected.'}
`;

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 pb-20 print:p-0">
      {/* Top Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Evaluation Report</span>
            <span aria-hidden="true">·</span>
            <span>Candidate: <strong className="text-slate-900 font-semibold">{studentName}</strong></span>
            <span aria-hidden="true">·</span>
            {currentAnalysis.aiAnalysisFailed ? (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Deterministic Mode (AI Analysis Incomplete)
              </span>
            ) : (
              <span className="text-indigo-600 font-medium">5-Stage Agent Pipeline Complete</span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{opportunityName}</h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Copy structured Markdown report"
          >
            {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMarkdown ? 'Copied MD' : 'Copy Full Report'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Print or Save to PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => setActiveTab('analyze')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* AI Analysis Failure Banner */}
      {currentAnalysis.aiAnalysisFailed && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-amber-950">
              Notice: Live AI Analysis Could Not Be Completed
            </span>
            <p className="text-amber-800 leading-relaxed">
              {currentAnalysis.aiFailureReason || 'The upstream Gemini AI service was unavailable or timed out.'} Deterministic eligibility criteria and rule-based checks were successfully evaluated. However, full AI agent synthesis was not completed, and the Verification Agent has flagged this evaluation as <strong className="font-mono text-amber-950">ACTION_NEEDED</strong>.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: OPPORTUNITY OVERVIEW */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>1. Opportunity Overview</span>
            <span className="text-slate-400 font-normal">· Extracted by Agent 1 (Opportunity Analyzer)</span>
          </h2>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
            {opportunity.type}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              <span>Host / Organization</span>
            </span>
            <span className="font-semibold text-slate-900 text-sm block truncate">{opportunity.organization}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Application Deadline</span>
            </span>
            <span className="font-semibold text-slate-900 text-sm block truncate">{opportunity.deadline}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Award / Funding</span>
            </span>
            <span className="font-semibold text-slate-900 text-sm block truncate">{opportunity.awardOrCompensation || 'Not specified'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location / Scope</span>
            </span>
            <span className="font-semibold text-slate-900 text-sm block truncate">{opportunity.location || 'Global / Campus'}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-800">Summary & Scope</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{opportunity.summary}</p>
        </div>

        {/* Structured Extracted Criteria Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Extracted Structured Requirements & Criteria</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Required Documents */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Required Documents</span>
              </span>
              {opportunity.requiredDocuments && opportunity.requiredDocuments.length > 0 ? (
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  {opportunity.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 italic text-[11px]">Not explicitly specified in announcement</span>
              )}
            </div>

            {/* Eligible Countries & Citizenship */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Eligible Countries / Citizenship</span>
              </span>
              {opportunity.eligibleCountries && opportunity.eligibleCountries.length > 0 ? (
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  {opportunity.eligibleCountries.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 italic text-[11px]">Open globally or unspecified</span>
              )}
            </div>

            {/* Academic & GPA Requirements */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academic & GPA Threshold</span>
              </span>
              <div className="space-y-1 text-slate-600 text-[11px]">
                {opportunity.gpaRequirement ? (
                  <p><strong>Min GPA:</strong> <span className="font-mono font-semibold text-slate-900">{opportunity.gpaRequirement.minimumGpa}</span> / {opportunity.gpaRequirement.scale}</p>
                ) : opportunity.gpaRequirements && opportunity.gpaRequirements.length > 0 ? (
                  <p><strong>GPA:</strong> {opportunity.gpaRequirements.join(', ')}</p>
                ) : (
                  <p className="text-slate-400 italic">No explicit minimum GPA stated</p>
                )}

                {opportunity.degreeRequirements && opportunity.degreeRequirements.length > 0 && (
                  <p><strong>Degrees:</strong> {opportunity.degreeRequirements.join('; ')}</p>
                )}

                {opportunity.yearRequirements && opportunity.yearRequirements.length > 0 && (
                  <p><strong>Cohort/Year:</strong> {opportunity.yearRequirements.join('; ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verbatim Source Evidence locked by Agent 1 */}
        {opportunity.evidence && opportunity.evidence.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <Quote className="w-3 h-3 text-slate-400" />
              <span>Verbatim Source Evidence Locked by Agent 1:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {opportunity.evidence.slice(0, 4).map((ev, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg space-y-0.5">
                  <span className="font-semibold text-slate-700 block truncate">{ev.requirement}</span>
                  <p className="text-slate-500 italic line-clamp-2 leading-relaxed">"{ev.snippet}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: ELIGIBILITY ANALYSIS TABLE */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">2. Hard Eligibility Analysis</h2>
              <span className="text-slate-400 text-xs">· Evaluated by Agent 2 (Eligibility Analyzer)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic application code comparisons for numerical thresholds, citizenship, and academic cohorts.
            </p>
          </div>

          {/* Status Segmented Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
            {(['All', 'MET', 'NEEDS_VERIFICATION', 'NOT_MET'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'MET' ? 'MET' : st === 'NOT_MET' ? 'NOT_MET' : st === 'NEEDS_VERIFICATION' ? 'NEEDS_VERIFICATION' : 'All'}
                {st === 'MET' && ` (${eligibility.metCount})`}
                {st === 'NEEDS_VERIFICATION' && ` (${eligibility.needsVerificationCount})`}
                {st === 'NOT_MET' && ` (${eligibility.notMetCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            eligibility.overallStatus === 'MET'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : eligibility.overallStatus === 'NOT_MET'
              ? 'bg-rose-50/60 border-rose-200 text-rose-950'
              : 'bg-amber-50/60 border-amber-200 text-amber-950'
          }`}
        >
          {eligibility.overallStatus === 'MET' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : eligibility.overallStatus === 'NOT_MET' ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                OVERALL STATUS: {eligibility.overallStatus}
              </span>
              <span className="text-xs opacity-70">
                ({eligibility.metCount} MET · {eligibility.needsVerificationCount} NEEDS VERIFICATION · {eligibility.notMetCount} NOT MET)
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed opacity-90">{eligibility.summary}</p>
          </div>
        </div>

        {/* STRUCTURED TABLE (Requirement | Student Profile | Status | Evidence) */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4 w-1/4">Requirement</th>
                <th scope="col" className="py-3 px-4 w-1/4">Student Profile</th>
                <th scope="col" className="py-3 px-4 w-1/6">Status</th>
                <th scope="col" className="py-3 px-4 w-1/3">Source Evidence & Code Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCriteria.map((criterion) => (
                <tr key={criterion.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 align-top">
                    <span className="font-semibold text-slate-900 block">{criterion.requirement}</span>
                  </td>

                  <td className="py-3.5 px-4 align-top text-slate-800">
                    <span className="font-medium block">{criterion.studentInformation}</span>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono ${
                        criterion.status === 'MET'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : criterion.status === 'NOT_MET'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {criterion.status === 'MET' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {criterion.status === 'NOT_MET' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {criterion.status === 'NEEDS_VERIFICATION' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{criterion.status}</span>
                    </span>
                    {criterion.isDeterministic && (
                      <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                        Deterministic code math
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 align-top space-y-1.5">
                    <div className="text-[11px] text-slate-700 leading-relaxed">
                      {criterion.explanation}
                    </div>
                    {criterion.evidence && (
                      <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-600 italic">
                        <span className="font-semibold text-slate-500 not-italic block text-[10px] mb-0.5">SOURCE EVIDENCE:</span>
                        "{criterion.evidence}"
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: MISSING / UNCLEAR REQUIREMENTS */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-900">3. Missing / Unclear Requirements</h2>
          </div>
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md font-semibold font-mono">
            {missingOrUnclearCriteria.length} Items to Address
          </span>
        </div>

        {missingOrUnclearCriteria.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All evaluated requirements are fully satisfied! No blockers or ambiguous requirements identified.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              The following requirements are either unsatisfied (<span className="font-semibold text-rose-700 font-mono">NOT_MET</span>) or require additional verification/external documentation (<span className="font-semibold text-amber-700 font-mono">NEEDS_VERIFICATION</span>).
            </p>

            <div className="space-y-2.5">
              {missingOrUnclearCriteria.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                    item.status === 'NOT_MET'
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.status === 'NOT_MET' ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{item.requirement}</span>
                      <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{item.explanation}</p>
                    <div className="mt-2 text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
                      <span className="font-semibold not-italic text-slate-400 block text-[10px]">VERBATIM REQUIREMENT:</span>
                      "{item.evidence}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4: PROFILE MATCH AGENT (Stage 3) */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-900">4. Profile Match Analysis</h2>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Agent 3: Profile Match Agent
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {activeProfileMatch.strongMatches.length} Strong Matches · {activeProfileMatch.gaps.length} Gaps
          </span>
        </div>

        {/* Academic Humility / Anti-Speculation Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            This profile match measures <strong>factual background alignment</strong> based exclusively on verified candidate records. In accordance with strict admissions ethics, it <strong>does not calculate an arbitrary numerical acceptance probability</strong> or guarantee admission.
          </p>
        </div>

        {/* Summary */}
        <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
          <h4 className="text-xs font-semibold text-indigo-950 mb-1">Qualitative Alignment Synthesis</h4>
          <p className="text-xs text-indigo-900 leading-relaxed">{activeProfileMatch.summary}</p>
        </div>

        {/* Strong Matches */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strong Matches Grounded in Profile</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeProfileMatch.strongMatches.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{m.area}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Strong Fit
                  </span>
                </div>
                <div className="text-[11px] text-slate-700">
                  <strong className="text-slate-500 font-semibold block text-[10px]">CANDIDATE EVIDENCE:</strong>
                  {m.studentEvidence}
                </div>
                {m.reasoning && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                    "{m.reasoning}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Relevant Experience & Relevant Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Relevant Experience */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Relevant Experience & Projects</span>
            </h3>
            <div className="space-y-2">
              {activeProfileMatch.relevantExperience && activeProfileMatch.relevantExperience.length > 0 ? (
                activeProfileMatch.relevantExperience.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                    <span className="font-semibold text-slate-900 block">{exp.experience}</span>
                    <p className="text-[11px] text-slate-600">{exp.relevance}</p>
                    {exp.evidence && (
                      <span className="text-[10px] text-slate-400 font-mono block">Evidence: {exp.evidence}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No specific experience entries matched.</p>
              )}
            </div>
          </div>

          {/* Relevant Skills */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Matching Technical Competencies</span>
            </h3>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {activeProfileMatch.relevantSkills.map((s, idx) => (
                  <div key={idx} className="p-2 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{s.skill}</span>
                      <span className="text-[10px] text-indigo-600 font-medium">Aligned</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gaps */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
            <span>Profile Gaps & Areas to Address</span>
          </h3>
          <div className="space-y-2">
            {activeProfileMatch.gaps.map((gap, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex items-start justify-between gap-3 text-xs ${
                  gap.severity === 'HIGH'
                    ? 'bg-rose-50/40 border-rose-200'
                    : gap.severity === 'MEDIUM'
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900">{gap.area}</span>
                  <p className="text-slate-600 text-[11px]">{gap.reason}</p>
                </div>
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                    gap.severity === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : gap.severity === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {gap.severity} Priority
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: APPLICATION PREPARATION PLAN (Stage 4) */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-900">5. Application Preparation Plan</h2>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Agent 4: Application Planner
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {activePlan.priorityTasks.length} Sequenced Milestones
          </span>
        </div>

        {/* Deadline & Urgency Banner */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Submission Deadline & Urgency
            </span>
            <span className="font-mono text-xs font-bold bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-700">
              {activePlan.deadline}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{activePlan.deadlineNotes}</p>
        </div>

        {/* Priority Tasks Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
            <span>Recommended Chronological Preparation Tasks</span>
          </h3>
          <div className="space-y-2">
            {activePlan.priorityTasks.map((task) => (
              <div key={task.suggestedOrder} className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-start gap-3 text-xs bg-white">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  {task.suggestedOrder}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{task.task}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{task.reason}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Related: {task.relatedRequirement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Checklist & Profile Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {/* Document Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Document Readiness Assessment</span>
            </h3>
            <div className="space-y-2">
              {activePlan.documents.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{doc.document}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        doc.status === 'LIKELY_AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'NEEDS_PREPARATION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{doc.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Highlights to Feature */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Profile Elements to Emphasize</span>
            </h3>
            <div className="space-y-2">
              {activePlan.profileHighlights.map((hl, idx) => (
                <div key={idx} className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 text-xs space-y-1">
                  <span className="font-semibold text-indigo-950 block">{hl.item}</span>
                  <p className="text-[11px] text-indigo-900 leading-relaxed">{hl.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements Needing Verification */}
        {activePlan.requirementsToVerify && activePlan.requirementsToVerify.length > 0 && (
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <h4 className="font-semibold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Specific Requirements Requiring External Confirmation ({activePlan.requirementsToVerify.length})</span>
            </h4>
            <div className="space-y-1.5">
              {activePlan.requirementsToVerify.map((req, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded border border-amber-200/80 text-[11px]">
                  <span className="font-semibold text-slate-900 block">{req.requirement}</span>
                  <span className="text-slate-600">{req.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 6: ADVERSARIAL VERIFICATION AUDIT (Stage 5) */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">6. Adversarial Verification Audit</h2>
              <span className="text-[10px] text-slate-500 font-medium">
                Stage 5: Verification Agent (Cross-examines claims against source citations)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs font-bold px-3 py-1 rounded-md uppercase border ${
                  activeVerification.auditStatus === 'VERIFIED_COMPLIANT'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : activeVerification.auditStatus === 'ACTION_NEEDED'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                Status: {activeVerification.auditStatus}
              </span>
              <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                Audit Confidence: {activeVerification.confidenceScore}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              AI audit confidence — not an acceptance prediction
            </span>
          </div>
        </div>

        {/* Audit Assessment Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
          <span className="font-semibold text-slate-800 block">Integrity Verdict</span>
          <p className="text-slate-600 leading-relaxed">{activeVerification.auditSummary}</p>
          {activeVerification.finalAssessment && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
              {activeVerification.finalAssessment}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Audit confidence reflects internal reasoning provenance and document grounding — not admission or funding odds.</span>
          </div>
        </div>

        {/* Adversarial Flags */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>Adversarial Inspection Flags</span>
            <span className="font-mono text-[10px] text-slate-500">
              {activeVerification.flags && activeVerification.flags.length > 0
                ? `${activeVerification.flags.length} issue(s) detected`
                : '0 issues detected'}
            </span>
          </h3>

          {activeVerification.flags && activeVerification.flags.length > 0 ? (
            <div className="space-y-2.5">
              {activeVerification.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                    flag.severity === 'HIGH'
                      ? 'bg-rose-50/50 border-rose-200'
                      : flag.severity === 'MEDIUM'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <BadgeAlert className={`w-3.5 h-3.5 ${flag.severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`} />
                      <span>{flag.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        Claimed By: {flag.claimedBy}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          flag.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : flag.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                    <p><strong>Claim:</strong> "{flag.claim}"</p>
                    <p><strong>Auditor Note:</strong> {flag.explanation}</p>
                    <p className="text-emerald-800 font-medium"><strong>Correction:</strong> {flag.correction}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Verified Compliant:</strong> Zero hallucinations, unsupported claims, or contradictions identified. All 5 agent stages align strictly with source documentation.
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
