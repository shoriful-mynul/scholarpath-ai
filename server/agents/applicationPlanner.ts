import { OpenRouterAI, Type } from '../lib/openrouter';
import {
  StudentProfile,
  OpportunityAnalysis,
  EligibilityAnalysis,
  ProfileMatchResult,
  ApplicationPlanResult,
  ApplicationPlanPriorityTask,
  ApplicationPlanDocument,
  ApplicationPlanProfileHighlight,
  ApplicationPlanRequirementToVerify,
  ActionPlanTask
} from './types';

/**
 * Stage 4: Application Planner Agent
 * Transforms analysis into an actionable preparation plan.
 * 
 * Rules:
 * - Do NOT assume documents exist merely because they are common. Use UNKNOWN or NEEDS_PREPARATION.
 * - If deadline is ambiguous ("rolling", "soon", "tbd", "unspecified"), retain original string and mark as needing verification.
 * - Every requirement with NEEDS_VERIFICATION in eligibility MUST be included in requirementsToVerify.
 */
export async function runApplicationPlanner(
  studentProfile: StudentProfile,
  opportunityAnalysis: OpportunityAnalysis,
  eligibilityAnalysis: EligibilityAnalysis,
  profileMatch: ProfileMatchResult,
  aiClient?: OpenRouterAI,
  options?: { allowFallback?: boolean }
): Promise<ApplicationPlanResult> {
  const needsVerificationItems = eligibilityAnalysis.criteriaResults.filter(
    c => c.status === 'NEEDS_VERIFICATION'
  );

  const isAmbiguousDeadline = checkAmbiguousDeadline(opportunityAnalysis.deadline);

  if (aiClient) {
    try {
      const prompt = `You are Stage 4: Application Planner Agent in ScholarPath AI.
Generate an actionable, prioritized preparation plan tailored to the student and the opportunity.

STRICT INSTRUCTIONS:
1. Document handling: Do NOT assume common documents exist in advance. For example, never say "transcript available" unless the profile explicitly provides an uploaded transcript. Use "NEEDS_PREPARATION" or "UNKNOWN".
2. Deadline handling: The extracted deadline is "${opportunityAnalysis.deadline}".
   - If this is ambiguous, rolling, or vague, state the original string and note that the date requires sponsor verification.
   - Do NOT invent specific dates or calculate false urgency if the date is ambiguous.
3. Verification requirements: All of the following items were marked NEEDS_VERIFICATION by Eligibility Analysis and MUST be included in "requirementsToVerify":
${needsVerificationItems.map(c => `   - ${c.requirement}: ${c.explanation}`).join('\n') || '   - None'}
4. Tasks: Prioritize high-lead-time tasks (recommendations, official transcripts) with high priority and early suggestedOrder (1, 2, 3...).
5. Profile Highlights: Point out specific facts from the student profile (projects, GPA, specific skills) that should be emphasized in application essays or CV.

Student Profile Summary:
- Name: ${studentProfile.name}
- Major: ${studentProfile.currentDegree} in ${studentProfile.fieldOfStudy} (${studentProfile.university})
- GPA: ${studentProfile.gpa} / ${studentProfile.maxGpa || 4.0}
- Skills: ${studentProfile.technicalSkills.concat(studentProfile.programmingLanguages).slice(0, 8).join(', ')}
- Projects: ${studentProfile.projects.map(p => p.title).join(', ')}

Opportunity Summary:
- Name: ${opportunityAnalysis.opportunityName}
- Organization: ${opportunityAnalysis.organization}
- Type: ${opportunityAnalysis.type}
- Stated Deadline: ${opportunityAnalysis.deadline}
- Required Documents: ${opportunityAnalysis.requiredDocuments.join(', ') || 'Not specified'}

Eligibility Summary:
- Overall: ${eligibilityAnalysis.overallStatus}
- Hard Blockers: ${eligibilityAnalysis.hardBlockers.join('; ') || 'None'}
- Needs Verification Items: ${needsVerificationItems.length} items

Produce a structured JSON plan conforming to the requested schema.`;

      const response = await aiClient.models.generateContent({
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        contents: prompt,
        config: {
          systemInstruction: 'You are an executive application planning strategist. Generate practical, concrete milestone timelines organized by urgency. Never assume missing documents exist.',
                    responseSchema: {
            type: Type.OBJECT,
            properties: {
              priorityTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      description: 'HIGH, MEDIUM, or LOW'
                    },
                    reason: { type: Type.STRING },
                    relatedRequirement: { type: Type.STRING },
                    suggestedOrder: { type: Type.NUMBER }
                  },
                  required: ['task', 'priority', 'reason', 'relatedRequirement', 'suggestedOrder']
                }
              },
              documents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    document: { type: Type.STRING },
                    status: {
                      type: Type.STRING,
                      description: 'LIKELY_AVAILABLE, NEEDS_PREPARATION, or UNKNOWN'
                    },
                    reason: { type: Type.STRING }
                  },
                  required: ['document', 'status', 'reason']
                }
              },
              profileHighlights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['item', 'reason']
                }
              },
              requirementsToVerify: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    requirement: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['requirement', 'reason']
                }
              },
              deadline: { type: Type.STRING },
              deadlineNotes: { type: Type.STRING }
            },
            required: ['priorityTasks', 'documents', 'profileHighlights', 'requirementsToVerify', 'deadline', 'deadlineNotes']
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text) as ApplicationPlanResult;
        return postProcessPlan(parsed, opportunityAnalysis, eligibilityAnalysis, studentProfile);
      }
    } catch (err: any) {
      console.warn('[ApplicationPlanner] OpenRouter call failed:', err?.message || err);
      if (!options?.allowFallback && !opportunityAnalysis.aiFailed) {
        throw new Error(`Analysis could not be completed: OpenRouter AI failed in Application Planner Agent (${err?.message || 'API error'}).`);
      }
      const detPlan = generateDeterministicPlan(studentProfile, opportunityAnalysis, eligibilityAnalysis, profileMatch, isAmbiguousDeadline);
      detPlan.aiFailed = true;
      detPlan.aiFailureReason = err?.message || 'OpenRouter API call failed';
      return detPlan;
    }
  }

  return generateDeterministicPlan(studentProfile, opportunityAnalysis, eligibilityAnalysis, profileMatch, isAmbiguousDeadline);
}

