import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { extractDocumentText } from '../services/api';
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Loader2,
  X,
  UserCheck,
  Building,
  Eye,
  AlertTriangle
} from 'lucide-react';

export const AnalyzeView: React.FC = () => {
  const {
    studentProfile,
    sampleOpportunities,
    runAnalysis,
    setActiveTab,
    opportunityInput,
    setOpportunityInput,
    opportunityDocument,
    setOpportunityDocument,
    analysisErrors,
    error,
    clearError,
    clearAnalysisErrors
  } = useApp();

  const [isExtractingDoc, setIsExtractingDoc] = useState(false);
  const [docExtractSuccess, setDocExtractSuccess] = useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const opportunityText = opportunityInput.text;
  const inputMethod = opportunityInput.method;

  // Real-time title and organization detector for the preview
  const detectedMetadata = useMemo(() => {
    const text = opportunityText.trim();
    if (!text) return { title: null, organization: null, wordCount: 0, charCount: 0 };

    const words = text.split(/\s+/).filter(Boolean);
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    let detectedTitle: string | null = null;
    let detectedOrg: string | null = null;

    for (const line of lines) {
      if (/organization\s*:\s*(.+)/i.test(line)) {
        detectedOrg = line.replace(/organization\s*:\s*/i, '').trim();
      } else if (/sponsor\s*:\s*(.+)/i.test(line)) {
        detectedOrg = line.replace(/sponsor\s*:\s*/i, '').trim();
      } else if (/host institution\s*:\s*(.+)/i.test(line)) {
        detectedOrg = line.replace(/host institution\s*:\s*/i, '').trim();
      }
    }

    if (!detectedOrg) {
      if (/google/i.test(text)) detectedOrg = 'Google Inc.';
      else if (/cern/i.test(text)) detectedOrg = 'CERN';
      else if (/schwarzman/i.test(text)) detectedOrg = 'Schwarzman Scholars';
      else if (/national science foundation|nsf/i.test(text)) detectedOrg = 'National Science Foundation (NSF)';
    }

    if (lines.length > 0 && !lines[0].toLowerCase().includes('deadline') && !lines[0].toLowerCase().includes('eligibility')) {
      detectedTitle = lines[0].replace(/[-–—].*$/, '').slice(0, 80).trim();
    }

    return {
      title: detectedTitle || 'Educational Opportunity',
      organization: detectedOrg || 'Sponsoring Organization / Institution',
      wordCount: words.length,
      charCount: text.length
    };
  }, [opportunityText]);

  // Check if profile is missing critical eligibility fields
  const missingProfileFields = useMemo(() => {
    const missing: string[] = [];
    if (!studentProfile.gpa || studentProfile.gpa <= 0) {
      missing.push('cumulative GPA (required for deterministic GPA threshold checks)');
    }
    if (!studentProfile.expectedGraduationYear) {
      missing.push('graduation year (required for continuing student & cohort checks)');
    }
    if (!studentProfile.currentDegree) {
      missing.push('current degree level');
    }
    if (!studentProfile.fieldOfStudy) {
      missing.push('field of study / major');
    }
    return missing;
  }, [studentProfile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();
    clearAnalysisErrors();
    setLocalError(null);
    setDocExtractSuccess(null);

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setLocalError('File size exceeds the 20MB limit. Please upload a smaller document.');
      return;
    }

    // Validate supported formats (PDF or Text)
    const validExtensions = ['.pdf', '.txt', '.md'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setLocalError(`Unsupported file format "${file.name}". Please upload an opportunity PDF (.pdf) or text document (.txt, .md).`);
      return;
    }

    setOpportunityDocument({
      name: file.name,
      size: file.size
    });

    setIsExtractingDoc(true);

    try {
      const data = await extractDocumentText(file);
      if (!data.text || !data.text.trim()) {
        throw new Error('The uploaded document contains no readable text. Please verify document contents.');
      }
      setOpportunityInput({
        text: data.text,
        method: 'upload'
      });
      setOpportunityDocument({
        name: file.name,
        size: file.size,
        pageCount: data.pageCount
      });
      setDocExtractSuccess(`Extracted ${data.text.length.toLocaleString()} characters from "${file.name}"${data.pageCount ? ` across ${data.pageCount} pages` : ''}.`);
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to extract readable text from file. Please ensure it is a text-based PDF or paste text directly.');
    } finally {
      setIsExtractingDoc(false);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const found = sampleOpportunities.find(s => s.id === sampleId);
    if (!found) return;

    setActiveSampleId(sampleId);
    setOpportunityInput({
      text: found.rawText,
      method: 'paste'
    });
    setOpportunityDocument(null);
    setDocExtractSuccess(null);
    setLocalError(null);
    clearError();
    clearAnalysisErrors();
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const trimmed = opportunityText.trim();
    if (!trimmed) {
      setLocalError('Please paste an opportunity description or upload a document to proceed.');
      return;
    }

    if (trimmed.length < 50) {
      setLocalError('Opportunity text is too short (under 50 characters) to contain meaningful eligibility rules. Please provide the full announcement text.');
      return;
    }

    try {
      await runAnalysis(trimmed);
    } catch {
      // Handled by context
    }
  };

  const hasUsableContent = opportunityText.trim().length >= 50 && !isExtractingDoc;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1 pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Analyze Opportunity
        </h1>
        <p className="text-xs text-slate-500">
          Step 2 Pipeline: The Opportunity Analyzer extracts structured requirements with verbatim evidence, followed by deterministic eligibility verification.
        </p>
      </div>

      {/* Profile Confirmation Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">{studentProfile.name || 'Unnamed Candidate'}</span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-600">{studentProfile.fieldOfStudy || 'Major unlisted'}</span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-mono font-semibold text-slate-900">
                GPA {studentProfile.gpa ? studentProfile.gpa.toFixed(2) : 'Missing'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {studentProfile.currentDegree || 'Degree unlisted'} at {studentProfile.university || 'University unlisted'} · Expected Graduation: {studentProfile.expectedGraduationYear || 'Unspecified'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto"
        >
          Edit Profile →
        </button>
      </div>

      {/* Warning if Student Profile has missing fields */}
      {missingProfileFields.length > 0 && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Incomplete Student Profile Detected:</span>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Some eligibility requirements cannot be verified deterministically because your profile is missing: {missingProfileFields.join(', ')}.
            </p>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-[11px] font-semibold text-amber-900 underline mt-1 block"
            >
              Update missing fields in Student Profile before analyzing →
            </button>
          </div>
        </div>
      )}

      {/* Curated Sample Opportunities (Section 9 Demo Mode) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Curated Sample Opportunities (Demo Data)</span>
          </span>
          <span className="text-[11px] text-slate-400">1-click test listings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {sampleOpportunities.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeSampleId === sample.id
                  ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="text-[10px] font-medium text-indigo-600 mb-0.5">{sample.type}</div>
              <div className="text-xs font-semibold truncate">{sample.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">{sample.organization}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Method Form */}
      <form onSubmit={handleRunAnalysis} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold text-slate-800">Opportunity Source Input</span>

            {/* Segmented Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setOpportunityInput(prev => ({ ...prev, method: 'paste' }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  inputMethod === 'paste'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Option A: Paste Opportunity
              </button>
              <button
                type="button"
                onClick={() => setOpportunityInput(prev => ({ ...prev, method: 'upload' }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  inputMethod === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Option B: Upload Document (PDF / TXT)
              </button>
            </div>
          </div>

          {/* OPTION B: UPLOAD DOCUMENT */}
          {inputMethod === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isExtractingDoc
                    ? 'border-indigo-300 bg-indigo-50/20'
                    : opportunityDocument
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    {isExtractingDoc ? (
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    ) : opportunityDocument ? (
                      <FileCheck className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {isExtractingDoc
                        ? 'Extracting readable text from document...'
                        : opportunityDocument
                        ? opportunityDocument.name
                        : 'Click or drag & drop an opportunity PDF or text document'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports PDF, TXT, and Markdown files up to 20MB. Scanned images require searchable text.
                    </p>
                  </div>
                </div>
              </div>

              {docExtractSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{docExtractSuccess}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOpportunityInput(prev => ({ ...prev, text: '' }));
                      setOpportunityDocument(null);
                      setDocExtractSuccess(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OPTION A: PASTE TEXT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label htmlFor="opp-text" className="font-medium">
                {inputMethod === 'upload' ? 'Extracted / Editable Document Text:' : 'Opportunity Description & Eligibility Guidelines:'}
              </label>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 tabular-nums">
                <span>{detectedMetadata.wordCount} words</span>
                <span aria-hidden="true">·</span>
                <span>{detectedMetadata.charCount.toLocaleString()} chars</span>
              </div>
            </div>

            <textarea
              id="opp-text"
              rows={inputMethod === 'upload' && !opportunityText ? 4 : 12}
              value={opportunityText}
              onChange={(e) => {
                setOpportunityInput(prev => ({ ...prev, text: e.target.value }));
                setActiveSampleId(null);
              }}
              placeholder={`Example opportunity format:
PROGRAM: Summer Research Fellowship
ORGANIZATION: National Science Foundation
DEADLINE: February 15, 2027
ELIGIBILITY:
- Must be a full-time enrolled undergraduate student in Computer Science or Engineering
- Minimum cumulative GPA of 3.2 on a 4.0 scale
- Must be a US Citizen or Permanent Resident
- Graduating seniors are not eligible

REQUIRED DOCUMENTS:
- Academic transcript showing coursework and GPA
- 2 letters of recommendation from faculty
- Statement of purpose detailing research interests`}
              className="w-full px-3.5 py-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed text-slate-800"
            />
          </div>

          {/* SECTION 3: OPPORTUNITY PREVIEW CARD */}
          {opportunityText.trim().length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Opportunity Preview</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Input: {inputMethod === 'upload' ? 'Uploaded PDF/Document' : 'Pasted Text'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Detected Opportunity Title</span>
                  <span className="font-semibold text-slate-900 block truncate">
                    {detectedMetadata.title}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Detected Host / Organization</span>
                  <span className="font-semibold text-slate-900 block truncate">
                    {detectedMetadata.organization}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-200/60">
                <span className="text-slate-400 text-[10px] block font-mono">CONTENT EXCERPT:</span>
                <p className="text-[11px] text-slate-600 italic line-clamp-3 leading-relaxed">
                  "{opportunityText.trim().slice(0, 320)}..."
                </p>
              </div>
            </div>
          )}

          {/* Error messages */}
          {(localError || error) && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-rose-950">
                    {error && error.includes('could not be completed')
                      ? 'Analysis could not be completed'
                      : 'Evaluation Notice'}
                  </span>
                  <p className="text-rose-800 mt-0.5 leading-relaxed">{localError || error}</p>
                </div>
              </div>
              {error && error.toLowerCase().includes('gemini') && (
                <button
                  type="button"
                  onClick={async () => {
                    const trimmed = opportunityText.trim();
                    if (trimmed) {
                      try {
                        await runAnalysis(trimmed, undefined, true);
                      } catch {
                        // Handled
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 rounded-md font-medium text-xs shrink-0 transition-colors self-start sm:self-auto"
                >
                  Run in Deterministic Mode →
                </button>
              )}
            </div>
          )}

          {/* Action bar with Analyze Opportunity CTA */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              {hasUsableContent ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready to evaluate against active candidate profile</span>
                </span>
              ) : (
                <span>Provide at least 50 characters of opportunity description to begin</span>
              )}
            </div>

            <button
              type="submit"
              disabled={!hasUsableContent}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Analyze Opportunity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
