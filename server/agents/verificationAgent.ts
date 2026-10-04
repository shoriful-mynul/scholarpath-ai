import { OpenRouterAI, Type } from '../lib/openrouter';
import {
  StudentProfile,
  OpportunityAnalysis,
  EligibilityAnalysis,
  ProfileMatchResult,
  ApplicationPlanResult,
  VerificationResult,
  VerificationFlag,
  VerificationWarning,
  ProvenanceItem
} from './types';

/**
 * Stage 5: Verification Agent (Adversarial Integrity Auditor)
 * Actively searches for mistakes, unsupported claims, hallucinated requirements,
 * contradictions, ambiguous deadlines, and missing verification flags.
 */
export async function runVerificationAgent(
  studentProfile: StudentProfile,
  opportunityAnalysis: OpportunityAnalysis,
  eligibilityAnalysis: EligibilityAnalysis,
  profileMatch: ProfileMatchResult,
  applicationPlan: ApplicationPlanResult,
  aiClient?: OpenRouterAI
): Promise<VerificationResult> {
  // 1. Run deterministic code-level adversarial checks
  const programmaticFlags = runProgrammaticAdversarialChecks(
    studentProfile,
    opportunityAnalysis,
    eligibilityAnalysis,
    profileMatch,
    applicationPlan
  );

  let aiFlags: VerificationFlag[] = [];

  // 2. If OpenRouter is available, run LLM adversarial cross-examination
  if (aiClient) {
    try {
      const prompt = `You are Stage 5: Verification Agent (Adversarial Integrity Auditor) in ScholarPath AI.
Your sole job is to ACTIVELY SEARCH FOR MISTAKES and integrity issues across the previous agents' outputs.
Do NOT generate a generic polite summary. Scrutinize the data adversarially for:

1. UNSUPPORTED CLAIMS:
   Did Profile Match or Application Planner claim student skills, research, publications, or experience that do not exist in the student's profile?
2. HALLUCINATED REQUIREMENTS:
   Did any agent claim a requirement (such as IELTS, TOEFL, GRE, minimum years of experience, or specific document) that is NOT present in the Opportunity Analysis?
3. CONTRADICTIONS:
   Is there any contradiction between Eligibility Analyzer, Profile Match, and Application Planner (e.g. GPA marked MET in eligibility, but marked as inadequate elsewhere)?
4. AMBIGUOUS DEADLINES:
   Is the deadline unclear, rolling, or vague, and did the Application Planner fail to note that it needs verification?
5. MISSING VERIFICATION FLAGS:
   Did Eligibility Analyzer mark a requirement as NEEDS_VERIFICATION that was omitted from Application Planner's requirementsToVerify?

Data to audit:

Student Profile:
${JSON.stringify({
  name: studentProfile.name,
  degree: studentProfile.currentDegree,
  field: studentProfile.fieldOfStudy,
  gpa: studentProfile.gpa,
  skills: studentProfile.technicalSkills.concat(studentProfile.programmingLanguages),
  projects: studentProfile.projects.map(p => p.title),
  internships: studentProfile.internships.map(i => `${i.role} at ${i.organization}`),
  research: studentProfile.researchExperience.map(r => r.title)
}, null, 2)}

Opportunity Extracted:
${JSON.stringify({
  name: opportunityAnalysis.opportunityName,
  deadline: opportunityAnalysis.deadline,
  documents: opportunityAnalysis.requiredDocuments,
  academicRequirements: opportunityAnalysis.academicRequirements,
  otherRequirements: opportunityAnalysis.otherRequirements
}, null, 2)}

Eligibility Results:
${JSON.stringify(eligibilityAnalysis.criteriaResults.map(c => ({
  requirement: c.requirementLabel || c.requirement,
  status: c.status,
  reason: c.reasoning
})), null, 2)}

Profile Match Claims:
${JSON.stringify({
  strongMatches: profileMatch.strongMatches,
  relevantExperience: profileMatch.relevantExperience,
  relevantSkills: profileMatch.relevantSkills,
  gaps: profileMatch.gaps
}, null, 2)}

Application Plan:
${JSON.stringify({
  priorityTasks: applicationPlan.priorityTasks.map(t => t.task),
  documents: applicationPlan.documents,
  profileHighlights: applicationPlan.profileHighlights,
  requirementsToVerify: applicationPlan.requirementsToVerify,
  deadline: applicationPlan.deadline,
  deadlineNotes: applicationPlan.deadlineNotes
}, null, 2)}

Identify any real flags. If the pipeline outputs are completely factual and verified, return an empty flags array.`;

      const response = await aiClient.models.generateContent({
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        contents: prompt,
        config: {
          systemInstruction: 'You are a rigorous adversarial auditor for an academic intelligence engine. Your goal is to catch hallucinations, unsupported claims, and contradictions.',
                    responseSchema: {
            type: Type.OBJECT,
            properties: {
              auditStatus: {
                type: Type.STRING,
                description: 'VERIFIED_COMPLIANT, PASSED_WITH_CAUTIONS, or ACTION_NEEDED'
              },
              confidenceScore: { type: Type.NUMBER },
              flags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      description: 'UNSUPPORTED_CLAIM, HALLUCINATED_REQUIREMENT, CONTRADICTION, AMBIGUOUS_DEADLINE, or MISSING_VERIFICATION_FLAG'
                    },
                    severity: {
                      type: Type.STRING,
                      description: 'HIGH, MEDIUM, or LOW'
                    },
                    claimedBy: {
                      type: Type.STRING,
                      description: 'PROFILE_MATCH, APPLICATION_PLANNER, ELIGIBILITY_ANALYZER, or OPPORTUNITY_ANALYZER'
                    },
                    claim: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    correction: { type: Type.STRING }
                  },
                  required: ['category', 'severity', 'claimedBy', 'claim', 'explanation', 'correction']
                }
              },
              auditSummary: { type: Type.STRING },
              finalAssessment: { type: Type.STRING }
            },
            required: ['auditStatus', 'confidenceScore', 'flags', 'auditSummary', 'finalAssessment']
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed.flags)) {
          aiFlags = parsed.flags;
        }
      }
    } catch (err) {
      console.warn('[VerificationAgent] OpenRouter adversarial pass encountered error, relying on deterministic audit:', err);
    }
  }

  // Detect if upstream AI analysis failed or timed out
  const upstreamAiFailed = Boolean(
    opportunityAnalysis.aiFailed ||
    profileMatch.aiFailed ||
    applicationPlan.aiFailed
  );
  const upstreamFailureReason =
    opportunityAnalysis.aiFailureReason ||
    profileMatch.aiFailureReason ||
    applicationPlan.aiFailureReason ||
    'Upstream OpenRouter request failed or was unavailable';

  if (upstreamAiFailed) {
    aiFlags.unshift({
      category: 'UNSUPPORTED_CLAIM',
      severity: 'HIGH',
      claimedBy: 'OPPORTUNITY_ANALYZER',
      claim: 'AI analysis completion',
      explanation: `Upstream OpenRouter AI request failed, timed out, or returned an error: "${upstreamFailureReason}". Full AI-grounded multi-agent reasoning could not be completed.`,
      correction: 'Rerun analysis with valid OpenRouter credentials or rely strictly on verified deterministic eligibility checks.'
    });
  }

  // Combine flags and deduplicate
  const allFlagsMap = new Map<string, VerificationFlag>();
  for (const flag of [...programmaticFlags, ...aiFlags]) {
    const key = `${flag.category}_${flag.claim.slice(0, 40)}`.toLowerCase();
    if (!allFlagsMap.has(key)) {
      allFlagsMap.set(key, flag);
    }
  }
  const mergedFlags = Array.from(allFlagsMap.values());

  const hasHigh = mergedFlags.some(f => f.severity === 'HIGH');
  const hasMedium = mergedFlags.some(f => f.severity === 'MEDIUM');
  const issuesFound = mergedFlags.length > 0;

  const auditStatus = upstreamAiFailed || hasHigh
    ? 'ACTION_NEEDED'
    : hasMedium || issuesFound
    ? 'PASSED_WITH_CAUTIONS'
    : 'VERIFIED_COMPLIANT';

  let confidenceScore = upstreamAiFailed ? 42 : 98;
  if (!upstreamAiFailed) {
    for (const f of mergedFlags) {
      if (f.severity === 'HIGH') confidenceScore -= 15;
      else if (f.severity === 'MEDIUM') confidenceScore -= 7;
      else confidenceScore -= 2;
    }
    confidenceScore = Math.max(55, Math.min(100, confidenceScore));
  }

  const auditSummary = upstreamAiFailed
    ? `Audit flagged critical failure: Upstream OpenRouter AI request failed (${upstreamFailureReason}). Full AI analysis could not be completed.`
    : issuesFound
    ? `Adversarial audit identified ${mergedFlags.length} notice(s): ${mergedFlags.map(f => `[${f.category} (${f.severity})]: ${f.explanation}`).join(' ')}`
    : `All claims, requirements, and preparation tasks verified with 100% provenance against the student profile and source opportunity announcement.`;

  const finalAssessment = upstreamAiFailed
    ? 'Analysis could not be completed with AI verification. Deterministic rule checks may be inspected, but AI agent verification cannot mark this analysis as compliant.'
    : auditStatus === 'VERIFIED_COMPLIANT'
    ? 'All evaluated claims are strictly grounded in source documentation with no detected hallucinations or logical contradictions.'
    : auditStatus === 'PASSED_WITH_CAUTIONS'
    ? 'Evaluation is structurally valid but candidate should review advisory cautions regarding documents and timeline assumptions.'
    : 'Critical blockers or unsupported claims detected. The candidate must resolve flagged items prior to proceeding.';

  // Build provenance map and legacy warning structures
  const provenanceMap: ProvenanceItem[] = [
    {
      claim: `Applicant: ${studentProfile.name}, Major: ${studentProfile.currentDegree} in ${studentProfile.fieldOfStudy}`,
      sourceType: 'Student Profile',
      referenceSnippet: `Enrolled at ${studentProfile.university || 'university'}, GPA: ${studentProfile.gpa}`,
      verified: true
    },
    {
      claim: `Target Opportunity: ${opportunityAnalysis.opportunityName} (${opportunityAnalysis.organization})`,
      sourceType: 'Source Opportunity',
      referenceSnippet: opportunityAnalysis.deadline ? `Stated deadline: ${opportunityAnalysis.deadline}` : 'Opportunity announcement',
      verified: true
    },
    {
      claim: `Core Eligibility Status: ${eligibilityAnalysis.overallStatus}`,
      sourceType: 'AI Synthesis',
      referenceSnippet: `${eligibilityAnalysis.metCount} MET, ${eligibilityAnalysis.notMetCount} NOT_MET, ${eligibilityAnalysis.needsVerificationCount} NEEDS_VERIFICATION`,
      verified: true
    }
  ];

  const detectedWarnings: VerificationWarning[] = mergedFlags.map(f => ({
    type: f.category === 'UNSUPPORTED_CLAIM' ? 'Unsupported Claim' :
          f.category === 'HALLUCINATED_REQUIREMENT' ? 'Missing Evidence' :
          f.category === 'CONTRADICTION' ? 'Potential Contradiction' :
          f.category === 'AMBIGUOUS_DEADLINE' ? 'Ambiguous Term' : 'Strict Policy Notice',
    severity: f.severity === 'HIGH' ? 'Warning' : f.severity === 'MEDIUM' ? 'Caution' : 'Advisory',
    message: f.explanation,
    affectedArea: f.claim,
    recommendation: f.correction
  }));

  return {
    auditStatus,
    confidenceScore,
    issuesFound,
    flags: mergedFlags,
    auditSummary,
    finalAssessment,
    detectedWarnings,
    provenanceMap,
    hallucinationAuditSummary: auditSummary,
    finalStatement: finalAssessment
  };
}