function checkAmbiguousDeadline(deadline: string): boolean {
  if (!deadline) return true;
  const d = deadline.toLowerCase().trim();
  const ambiguousKeywords = [
    'rolling', 'asap', 'soon', 'tbd', 'to be determined', 'unspecified',
    'not specified', 'check website', 'open until', 'ongoing', 'varies', 'n/a'
  ];
  return ambiguousKeywords.some(kw => d.includes(kw));
}

function postProcessPlan(
  raw: ApplicationPlanResult,
  opportunity: OpportunityAnalysis,
  eligibility: EligibilityAnalysis,
  student: StudentProfile
): ApplicationPlanResult {
  const isAmbiguous = checkAmbiguousDeadline(opportunity.deadline);

  // Guarantee that every NEEDS_VERIFICATION item from eligibility is included in requirementsToVerify
  const reqsToVerify: ApplicationPlanRequirementToVerify[] = [...(raw.requirementsToVerify || [])];
  for (const crit of eligibility.criteriaResults) {
    if (crit.status === 'NEEDS_VERIFICATION') {
      const alreadyPresent = reqsToVerify.some(r =>
        r.requirement.toLowerCase().includes(crit.requirementLabel.toLowerCase()) ||
        (crit.category && r.requirement.toLowerCase().includes(crit.category.toLowerCase())) ||
        crit.requirement.toLowerCase().includes(r.requirement.toLowerCase())
      );
      if (!alreadyPresent) {
        reqsToVerify.push({
          requirement: crit.requirementLabel || crit.requirement,
          reason: crit.explanation || 'Eligibility analyzer marked this requirement as needing verification.'
        });
      }
    }
  }

  // Ensure documents don't claim availability without evidence
  const sanitizedDocs: ApplicationPlanDocument[] = (raw.documents || []).map(doc => {
    let status = doc.status;
    const nameLower = doc.document.toLowerCase();
    if (nameLower.includes('transcript') && status === 'LIKELY_AVAILABLE') {
      status = 'UNKNOWN'; // Official transcripts must be verified with registrar
    }
    if (nameLower.includes('recommendation') && status === 'LIKELY_AVAILABLE') {
      status = 'NEEDS_PREPARATION';
    }
    return {
      document: doc.document,
      status: (['LIKELY_AVAILABLE', 'NEEDS_PREPARATION', 'UNKNOWN'].includes(status) ? status : 'NEEDS_PREPARATION') as any,
      reason: doc.reason || 'Document requirement for submission dossier.'
    };
  });

  // Ensure deadline handling conforms to rules
  const deadline = opportunity.deadline || raw.deadline || 'Unspecified';
  let deadlineNotes = raw.deadlineNotes || '';
  if (isAmbiguous) {
    deadlineNotes = `Notice: The extracted deadline "${deadline}" is rolling or ambiguous. Planning timelines should be verified directly with the sponsor; do not assume a distant deadline.`;
  }

  return {
    priorityTasks: (raw.priorityTasks || []).map((t, idx) => ({
      task: t.task || 'Application Preparation Task',
      priority: (['HIGH', 'MEDIUM', 'LOW'].includes(t.priority) ? t.priority : 'MEDIUM') as any,
      reason: t.reason || '',
      relatedRequirement: t.relatedRequirement || 'General application requirement',
      suggestedOrder: typeof t.suggestedOrder === 'number' ? t.suggestedOrder : idx + 1
    })),
    documents: sanitizedDocs,
    profileHighlights: raw.profileHighlights || [],
    requirementsToVerify: reqsToVerify,
    deadline,
    deadlineNotes
  };
}

