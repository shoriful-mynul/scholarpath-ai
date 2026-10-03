import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, FullAnalysisResult, OpportunityAnalysis, EligibilityAnalysis } from '../types';
import { fetchSamples, runAnalysisPipeline, checkServerHealth, HealthResponse } from '../services/api';

export type NavTab = 'dashboard' | 'profile' | 'analyze' | 'results';

export type AnalysisStatus = 
  | 'idle' 
  | 'reading' 
  | 'extracting' 
  | 'checking_eligibility' 
  | 'completed' 
  | 'error';

export interface OpportunityInputState {
  text: string;
  method: 'paste' | 'upload';
}

export interface OpportunityDocumentState {
  name: string;
  size: number;
  pageCount?: number;
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // 1. studentProfile
  studentProfile: StudentProfile;
  setStudentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  currentProfile: StudentProfile;
  setCurrentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  updateProfileField: <K extends keyof StudentProfile>(field: K, value: StudentProfile[K]) => void;
  resetProfileToDefault: () => void;

  // 2. opportunityInput
  opportunityInput: OpportunityInputState;
  setOpportunityInput: React.Dispatch<React.SetStateAction<OpportunityInputState>>;

  // 3. opportunityDocument
  opportunityDocument: OpportunityDocumentState | null;
  setOpportunityDocument: React.Dispatch<React.SetStateAction<OpportunityDocumentState | null>>;

  // 4. extractedOpportunity
  extractedOpportunity: OpportunityAnalysis | null;
  setExtractedOpportunity: React.Dispatch<React.SetStateAction<OpportunityAnalysis | null>>;

  // 5. eligibilityAnalysis
  eligibilityAnalysis: EligibilityAnalysis | null;
  setEligibilityAnalysis: React.Dispatch<React.SetStateAction<EligibilityAnalysis | null>>;

  // 6. analysisStatus
  analysisStatus: AnalysisStatus;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  isAnalyzing: boolean;
  pipelineStep: number;
  pipelineMessage: string;

  // 7. analysisErrors
  analysisErrors: string[];
  setAnalysisErrors: React.Dispatch<React.SetStateAction<string[]>>;
  clearAnalysisErrors: () => void;
  error: string | null;
  clearError: () => void;

  // 8. finalReport
  finalReport: FullAnalysisResult | null;
  setFinalReport: React.Dispatch<React.SetStateAction<FullAnalysisResult | null>>;
  currentAnalysis: FullAnalysisResult | null;
  setCurrentAnalysis: (analysis: FullAnalysisResult | null) => void;
  recentAnalyses: FullAnalysisResult[];

