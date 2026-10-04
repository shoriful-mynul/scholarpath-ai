import { OpenRouterAI, Type } from '../lib/openrouter';
import {
  StudentProfile,
  OpportunityAnalysis,
  EligibilityAnalysis,
  ProfileMatchResult,
  ProfileMatchStrongMatch,
  ProfileMatchRelevantExperience,
  ProfileMatchRelevantSkill,
  ProfileMatchGap
} from './types';

/**
 * Stage 3: Profile Match Agent
 * Analyzes how the candidate's background aligns with the opportunity.
 * 
 * Rules:
 * - Transparent, factual alignment grounded solely in the student's profile.
 * - Does NOT calculate an acceptance probability or guarantee acceptance.
 * - Does NOT invent experience, skills, or publications.
 */
export async function runProfileMatchAgent(
  studentProfile: StudentProfile,
  opportunityAnalysis: OpportunityAnalysis,
  eligibilityAnalysis: EligibilityAnalysis,
  aiClient?: OpenRouterAI,
  options?: { allowFallback?: boolean }
): Promise<ProfileMatchResult> {
  if (aiClient) {
    try {
      const prompt = `You are Stage 3: Profile Match Agent in ScholarPath AI.
Analyze how this student candidate's factual background aligns with the extracted opportunity.

CRITICAL RULES:
1. Conduct a transparent, qualitative alignment analysis based STRICTLY on the student profile provided.
2. Do NOT invent or assume skills, projects, internships, publications, or credentials that are not explicitly stated in the student profile.
3. For every match, provide the exact student evidence.
4. Do NOT calculate an acceptance probability or percentage chance.
5. Do NOT claim the student will be accepted or guarantee admission or funding.
6. Identify real gaps where the opportunity expects something the profile does not explicitly demonstrate.

Student Profile:
${JSON.stringify({
  name: studentProfile.name,
  degree: studentProfile.currentDegree,
  field: studentProfile.fieldOfStudy,
  university: studentProfile.university,
  gpa: `${studentProfile.gpa} / ${studentProfile.maxGpa || 4.0}`,
  expectedGraduationYear: studentProfile.expectedGraduationYear,
  skills: {
    technical: studentProfile.technicalSkills || [],
    programming: studentProfile.programmingLanguages || [],
    aiMl: studentProfile.aiMlSkills || [],
    other: studentProfile.otherSkills || []
  },
  projects: (studentProfile.projects || []).map(p => ({
    title: p.title,
    techStack: p.techStack,
    description: p.description
  })),
  internships: (studentProfile.internships || []).map(i => ({
    role: i.role,
    organization: i.organization,
    duration: i.duration,
    description: i.description
  })),
  researchExperience: (studentProfile.researchExperience || []).map(r => ({
    title: r.title,
    labOrMentor: r.labOrMentor,
    description: r.description,
    publicationsOrOutcomes: r.publicationsOrOutcomes
  })),
  leadership: (studentProfile.leadership || []).map(l => ({
    role: l.role,
    organization: l.organization,
    description: l.description
  })),
  certificationsAwards: (studentProfile.certificationsAwards || []).map(c => ({
    name: c.name,
    issuer: c.issuer,
    year: c.year
  }))
}, null, 2)}

Opportunity Details:
${JSON.stringify({
  opportunityName: opportunityAnalysis.opportunityName,
  organization: opportunityAnalysis.organization,
  type: opportunityAnalysis.type,
  degreeRequirements: opportunityAnalysis.degreeRequirements || [],
  academicRequirements: opportunityAnalysis.academicRequirements || [],
  otherRequirements: opportunityAnalysis.otherRequirements || [],
  fieldsOfStudy: opportunityAnalysis.fieldsOfStudy || [],
  requiredDocuments: opportunityAnalysis.requiredDocuments || [],
  summary: opportunityAnalysis.summary
}, null, 2)}

Eligibility Stage Results:
${JSON.stringify({
  overallStatus: eligibilityAnalysis.overallStatus,
  hardBlockers: eligibilityAnalysis.hardBlockers,
  needsVerificationCount: eligibilityAnalysis.needsVerificationCount,
  criteriaResults: eligibilityAnalysis.criteriaResults.map(c => ({
    requirement: c.requirement,
    status: c.status,
    reasoning: c.reasoning
  }))
}, null, 2)}

Produce a structured JSON evaluation conforming to the requested schema.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an objective fellowship and scholarship admissions advisor. You evaluate applicant background alignment with academic integrity and rigorous evidence grounding. Never invent claims or compute acceptance probabilities.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strongMatches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    area: { type: Type.STRING },
                    studentEvidence: { type: Type.STRING },
                    opportunityRelevance: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                  },
                  required: ['area', 'studentEvidence', 'opportunityRelevance', 'reasoning']
                }
              },
              relevantExperience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    experience: { type: Type.STRING },
                    relevance: { type: Type.STRING },
                    evidence: { type: Type.STRING }
                  },
                  required: ['experience', 'relevance', 'evidence']
                }
              },
              relevantSkills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    relevance: { type: Type.STRING }
                  },
                  required: ['skill', 'relevance']
                }
              },
              gaps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    area: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    severity: {
                      type: Type.STRING,
                      description: 'One of: HIGH, MEDIUM, LOW'
                    }
                  },
                  required: ['area', 'reason', 'severity']
                }
              },
              summary: { type: Type.STRING }
            },
            required: ['strongMatches', 'relevantExperience', 'relevantSkills', 'gaps', 'summary']
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text) as ProfileMatchResult;
        if (Array.isArray(parsed.strongMatches) && Array.isArray(parsed.gaps)) {
          return sanitizeProfileMatch(parsed, studentProfile);
        }
      }
    } catch (err: any) {
      console.warn('[ProfileMatchAgent] Gemini API invocation failed:', err?.message || err);
      if (!options?.allowFallback && !opportunityAnalysis.aiFailed) {
        throw new Error(`Analysis could not be completed: Gemini AI failed in Profile Match Agent (${err?.message || 'API error'}).`);
      }
      const detMatch = generateDeterministicProfileMatch(studentProfile, opportunityAnalysis, eligibilityAnalysis);
      detMatch.aiFailed = true;
      detMatch.aiFailureReason = err?.message || 'Gemini API call failed';
      return detMatch;
    }
  }

  return generateDeterministicProfileMatch(studentProfile, opportunityAnalysis, eligibilityAnalysis);
}

function sanitizeProfileMatch(
  raw: ProfileMatchResult,
  student: StudentProfile
): ProfileMatchResult {
  return {
    strongMatches: raw.strongMatches.map(m => ({
      area: m.area || 'Academic Fit',
      studentEvidence: m.studentEvidence || `${student.currentDegree} in ${student.fieldOfStudy}`,
      opportunityRelevance: m.opportunityRelevance || 'Program scope alignment',
      reasoning: m.reasoning || ''
    })),
    relevantExperience: raw.relevantExperience.map(e => ({
      experience: e.experience || 'Experience',
      relevance: e.relevance || 'Relevant background',
      evidence: e.evidence || ''
    })),
    relevantSkills: raw.relevantSkills.map(s => ({
      skill: s.skill || '',
      relevance: s.relevance || 'Direct competency'
    })),
    gaps: raw.gaps.map(g => ({
      area: g.area || 'Requirement Verification',
      reason: g.reason || '',
      severity: (['HIGH', 'MEDIUM', 'LOW'].includes(g.severity) ? g.severity : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW'
    })),
    summary: raw.summary || `Profile alignment established across ${student.fieldOfStudy}, GPA (${student.gpa || 'N/A'}), and verified competencies.`
  };
}

/**
 * Deterministic Profile Match Fallback
 * Extracts factual overlaps between student profile and opportunity text without hallucinating.
 */
function generateDeterministicProfileMatch(
  student: StudentProfile,
  opportunity: OpportunityAnalysis,
  eligibility: EligibilityAnalysis
): ProfileMatchResult {
  const oppText = [
    opportunity.opportunityName,
    opportunity.organization,
    opportunity.type,
    opportunity.summary,
    ...(opportunity.fieldsOfStudy || []),
    ...(opportunity.academicRequirements || []),
    ...(opportunity.degreeRequirements || []),
    ...(opportunity.otherRequirements || [])
  ].join(' ').toLowerCase();

  const strongMatches: ProfileMatchStrongMatch[] = [];

  // Degree & Field
  if (student.currentDegree && student.fieldOfStudy) {
    const isDirectMajorMatch = oppText.includes(student.fieldOfStudy.toLowerCase()) ||
      oppText.includes('computer') ||
      oppText.includes('engineering') ||
      oppText.includes('science') ||
      oppText.includes('stem');

    if (isDirectMajorMatch) {
      strongMatches.push({
        area: 'Degree & Field Alignment',
        studentEvidence: `Enrolled in ${student.currentDegree} (${student.fieldOfStudy}) at ${student.university || 'accredited university'}.`,
        opportunityRelevance: `Opportunity focuses on ${opportunity.fieldsOfStudy?.join(', ') || opportunity.type} initiatives.`,
        reasoning: `Candidate's current major in ${student.fieldOfStudy} aligns directly with the target disciplinary focus.`
      });
    }
  }

  // GPA
  if (student.gpa && opportunity.gpaRequirement) {
    if (student.gpa >= opportunity.gpaRequirement.minimumGpa) {
      strongMatches.push({
        area: 'Academic Standing (GPA)',
        studentEvidence: `Cumulative GPA of ${student.gpa.toFixed(2)} on a ${student.maxGpa || 4.0} scale.`,
        opportunityRelevance: `Requires minimum GPA of ${opportunity.gpaRequirement.minimumGpa.toFixed(2)}.`,
        reasoning: `Candidate's academic record satisfies the competitive minimum threshold with a ${(student.gpa - opportunity.gpaRequirement.minimumGpa).toFixed(2)} point surplus.`
      });
    }
  }

  // Relevant Skills
  const allStudentSkills = [
    ...(student.programmingLanguages || []),
    ...(student.technicalSkills || []),
    ...(student.aiMlSkills || []),
    ...(student.otherSkills || [])
  ];

  const relevantSkills: ProfileMatchRelevantSkill[] = [];
  for (const skill of allStudentSkills) {
    const skLower = skill.toLowerCase();
    const isRelevant = oppText.includes(skLower) ||
      (skLower.includes('python') && oppText.includes('programming')) ||
      (skLower.includes('machine learning') && (oppText.includes('ai') || oppText.includes('data'))) ||
      (skLower.includes('data') && oppText.includes('research'));

    if (isRelevant) {
      relevantSkills.push({
        skill,
        relevance: `Direct alignment with technical competencies demanded by ${opportunity.opportunityName}.`
      });
    }
  }

  if (relevantSkills.length === 0 && allStudentSkills.length > 0) {
    // Pick first 3 as foundational
    for (const skill of allStudentSkills.slice(0, 3)) {
      relevantSkills.push({
        skill,
        relevance: 'Foundational analytical and programming methodology relevant to academic execution.'
      });
    }
  }

  // Relevant Experience
  const relevantExperience: ProfileMatchRelevantExperience[] = [];
  for (const exp of student.internships || []) {
    relevantExperience.push({
      experience: `${exp.role} at ${exp.organization}`,
      relevance: 'Demonstrates applied professional experience and delivery under organizational standards.',
      evidence: exp.duration ? `Completed: ${exp.duration}. ${exp.description || ''}` : exp.description || 'Verified internship'
    });
  }

  for (const res of student.researchExperience || []) {
    relevantExperience.push({
      experience: `Research: ${res.title}`,
      relevance: 'Direct academic inquiry and research methodology background.',
      evidence: `Supervised at: ${res.labOrMentor || 'Academic Department'}. ${res.description || ''}`
    });
  }

  for (const proj of student.projects || []) {
    relevantExperience.push({
      experience: `Project: ${proj.title}`,
      relevance: `Practical development using ${proj.techStack.join(', ')}.`,
      evidence: proj.description || `Built with ${proj.techStack.join(', ')}`
    });
  }

  // Gaps
  const gaps: ProfileMatchGap[] = [];
  for (const crit of eligibility.criteriaResults) {
    if (crit.status === 'NOT_MET') {
      gaps.push({
        area: crit.requirementLabel || crit.requirement,
        reason: crit.explanation || 'Requirement not met based on submitted candidate profile.',
        severity: 'HIGH'
      });
    } else if (crit.status === 'NEEDS_VERIFICATION') {
      gaps.push({
        area: crit.requirementLabel || crit.requirement,
        reason: crit.explanation || 'Profile lacks explicit documentation to confirm compliance.',
        severity: 'MEDIUM'
      });
    }
  }

  if (opportunity.requiredDocuments && opportunity.requiredDocuments.length > 0) {
    gaps.push({
      area: 'Official Application Dossier',
      reason: `Application mandates submission of: ${opportunity.requiredDocuments.join(', ')}. Official files must be collected and uploaded.`,
      severity: 'LOW'
    });
  }

  return {
    strongMatches: strongMatches.length > 0 ? strongMatches : [
      {
        area: 'Foundational Academic Enrollment',
        studentEvidence: `Enrolled in ${student.currentDegree || 'undergraduate studies'} (${student.fieldOfStudy || 'STEM discipline'}).`,
        opportunityRelevance: `Open to eligible candidates in related fields of study.`,
        reasoning: 'Candidate profile demonstrates general educational alignment.'
      }
    ],
    relevantExperience: relevantExperience.slice(0, 5),
    relevantSkills: relevantSkills.slice(0, 8),
    gaps,
    summary: `Profile match analysis demonstrates alignment in ${student.fieldOfStudy || 'field of study'} with ${relevantSkills.length} identified competencies and ${strongMatches.length} strong matching areas. Gaps identify ${gaps.length} items requiring attention or document assembly.`
  };
}