function generateDeterministicPlan(
  student: StudentProfile,
  opportunity: OpportunityAnalysis,
  eligibility: EligibilityAnalysis,
  profileMatch: ProfileMatchResult,
  isAmbiguousDeadline: boolean
): ApplicationPlanResult {
  const priorityTasks: ApplicationPlanPriorityTask[] = [];
  let order = 1;

  // 1. Letters of recommendation & Transcripts (High Lead Time)
  const reqDocs = opportunity.requiredDocuments || [];
  const needsTranscript = reqDocs.some(d => d.toLowerCase().includes('transcript')) || reqDocs.length === 0;
  const needsRecLetter = reqDocs.some(d => d.toLowerCase().includes('recommend') || d.toLowerCase().includes('letter') || d.toLowerCase().includes('reference'));

  if (needsRecLetter) {
    priorityTasks.push({
      task: 'Request Academic / Professional Letters of Recommendation',
      priority: 'HIGH',
      reason: 'Recommenders typically require 3 to 4 weeks advance notice to draft and submit tailored letters.',
      relatedRequirement: 'Letters of Recommendation',
      suggestedOrder: order++
    });
  }

  if (needsTranscript) {
    priorityTasks.push({
      task: 'Order Official Academic Transcript from Registrar',
      priority: 'HIGH',
      reason: 'Official transcripts must be issued directly by institution registrar to verify GPA and completed coursework.',
      relatedRequirement: 'Academic Records & Cumulative GPA',
      suggestedOrder: order++
    });
  }

  // 2. Resolve any NEEDS_VERIFICATION requirements
  const requirementsToVerify: ApplicationPlanRequirementToVerify[] = [];
  for (const crit of eligibility.criteriaResults) {
    if (crit.status === 'NEEDS_VERIFICATION') {
      requirementsToVerify.push({
        requirement: crit.requirementLabel || crit.requirement,
        reason: crit.explanation
      });

      priorityTasks.push({
        task: `Verify and Document: ${crit.requirementLabel || crit.requirement}`,
        priority: 'HIGH',
        reason: crit.explanation,
        relatedRequirement: crit.requirement,
        suggestedOrder: order++
      });
    }
  }

  // 3. Draft Statement / Essay
  priorityTasks.push({
    task: `Draft Statement of Purpose tailored to ${opportunity.organization}`,
    priority: 'MEDIUM',
    reason: `Align personal statement with the stated mission of ${opportunity.opportunityName} and highlight relevant competencies.`,
    relatedRequirement: 'Application Essays / Personal Statement',
    suggestedOrder: order++
  });

  // 4. Update CV/Resume highlighting matched projects
  priorityTasks.push({
    task: 'Format CV / Resume with Matched Projects and Skills',
    priority: 'MEDIUM',
    reason: `Highlight key projects (${student.projects.slice(0, 2).map(p => p.title).join(', ') || 'portfolio work'}) and technical competencies.`,
    relatedRequirement: 'Curriculum Vitae / Resume',
    suggestedOrder: order++
  });

  // 5. Final review
  priorityTasks.push({
    task: 'Perform Final Dossier Quality Check and Review Proofs',
    priority: 'LOW',
    reason: 'Verify all attachments, verify character limits, and confirm recommendation submissions prior to deadline.',
    relatedRequirement: 'Final Submission Dossier',
    suggestedOrder: order++
  });

  // Documents status mapping (Never assume transcript is readily available without proof)
  const documents: ApplicationPlanDocument[] = [];
  const standardDocs = reqDocs.length > 0 ? reqDocs : [
    'Official Academic Transcript',
    'Curriculum Vitae / Resume',
    'Letters of Recommendation',
    'Statement of Purpose'
  ];

  for (const doc of standardDocs) {
    const dLower = doc.toLowerCase();
    if (dLower.includes('transcript')) {
      documents.push({
        document: doc,
        status: 'UNKNOWN',
        reason: 'Current official transcript must be requested from university registrar; cannot assume official copy is currently in candidate possession.'
      });
    } else if (dLower.includes('resume') || dLower.includes('cv')) {
      documents.push({
        document: doc,
        status: 'NEEDS_PREPARATION',
        reason: 'Candidate background data exists in profile but must be formatted into opportunity-tailored PDF.'
      });
    } else if (dLower.includes('recommend') || dLower.includes('reference')) {
      documents.push({
        document: doc,
        status: 'NEEDS_PREPARATION',
        reason: 'External letters must be requested from mentors or academic faculty supervisors.'
      });
    } else if (dLower.includes('statement') || dLower.includes('essay') || dLower.includes('cover')) {
      documents.push({
        document: doc,
        status: 'NEEDS_PREPARATION',
        reason: 'Essay must be written specifically aligning candidate trajectory with the opportunity scope.'
      });
    } else {
      documents.push({
        document: doc,
        status: 'UNKNOWN',
        reason: 'Documentation requirements should be verified directly with the application instructions.'
      });
    }
  }

  // Profile Highlights
  const profileHighlights: ApplicationPlanProfileHighlight[] = [];
  if (student.gpa) {
    profileHighlights.push({
      item: `Academic Record: GPA ${student.gpa.toFixed(2)} in ${student.fieldOfStudy}`,
      reason: 'Demonstrates solid academic grounding in the target discipline.'
    });
  }
  for (const proj of student.projects.slice(0, 2)) {
    profileHighlights.push({
      item: `Demonstrated Project: "${proj.title}" (${proj.techStack.join(', ')})`,
      reason: 'Concrete evidence of applied engineering skills and independent execution.'
    });
  }
  for (const res of student.researchExperience.slice(0, 1)) {
    profileHighlights.push({
      item: `Research Inquiry: "${res.title}"`,
      reason: 'Highlights scholarly rigor and experience working under academic faculty supervision.'
    });
  }

  const deadline = opportunity.deadline || 'Unspecified';
  const deadlineNotes = isAmbiguousDeadline
    ? `The stated deadline "${deadline}" is rolling, ongoing, or ambiguous. Timeline planning requires immediate verification with the program coordinator; do not assume an extended window.`
    : `Official submission deadline is ${deadline}. All high-priority milestones should be scheduled at least 14 days in advance to allow for recommender and registrar processing.`;

  return {
    priorityTasks,
    documents,
    profileHighlights,
    requirementsToVerify,
    deadline,
    deadlineNotes
  };
}