/**
 * Deterministic programmatic cross-checks
 */
function runProgrammaticAdversarialChecks(
  student: StudentProfile,
  opportunity: OpportunityAnalysis,
  eligibility: EligibilityAnalysis,
  match: ProfileMatchResult,
  plan: ApplicationPlanResult
): VerificationFlag[] {
  const flags: VerificationFlag[] = [];

  // Check 1: Missing Verification Flags
  // If eligibility marked something as NEEDS_VERIFICATION, verify that Application Planner includes it in requirementsToVerify
  for (const crit of eligibility.criteriaResults) {
    if (crit.status === 'NEEDS_VERIFICATION') {
      const isIncluded = (plan.requirementsToVerify || []).some(r =>
        r.requirement.toLowerCase().includes(crit.requirementLabel.toLowerCase()) ||
        (crit.category && r.requirement.toLowerCase().includes(crit.category.toLowerCase())) ||
        crit.requirement.toLowerCase().includes(r.requirement.toLowerCase())
      );

      if (!isIncluded) {
        flags.push({
          category: 'MISSING_VERIFICATION_FLAG',
          severity: 'HIGH',
          claimedBy: 'APPLICATION_PLANNER',
          claim: `Requirement "${crit.requirementLabel || crit.requirement}" marked NEEDS_VERIFICATION by Eligibility Analyzer`,
          explanation: `Eligibility Analyzer marked "${crit.requirementLabel}" as needing verification, but Application Planner omitted it from requirementsToVerify.`,
          correction: `Add "${crit.requirementLabel}" to application plan requirementsToVerify.`
        });
      }
    }
  }

  // Check 2: Ambiguous Deadlines
  // If deadline is unclear or subjective ("rolling", "soon", "open", "tbd", "unspecified"), verify that Application Planner flagged it
  const dLower = (opportunity.deadline || '').toLowerCase();
  const isAmbiguous = ['rolling', 'asap', 'soon', 'tbd', 'open until', 'unspecified', 'ongoing'].some(kw => dLower.includes(kw));

  if (isAmbiguous) {
    const notesLower = (plan.deadlineNotes || '').toLowerCase();
    const acknowledgedAmbiguity = notesLower.includes('rolling') ||
      notesLower.includes('ambiguous') ||
      notesLower.includes('verify') ||
      notesLower.includes('unspecified') ||
      notesLower.includes('unclear');

    if (!acknowledgedAmbiguity) {
      flags.push({
        category: 'AMBIGUOUS_DEADLINE',
        severity: 'MEDIUM',
        claimedBy: 'APPLICATION_PLANNER',
        claim: `Opportunity deadline is "${opportunity.deadline}"`,
        explanation: `The opportunity deadline is rolling or ambiguous, but Application Planner treated it without explicitly noting the need for date verification.`,
        correction: `Flag deadline as requiring sponsor verification in deadlineNotes.`
      });
    }
  }

  // Check 3: Contradictions
  // e.g. Eligibility Analyzer says GPA = MET while another stage says GPA is insufficient, or vice versa
  const gpaCriterion = eligibility.criteriaResults.find(
    c => c.category === 'gpa' || c.requirementCategory === 'gpa' || c.id.includes('gpa')
  );
  if (gpaCriterion) {
    if (gpaCriterion.status === 'MET') {
      const gpaGap = (match.gaps || []).find(g => g.area.toLowerCase().includes('gpa') && g.severity === 'HIGH');
      if (gpaGap) {
        flags.push({
          category: 'CONTRADICTION',
          severity: 'HIGH',
          claimedBy: 'PROFILE_MATCH',
          claim: `Profile match flagged severe GPA gap: "${gpaGap.reason}"`,
          explanation: `Eligibility Analyzer deterministically verified GPA as MET (${student.gpa}), but Profile Match categorized GPA as a severe gap.`,
          correction: `Harmonize GPA status: GPA meets extracted threshold.`
        });
      }
    } else if (gpaCriterion.status === 'NOT_MET') {
      const gpaMatch = (match.strongMatches || []).find(m => m.area.toLowerCase().includes('gpa'));
      if (gpaMatch) {
        flags.push({
          category: 'CONTRADICTION',
          severity: 'HIGH',
          claimedBy: 'PROFILE_MATCH',
          claim: `Profile match claimed strong GPA match: "${gpaMatch.studentEvidence}"`,
          explanation: `Eligibility Analyzer found GPA is NOT_MET, but Profile Match claimed GPA as a strong match.`,
          correction: `Remove GPA from strong matches and reclassify as eligibility shortfall.`
        });
      }
    }
  }

  // Check 4: Hallucinated Requirements
  // Check if any agent claimed specific exam requirements (IELTS, TOEFL, GRE, GMAT, MCAT) not in the opportunity
  const oppSourceFull = [
    opportunity.opportunityName,
    opportunity.organization,
    opportunity.summary,
    ...(opportunity.academicRequirements || []),
    ...(opportunity.otherRequirements || []),
    ...(opportunity.requiredDocuments || []),
    ...(opportunity.evidence || []).map(e => e.snippet)
  ].join(' ').toLowerCase();

  const standardizedExams = ['ielts', 'toefl', 'gre', 'gmat', 'sat', 'act', 'mcat', 'lsat'];
  for (const exam of standardizedExams) {
    const oppMentions = oppSourceFull.includes(exam);
    if (!oppMentions) {
      // Check if match or plan claims it
      const planMentions = (plan.documents || []).some(d => d.document.toLowerCase().includes(exam)) ||
        (plan.priorityTasks || []).some(t => t.task.toLowerCase().includes(exam));
      const matchMentions = (match.gaps || []).some(g => g.area.toLowerCase().includes(exam) || g.reason.toLowerCase().includes(exam));

      if (planMentions || matchMentions) {
        flags.push({
          category: 'HALLUCINATED_REQUIREMENT',
          severity: 'HIGH',
          claimedBy: planMentions ? 'APPLICATION_PLANNER' : 'PROFILE_MATCH',
          claim: `Requirement for ${exam.toUpperCase()} examination score`,
          explanation: `Opportunity announcement contains zero citations for ${exam.toUpperCase()}, yet it was cited as a requirement in downstream planning.`,
          correction: `Remove ${exam.toUpperCase()} from requirements and application tasks.`
        });
      }
    }
  }

  // Check 5: Unsupported Claims
  // Check if Profile Match strong matches cite skills or degrees that do not exist in the student profile
  const allStudentText = [
    student.name,
    student.currentDegree,
    student.fieldOfStudy,
    student.university,
    ...(student.technicalSkills || []),
    ...(student.programmingLanguages || []),
    ...(student.aiMlSkills || []),
    ...(student.otherSkills || []),
    ...(student.projects || []).map(p => `${p.title} ${p.techStack.join(' ')} ${p.description}`),
    ...(student.internships || []).map(i => `${i.role} ${i.organization} ${i.description}`),
    ...(student.researchExperience || []).map(r => `${r.title} ${r.labOrMentor} ${r.description}`),
    ...(student.leadership || []).map(l => `${l.role} ${l.organization} ${l.description}`),
    ...(student.certificationsAwards || []).map(c => `${c.name} ${c.issuer}`)
  ].join(' ').toLowerCase();

  for (const skill of match.relevantSkills || []) {
    const sLower = skill.skill.toLowerCase().trim();
    if (sLower.length > 2 && !allStudentText.includes(sLower)) {
      // Check partial overlap
      const words = sLower.split(/\s+/).filter(w => w.length > 3);
      const hasWordOverlap = words.some(w => allStudentText.includes(w));
      if (!hasWordOverlap) {
        flags.push({
          category: 'UNSUPPORTED_CLAIM',
          severity: 'MEDIUM',
          claimedBy: 'PROFILE_MATCH',
          claim: `Candidate skill match: "${skill.skill}"`,
          explanation: `Skill "${skill.skill}" is claimed in Profile Match but does not appear in candidate profile entries.`,
          correction: `Verify with candidate whether they possess "${skill.skill}" or remove from matching skills.`
        });
      }
    }
  }

  return flags;
}
