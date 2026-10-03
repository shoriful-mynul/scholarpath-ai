export interface InternshipExperience {
  role: string;
  organization: string;
  duration: string;
  description: string;
}

export interface ResearchExperience {
  title: string;
  labOrMentor: string;
  description: string;
  publicationsOrOutcomes?: string;
}

export interface StudentProject {
  title: string;
  techStack: string[];
  description: string;
  linkOrProof?: string;
}

export interface LeadershipExperience {
  role: string;
  organization: string;
  description: string;
}

export interface CertificationAward {
  name: string;
  issuer: string;
  year: string;
}

export interface StudentProfile {
  id?: string;
  name: string;
  country: string;
  nationality: string;
  age?: number | null;
  currentDegree: string;
  fieldOfStudy: string;
  university: string;
  currentYearOrSemester: string;
  gpa: number;
  maxGpa: number;
  expectedGraduationYear: number;
  technicalSkills: string[];
  programmingLanguages: string[];
  aiMlSkills: string[];
  otherSkills: string[];
  internships: InternshipExperience[];
  researchExperience: ResearchExperience[];
  projects: StudentProject[];
  leadership: LeadershipExperience[];
  certificationsAwards: CertificationAward[];
}

export type RequirementCategory =
  | 'gpa'
  | 'nationality'
  | 'degree_level'
  | 'field_of_study'
  | 'year_semester'
  | 'age'
  | 'language'
  | 'documents'
  | 'other';

export interface ExtractedRequirement {
  id: string;
  category: RequirementCategory;
  label: string;
  requirementText: string;
  evidenceSnippet: string; // Exact snippet from source text
  minimumGpa?: number;
  gpaScale?: number;
  eligibleCountries?: string[];
  eligibleDegrees?: string[];
  eligibleFields?: string[];
  eligibleLevels?: string[];
  isMandatory: boolean;
}

export interface OpportunityEvidenceItem {
  requirement: string;
  snippet: string;
  category?: string;
}

export interface OpportunityAnalysis {
  opportunityName: string;
  organization: string;
  type: 'Scholarship' | 'Internship' | 'Fellowship' | 'Competition' | 'Research Program' | 'Grant' | 'Other';
  deadline: string;
  deadlineDate?: string | null;
  location?: string;
  awardOrCompensation?: string;
  summary: string;
  eligibleCountries: string[];
  eligibleNationalities?: string[];
  academicRequirements: string[];
  gpaRequirements: string[];
  degreeRequirements: string[];
  yearRequirements: string[];
  ageRequirements: string[];
  requiredDocuments: string[];
  requiredDocumentDetails?: Array<{
    name: string;
    details: string;
    evidenceSnippet: string;
    isMandatory: boolean;
  }>;
  languageRequirements: string[];
  otherRequirements: string[];
  evidence: OpportunityEvidenceItem[];
  degreeLevels?: string[];
  fieldsOfStudy?: string[];
  gpaRequirement?: {
    minimumGpa: number;
    scale: number;
    evidenceSnippet: string;
  } | null;
  allRequirements: ExtractedRequirement[];
  rawTextLength: number;
  aiFailed?: boolean;
  aiFailureReason?: string;
}

export type EligibilityStatus = 'MET' | 'NOT_MET' | 'NEEDS_VERIFICATION' | 'Met' | 'Not Met' | 'Needs Verification';

export interface EligibilityCriterionResult {
  id: string;
  requirement: string;
  requirementLabel: string;
  requirementDetail: string;
  studentInformation: string;
  studentValue: string;
  status: 'MET' | 'NOT_MET' | 'NEEDS_VERIFICATION';
  evidence: string;
  evidenceSnippet: string;
  explanation: string;
  reasoning: string;
  isDeterministic: boolean;
  requirementCategory?: RequirementCategory;
  category?: string;
}

export interface EligibilityAnalysis {
  overallStatus: EligibilityStatus;
  metCount: number;
  notMetCount: number;
  needsVerificationCount: number;
  totalCriteriaCount: number;
  criteriaResults: EligibilityCriterionResult[];
  hardBlockers: string[];
  summary: string;
}

export interface MatchPillar {
  category: 'Education' | 'Skills' | 'Research' | 'Projects' | 'Leadership' | 'Awards';
  scoreLevel: 'High' | 'Moderate' | 'Developing';
  title: string;
  description: string;
  studentEvidence: string;
  opportunityExpectation: string;
}

export interface OpportunityMatchAnalysis {
  compatibilityTier: 'Strong Alignment' | 'Competitive Match' | 'Selective / Stretch Match' | 'Significant Gaps';
  compatibilitySummary: string;
  strongMatches: string[];
  relevantExperience: string[];
  relevantSkills: string[];
  areasToStrengthen: string[];
  growthAreas: string[];
  pillars: MatchPillar[];
  transparentDisclaimer: string;
}