/**
 * Adapter helper to transform ApplicationPlanResult to legacy ApplicationPlan for UI backward compatibility
 */
export function adaptToLegacyPlan(plan: ApplicationPlanResult): any {
  return {
    missingDocuments: plan.documents.filter(d => d.status === 'NEEDS_PREPARATION' || d.status === 'UNKNOWN').map(d => d.document),
    missingRequirements: plan.requirementsToVerify.map(r => `${r.requirement}: ${r.reason}`),
    skillsToHighlight: plan.profileHighlights.map(h => h.item),
    projectsToEmphasize: plan.profileHighlights.filter(h => h.item.includes('Project')).map(h => h.item),
    recommendedPreparationSequence: plan.priorityTasks.map(t => `${t.suggestedOrder}. ${t.task} (${t.priority} Priority)`),
    tasks: plan.priorityTasks.map((t, idx) => ({
      id: `task_${idx + 1}`,
      title: t.task,
      category: t.task.toLowerCase().includes('transcript') || t.task.toLowerCase().includes('document') ? 'Document Prep' :
                t.task.toLowerCase().includes('verify') ? 'Eligibility Resolution' :
                t.task.toLowerCase().includes('draft') || t.task.toLowerCase().includes('statement') ? 'Writing & Essays' : 'Review & Submission',
      priority: t.priority === 'HIGH' ? 'High' : t.priority === 'MEDIUM' ? 'Medium' : 'Low',
      estimatedHours: t.priority === 'HIGH' ? 4 : 2,
      timelinePhase: t.suggestedOrder <= 2 ? 'Immediate (Week 1)' : 'Phase 2: Drafting & Assembly',
      description: t.reason,
      targetDeadline: plan.deadline,
      completed: false
    })),
    estimatedTotalHours: plan.priorityTasks.length * 2,
    submissionReadinessScore: Math.max(30, 90 - plan.requirementsToVerify.length * 15 - plan.documents.filter(d => d.status === 'UNKNOWN').length * 10)
  };
}
