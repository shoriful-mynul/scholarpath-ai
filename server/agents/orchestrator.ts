import { GoogleGenAI } from '@google/genai';
import {
  StudentProfile,
  FullAnalysisResult,
  OpportunityMatchAnalysis,
  OpportunityAnalysis,
  EligibilityAnalysis,
  ProfileMatchResult,
  ApplicationPlanResult,
  VerificationResult
} from './types';
import { runOpportunityAnalyzer } from './opportunityAnalyzer';
import { runEligibilityAnalyzer } from './eligibilityAnalyzer';
import { runProfileMatchAgent } from './profileMatchAgent';
import { runApplicationPlanner, adaptToLegacyPlan } from './applicationPlanner';
import { runVerificationAgent } from './verificationAgent';

/**
 * ScholarPath AI Multi-Agent Pipeline
 * 
 * Complete 5-stage sequential workflow:
 * Student Profile
 * → Stage 1: Opportunity Analyzer
 * → Stage 2: Eligibility Analyzer (Deterministic Engine)
 * → Stage 3: Profile Match Agent
 * → Stage 4: Application Planner Agent
 * → Stage 5: Verification Agent (Adversarial Integrity Auditor)
 * → Final Report
 */
export async function runScholarPathPipeline(
  rawOpportunityText: string,
  student: StudentProfile,
  aiClient?: GoogleGenAI,
  options?: { allowFallback?: boolean }
): Promise<FullAnalysisResult> {
  const startTime = Date.now();
  console.log(`[ScholarPath Pipeline] Starting 5-agent execution for student "${student.name}"...`);

  // Stage 1: Opportunity Analyzer
  console.log('[ScholarPath Pipeline] Running Stage 1: Opportunity Analyzer...');
  const opportunity: OpportunityAnalysis = await runOpportunityAnalyzer(rawOpportunityText, aiClient, options);

  // Stage 2: Eligibility Analyzer (Strict deterministic code checks)
  console.log('[ScholarPath Pipeline] Running Stage 2: Deterministic Eligibility Analyzer...');
  const eligibility: EligibilityAnalysis = runEligibilityAnalyzer(student, opportunity);

  // Stage 3: Profile Match Agent
  console.log('[ScholarPath Pipeline] Running Stage 3: Profile Match Agent...');
  const profileMatch: ProfileMatchResult = await runProfileMatchAgent(student, opportunity, eligibility, aiClient, options);

  // Stage 4: Application Planner Agent
  console.log('[ScholarPath Pipeline] Running Stage 4: Application Planner Agent...');
  const applicationPlan: ApplicationPlanResult = await runApplicationPlanner(student, opportunity, eligibility, profileMatch, aiClient, options);

  // Stage 5: Verification Agent (Adversarial Integrity Auditor)
  console.log('[ScholarPath Pipeline] Running Stage 5: Verification Agent...');
  const verification: VerificationResult = await runVerificationAgent(student, opportunity, eligibility, profileMatch, applicationPlan, aiClient);

  const aiAnalysisFailed = Boolean(
    opportunity.aiFailed || profileMatch.aiFailed || applicationPlan.aiFailed || verification.aiFailed
  );
  const aiFailureReason =
    opportunity.aiFailureReason || profileMatch.aiFailureReason || applicationPlan.aiFailureReason;

  // Adapter for backwards-compatibility with views expecting legacy match / plan shapes
  const match: OpportunityMatchAnalysis = {
    compatibilityTier: eligibility.overallStatus === 'MET' ? 'Strong Alignment' : eligibility.overallStatus === 'NEEDS_VERIFICATION' ? 'Competitive Match' : 'Selective / Stretch Match',
    compatibilitySummary: profileMatch.summary,
    strongMatches: profileMatch.strongMatches.map(m => `${m.area}: ${m.studentEvidence}`),
    relevantExperience: profileMatch.relevantExperience.map(e => `${e.experience}: ${e.relevance}`),
    relevantSkills: profileMatch.relevantSkills.map(s => s.skill),
    areasToStrengthen: profileMatch.gaps.map(g => `${g.area}: ${g.reason}`),
    growthAreas: profileMatch.gaps.filter(g => g.severity === 'HIGH' || g.severity === 'MEDIUM').map(g => `${g.area} (${g.severity}): ${g.reason}`),
    pillars: [
      {
        category: 'Education',
        scoreLevel: student.gpa >= 3.5 ? 'High' : 'Moderate',
        title: 'Academic Standing & Major',
        description: `Enrolled in ${student.currentDegree || 'Degree'} (${student.fieldOfStudy || 'Field'}) at ${student.university || 'University'}.`,
        studentEvidence: `GPA ${student.gpa ? student.gpa.toFixed(2) : 'N/A'}, Expected Graduation: ${student.expectedGraduationYear || 'N/A'}`,
        opportunityExpectation: opportunity.gpaRequirement ? `Min GPA: ${opportunity.gpaRequirement.minimumGpa}` : 'Good academic standing'
      },
      {
        category: 'Skills',
        scoreLevel: profileMatch.relevantSkills.length >= 3 ? 'High' : 'Moderate',
        title: 'Technical & Subject Competencies',
        description: `Skills matched: ${profileMatch.relevantSkills.slice(0, 4).map(s => s.skill).join(', ') || 'Core competencies'}.`,
        studentEvidence: profileMatch.relevantSkills.map(s => s.skill).join(', ') || 'Submitted technical profile',
        opportunityExpectation: 'Proficiency in relevant domain tools and methods'
      }
    ],
    transparentDisclaimer: 'This profile alignment measures factual background compatibility with extracted criteria. It is an advisory evaluation tool, not an official prediction or guarantee of acceptance or funding.'
  };

  const plan = adaptToLegacyPlan(applicationPlan);

  const durationMs = Date.now() - startTime;
  console.log(`[ScholarPath Pipeline] Complete 5-stage pipeline finished in ${durationMs}ms.`);

  return {
    id: `analysis_${Date.now()}`,
    createdAt: new Date().toISOString(),
    opportunity,
    eligibility,
    profileMatch,
    applicationPlan,
    verification,
    match,
    plan,
    studentName: student.name,
    opportunityName: opportunity.opportunityName,
    isDemoFallback: !process.env.GEMINI_API_KEY || aiAnalysisFailed,
    aiAnalysisFailed,
    aiFailureReason
  };
}