  // Helpers & Samples
  sampleProfiles: Record<string, StudentProfile>;
  sampleOpportunities: Array<{
    id: string;
    name: string;
    organization: string;
    type: string;
    deadlineDisplay: string;
    description: string;
    rawText: string;
  }>;
  runAnalysis: (rawText: string, profileOverride?: StudentProfile, allowFallback?: boolean) => Promise<FullAnalysisResult>;
  loadDemoAnalysis: () => void;
  loadSampleProfile: (profileId: string) => void;
  serverHealth: HealthResponse | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = 'scholarpath_active_profile_v2';
const LOCAL_STORAGE_OPP_KEY = 'scholarpath_opportunity_input_v2';
const LOCAL_STORAGE_RECENT_KEY = 'scholarpath_recent_analyses_v2';

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Elena Rostova',
  country: 'United States',
  nationality: 'American',
  age: 21,
  currentDegree: 'Bachelor of Science',
  fieldOfStudy: 'Computer Science & Artificial Intelligence',
  university: 'University of Washington, Seattle',
  currentYearOrSemester: '3rd Year (Junior)',
  gpa: 3.82,
  maxGpa: 4.0,
  expectedGraduationYear: 2027,
  technicalSkills: ['Algorithms & Data Structures', 'Distributed Systems', 'Computer Vision', 'REST APIs'],
  programmingLanguages: ['Python', 'TypeScript', 'C++', 'SQL', 'Go'],
  aiMlSkills: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Hugging Face Transformers'],
  otherSkills: ['Git / CI/CD', 'Docker', 'Technical Writing', 'Public Speaking'],
  internships: [
    {
      role: 'Software Engineering Intern (Backend)',
      organization: 'Kite FinTech Labs',
      duration: 'June 2025 – August 2025 (3 months)',
      description: 'Engineered high-throughput transaction indexing microservice in Go and PostgreSQL, reducing latency by 28%.'
    }
  ],
  researchExperience: [
    {
      title: 'Undergraduate Researcher — Efficient Deep Learning Lab',
      labOrMentor: 'Prof. S. Vance, Dept of Computer Science',
      description: 'Investigating quantization and pruning techniques on vision-language models for edge robotics.',
      publicationsOrOutcomes: 'Submitted workshop paper: "Zero-Latency Quantized Multi-Modal Ingestion for Edge Drones"'
    }
  ],
  projects: [
    {
      title: 'NeuralScribe — Accessible Lecture Transcriber',
      techStack: ['Python', 'Whisper API', 'React', 'FastAPI'],
      description: 'Full-stack application serving over 1,200 students with real-time captioning and semantic concept indexing.'
    }
  ],
  leadership: [
    {
      role: 'Vice President & Technical Workshop Lead',
      organization: 'ACM-W (Association for Computing Machinery - Women)',
      description: 'Organized 8 hands-on machine learning bootcamps for 250+ undergraduate members. Mentored 12 underrepresented freshmen.'
    }
  ],
  certificationsAwards: [
    {
      name: 'Dean’s List Honors (5 consecutive semesters)',
      issuer: 'University of Washington College of Engineering',
      year: '2024–2026'
    }
  ]
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sampleProfiles, setSampleProfiles] = useState<Record<string, StudentProfile>>({});
  const [sampleOpportunities, setSampleOpportunities] = useState<Array<any>>([]);
  const [precomputedDemo, setPrecomputedDemo] = useState<FullAnalysisResult | null>(null);
  const [serverHealth, setServerHealth] = useState<HealthResponse | null>(null);

  // 1. studentProfile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  // 2. opportunityInput state
  const [opportunityInput, setOpportunityInput] = useState<OpportunityInputState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_OPP_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { text: '', method: 'paste' };
  });

  // 3. opportunityDocument state
  const [opportunityDocument, setOpportunityDocument] = useState<OpportunityDocumentState | null>(null);

  // 4. extractedOpportunity state
  const [extractedOpportunity, setExtractedOpportunity] = useState<OpportunityAnalysis | null>(null);

  // 5. eligibilityAnalysis state
  const [eligibilityAnalysis, setEligibilityAnalysis] = useState<EligibilityAnalysis | null>(null);

  // 6. analysisStatus state
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineMessage, setPipelineMessage] = useState('');

  // 7. analysisErrors state
  const [analysisErrors, setAnalysisErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 8. finalReport state
  const [finalReport, setFinalReport] = useState<FullAnalysisResult | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<FullAnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Save profile to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(studentProfile));
    } catch {
      // ignore
    }
  }, [studentProfile]);

  // Save opportunity input to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_OPP_KEY, JSON.stringify(opportunityInput));
    } catch {
      // ignore
    }
  }, [opportunityInput]);

  // Save recent analyses
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(recentAnalyses.slice(0, 10)));
    } catch {
      // ignore
    }
  }, [recentAnalyses]);

  // Initial load
  useEffect(() => {
    checkServerHealth()
      .then(setServerHealth)
      .catch(err => console.warn('Server health check notice:', err));

    fetchSamples()
      .then(data => {
        setSampleProfiles(data.profiles || {});
        setSampleOpportunities(data.opportunities || []);
        if (data.precomputedDemo) {
          setPrecomputedDemo(data.precomputedDemo);
        }
      })
      .catch(err => console.warn('Could not load samples:', err));
  }, []);

  const updateProfileField = <K extends keyof StudentProfile>(field: K, value: StudentProfile[K]) => {
    setStudentProfile(prev => ({ ...prev, [field]: value }));
  };

  const resetProfileToDefault = () => {
    setStudentProfile(DEFAULT_PROFILE);
  };

  const loadSampleProfile = (profileId: string) => {
    if (sampleProfiles[profileId]) {
      setStudentProfile(sampleProfiles[profileId]);
    }
  };

  const loadDemoAnalysis = () => {
    if (precomputedDemo) {
      setFinalReport(precomputedDemo);
      setExtractedOpportunity(precomputedDemo.opportunity);
      setEligibilityAnalysis(precomputedDemo.eligibility);
      setActiveTab('results');
    }
  };

  const runAnalysis = async (
    rawText: string,
    profileOverride?: StudentProfile,
    allowFallback?: boolean
  ): Promise<FullAnalysisResult> => {
    setError(null);
    setAnalysisErrors([]);
    setAnalysisStatus('reading');
    setPipelineStep(1);
    setPipelineMessage('Reading opportunity text and validating input...');

    const activeStud = profileOverride || studentProfile;

    // Validate active student profile fields upfront to produce actionable guidance
    const profileWarnings: string[] = [];
    if (!activeStud.gpa || activeStud.gpa <= 0) {
      profileWarnings.push('Your profile is missing cumulative GPA. Cannot deterministically verify against GPA minimums.');
    }
    if (!activeStud.expectedGraduationYear) {
      profileWarnings.push('Some eligibility requirements cannot be verified because your profile is missing graduation year.');
    }
    if (!activeStud.currentDegree) {
      profileWarnings.push('Some eligibility requirements cannot be verified because your profile is missing current degree.');
    }
    if (!activeStud.fieldOfStudy) {
      profileWarnings.push('Cannot verify academic major alignment because your profile is missing field of study.');
    }
    if (!activeStud.nationality && !activeStud.country) {
      profileWarnings.push('Cannot verify citizenship/regional eligibility because your profile is missing nationality/country.');
    }
    if (profileWarnings.length > 0) {
      setAnalysisErrors(profileWarnings);
    }

    // Step 2: Extracting requirements
    const timer1 = setTimeout(() => {
      setAnalysisStatus('extracting');
      setPipelineStep(2);
      setPipelineMessage('Stage 1 (Opportunity Analyzer): Extracting requirements & locking verbatim evidence snippets...');
    }, 600);

    const timer2 = setTimeout(() => {
      setAnalysisStatus('checking_eligibility');
      setPipelineStep(3);
      setPipelineMessage('Stage 2 (Eligibility Analyzer): Executing deterministic mathematical & cohort checks...');
    }, 1800);

    const timer3 = setTimeout(() => {
      setPipelineStep(4);
      setPipelineMessage('Stage 3 (Profile Match Agent): Analyzing background alignment without acceptance speculation...');
    }, 3200);

    const timer4 = setTimeout(() => {
      setPipelineStep(5);
      setPipelineMessage('Stage 4 (Application Planner Agent): Structuring priority tasks and document readiness...');
    }, 4600);

    const timer5 = setTimeout(() => {
      setPipelineStep(6);
      setPipelineMessage('Stage 5 (Verification Agent): Running adversarial integrity cross-examination...');
    }, 6000);

    try {
      const result = await runAnalysisPipeline(rawText, activeStud, allowFallback);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);

      setAnalysisStatus('completed');
      setPipelineStep(6);
      if (result.aiAnalysisFailed) {
        setPipelineMessage('Deterministic evaluation complete (AI analysis could not be completed).');
      } else {
        setPipelineMessage('Full 5-stage agent pipeline verified: Report generated successfully.');
      }

      setExtractedOpportunity(result.opportunity);
      setEligibilityAnalysis(result.eligibility);
      setFinalReport(result);
      setRecentAnalyses(prev => [result, ...prev.filter(r => r.id !== result.id)].slice(0, 10));

      // Automatically navigate to Results page as required by Section 7
      setActiveTab('results');
      return result;
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      setAnalysisStatus('error');
      const msg = err?.message || 'Analysis could not be completed.';
      setError(msg);
      setAnalysisErrors(prev => [msg, ...prev]);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,

        // studentProfile
        studentProfile,
        setStudentProfile,
        currentProfile: studentProfile,
        setCurrentProfile: setStudentProfile,
        updateProfileField,
        resetProfileToDefault,

        // opportunityInput
        opportunityInput,
        setOpportunityInput,

        // opportunityDocument
        opportunityDocument,
        setOpportunityDocument,

        // extractedOpportunity
        extractedOpportunity,
        setExtractedOpportunity,

        // eligibilityAnalysis
        eligibilityAnalysis,
        setEligibilityAnalysis,

        // analysisStatus
        analysisStatus,
        setAnalysisStatus,
        isAnalyzing: analysisStatus === 'reading' || analysisStatus === 'extracting' || analysisStatus === 'checking_eligibility',
        pipelineStep,
        pipelineMessage,

        // analysisErrors
        analysisErrors,
        setAnalysisErrors,
        clearAnalysisErrors: () => setAnalysisErrors([]),
        error,
        clearError: () => setError(null),

        // finalReport
        finalReport,
        setFinalReport,
        currentAnalysis: finalReport,
        setCurrentAnalysis: setFinalReport,
        recentAnalyses,

        // Helpers & Samples
        sampleProfiles,
        sampleOpportunities,
        runAnalysis,
        loadDemoAnalysis,
        loadSampleProfile,
        serverHealth
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