export interface ActionPlanTask {
  id: string;
  title: string;
  category: 'Document Prep' | 'Eligibility Resolution' | 'Writing & Essays' | 'Skill Showcase' | 'Review & Submission';
  priority: 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  timelinePhase: 'Immediate (Week 1)' | 'Phase 2: Drafting & Assembly' | 'Phase 3: Feedback & Polish' | 'Phase 4: Submission';
  description: string;
  targetDeadline?: string;
  completed?: boolean;
}

export interface ApplicationPlan {
  missingDocuments: string[];
  missingRequirements: string[];
  skillsToHighlight: string[];
  projectsToEmphasize: string[];
  recommendedPreparationSequence: string[];
  tasks: ActionPlanTask[];
  estimatedTotalHours: number;
  submissionReadinessScore: number; // 0 - 100
}

export interface ProvenanceItem {
  claim: string;
  sourceType: 'Source Opportunity' | 'Student Profile' | 'AI Synthesis';
  referenceSnippet: string;
  verified: boolean;
}

export interface VerificationWarning {
  type: 'Unsupported Claim' | 'Missing Evidence' | 'Potential Contradiction' | 'Ambiguous Term' | 'Strict Policy Notice';
  severity: 'Warning' | 'Caution' | 'Advisory';
  message: string;
  affectedArea: string;
  recommendation: string;
}

export interface VerificationReport {
  auditStatus: 'Passed with Cautions' | 'Verified Compliant' | 'Action Needed';
  confidenceScore: number; // e.g. 94%
  detectedWarnings: VerificationWarning[];
  provenanceMap: ProvenanceItem[];
  hallucinationAuditSummary: string;
  finalStatement: string;
}

export interface ProfileMatchStrongMatch {
  area: string;
  studentEvidence: string;
  opportunityRelevance: string;
  reasoning: string;
}

export interface ProfileMatchRelevantExperience {
  experience: string;
  relevance: string;
  evidence: string;
}

export interface ProfileMatchRelevantSkill {
  skill: string;
  relevance: string;
}

export interface ProfileMatchGap {
  area: string;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ProfileMatchResult {
  strongMatches: ProfileMatchStrongMatch[];
  relevantExperience: ProfileMatchRelevantExperience[];
  relevantSkills: ProfileMatchRelevantSkill[];
  gaps: ProfileMatchGap[];
  summary: string;
  aiFailed?: boolean;
  aiFailureReason?: string;
}

export interface ApplicationPlanPriorityTask {
  task: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  relatedRequirement: string;
  suggestedOrder: number;
}

export interface ApplicationPlanDocument {
  document: string;
  status: 'LIKELY_AVAILABLE' | 'NEEDS_PREPARATION' | 'UNKNOWN';
  reason: string;
}

export interface ApplicationPlanProfileHighlight {
  item: string;
  reason: string;
}

export interface ApplicationPlanRequirementToVerify {
  requirement: string;
  reason: string;
}

export interface ApplicationPlanResult {
  priorityTasks: ApplicationPlanPriorityTask[];
  documents: ApplicationPlanDocument[];
  profileHighlights: ApplicationPlanProfileHighlight[];
  requirementsToVerify: ApplicationPlanRequirementToVerify[];
  deadline: string;
  deadlineNotes: string;
  aiFailed?: boolean;
  aiFailureReason?: string;
}

export interface VerificationFlag {
  category: 'UNSUPPORTED_CLAIM' | 'HALLUCINATED_REQUIREMENT' | 'CONTRADICTION' | 'AMBIGUOUS_DEADLINE' | 'MISSING_VERIFICATION_FLAG';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  claimedBy: 'PROFILE_MATCH' | 'APPLICATION_PLANNER' | 'ELIGIBILITY_ANALYZER' | 'OPPORTUNITY_ANALYZER';
  claim: string;
  explanation: string;
  correction: string;
}

export interface VerificationResult {
  auditStatus: 'VERIFIED_COMPLIANT' | 'PASSED_WITH_CAUTIONS' | 'ACTION_NEEDED' | 'Verified Compliant' | 'Passed with Cautions' | 'Action Needed';
  confidenceScore: number;
  issuesFound?: boolean;
  flags?: VerificationFlag[];
  auditSummary?: string;
  finalAssessment?: string;
  detectedWarnings?: VerificationWarning[];
  provenanceMap?: ProvenanceItem[];
  hallucinationAuditSummary?: string;
  finalStatement?: string;
  aiFailed?: boolean;
  aiFailureReason?: string;
}

export interface FullAnalysisResult {
  id: string;
  createdAt: string;
  opportunity: OpportunityAnalysis;
  eligibility: EligibilityAnalysis;
  profileMatch?: ProfileMatchResult;
  applicationPlan?: ApplicationPlanResult;
  verification: VerificationResult;
  match: OpportunityMatchAnalysis;
  plan: ApplicationPlan;
  studentName: string;
  opportunityName: string;
  isDemoFallback?: boolean;
  aiAnalysisFailed?: boolean;
  aiFailureReason?: string;
}
