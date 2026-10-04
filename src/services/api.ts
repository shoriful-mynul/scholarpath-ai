import { StudentProfile, FullAnalysisResult } from '../types';

export interface HealthResponse {
  status: string;
  appName: string;
  timestamp: string;
  hasOpenRouterKey: boolean;
  mode: string;
}

export interface SamplesResponse {
  profiles: Record<string, StudentProfile>;
  opportunities: Array<{
    id: string;
    name: string;
    organization: string;
    type: string;
    deadlineDisplay: string;
    description: string;
    rawText: string;
  }>;
  precomputedDemo: FullAnalysisResult;
}

export async function checkServerHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json();
}

export async function fetchSamples(): Promise<SamplesResponse> {
  const res = await fetch('/api/samples');
  if (!res.ok) throw new Error(`Failed to load samples (${res.status})`);
  return res.json();
}

export async function extractDocumentText(file: File): Promise<{ text: string; pageCount?: number }> {
  // If text file or markdown, read directly client-side first
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ text: (e.target?.result as string) || '' });
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  // Convert to base64 and send to server document extractor
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const resultStr = e.target?.result as string;
        const base64Data = resultStr.split(',')[1] || resultStr;
        const res = await fetch('/api/extract-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data,
            mimeType: file.type || 'application/pdf',
            fileName: file.name
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Document extraction failed with code ${res.status}`);
        }

        const data = await res.json();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to load file.'));
    reader.readAsDataURL(file);
  });
}

export async function runAnalysisPipeline(
  rawOpportunityText: string,
  studentProfile: StudentProfile,
  allowDeterministicFallback?: boolean
): Promise<FullAnalysisResult> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawOpportunityText,
      studentProfile,
      allowDeterministicFallback: Boolean(allowDeterministicFallback)
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Analysis could not be completed (Server returned status ${res.status})`);
  }

  return res.json();
}
