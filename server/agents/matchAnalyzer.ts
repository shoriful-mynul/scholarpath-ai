import { GoogleGenAI, Type } from '@google/genai';
import { StudentProfile, OpportunityAnalysis, OpportunityMatchAnalysis, MatchPillar } from './types';

export async function runMatchAnalyzer(
  student: StudentProfile,
  opportunity: OpportunityAnalysis,
  aiClient?: GoogleGenAI
): Promise<OpportunityMatchAnalysis> {
  // If Gemini client is provided and has API key, use Gemini 3.8 Flash with structured schema
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are Agent 3 (Opportunity Match Agent) in ScholarPath AI.
Your responsibility:
1. Conduct a transparent, qualitative compatibility analysis between the student's background and the opportunity's expectations.
2. Evaluate:
   - Education & Coursework
   - Technical skills & Tools
   - Projects & Portfolio
   - Research experience & Publications
   - Leadership & Community impact
   - Certifications & Honors
3. Identify:
   - Strong matches (concrete alignments between student background and opportunity)
   - Relevant experience
   - Relevant skills
   - Areas that strengthen the application (unique advantages)
   - Areas that need improvement or strategic framing
4. Explain the reasoning behind key matches.
5. CRITICAL: Do NOT present this as an official acceptance prediction or guarantee. Maintain rigorous academic humility.

Student Profile:
${JSON.stringify({
  name: student.name,
  degree: student.currentDegree,
  field: student.fieldOfStudy,
  university: student.university,
  gpa: `${student.gpa}/${student.maxGpa || 4.0}`,
  technicalSkills: student.technicalSkills,
  programmingLanguages: student.programmingLanguages,
  aiMlSkills: student.aiMlSkills,
  internships: student.internships,
  researchExperience: student.researchExperience,
  projects: student.projects,
  leadership: student.leadership,
  certificationsAwards: student.certificationsAwards
}, null, 2)}

Opportunity Details:
${JSON.stringify({
  name: opportunity.opportunityName,
  organization: opportunity.organization,
  type: opportunity.type,
  summary: opportunity.summary,
  fields: opportunity.fieldsOfStudy,
  degreeLevels: opportunity.degreeLevels,
  allRequirements: opportunity.allRequirements.map(r => r.requirementText)
}, null, 2)}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an objective university fellowship and scholarship advisor. Provide detailed, transparent, evidence-based compatibility assessments.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              compatibilityTier: {
                type: Type.STRING,
                description: 'One of: Strong Alignment, Competitive Match, Selective / Stretch Match, Significant Gaps'
              },
              compatibilitySummary: { type: Type.STRING },
              strongMatches: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              relevantExperience: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              relevantSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              areasToStrengthen: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              growthAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              pillars: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      description: 'Education, Skills, Research, Projects, Leadership, or Awards'
                    },
                    scoreLevel: {
                      type: Type.STRING,
                      description: 'High, Moderate, or Developing'
                    },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    studentEvidence: { type: Type.STRING },
                    opportunityExpectation: { type: Type.STRING }
                  },
                  required: ['category', 'scoreLevel', 'title', 'description', 'studentEvidence', 'opportunityExpectation']
                }
              }
            },
            required: [
              'compatibilityTier',
              'compatibilitySummary',
              'strongMatches',
              'relevantExperience',
              'relevantSkills',
              'areasToStrengthen',
              'growthAreas',
              'pillars'
            ]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        compatibilityTier: (parsed.compatibilityTier || 'Competitive Match') as any,
        compatibilitySummary: parsed.compatibilitySummary || 'Evaluation completed based on background alignment.',
        strongMatches: parsed.strongMatches || [],
        relevantExperience: parsed.relevantExperience || [],
        relevantSkills: parsed.relevantSkills || [],
        areasToStrengthen: parsed.areasToStrengthen || [],
        growthAreas: parsed.growthAreas || [],
        pillars: (parsed.pillars || []).map((p: any) => ({
          category: p.category || 'Education',
          scoreLevel: p.scoreLevel || 'Moderate',
          title: p.title || 'Alignment Dimension',
          description: p.description || '',
          studentEvidence: p.studentEvidence || '',
          opportunityExpectation: p.opportunityExpectation || ''
        })),
        transparentDisclaimer: 'This compatibility analysis reflects qualitative alignment between your submitted profile and the stated focus areas of this opportunity. It is an advisory evaluation tool, not an official prediction or guarantee of acceptance or funding.'
      };
    } catch (err: any) {
      console.warn('Gemini Match Analyzer failed, falling back to deterministic matching:', err?.message || err);
    }
  }

  // Fallback match generator based on student profile features
  return generateDeterministicMatch(student, opportunity);
}

export function generateDeterministicMatch(
  student: StudentProfile,
  opportunity: OpportunityAnalysis
): OpportunityMatchAnalysis {
  const strongMatches: string[] = [];
  const relevantExperience: string[] = [];
  const relevantSkills: string[] = [];
  const areasToStrengthen: string[] = [];
  const growthAreas: string[] = [];
  const pillars: MatchPillar[] = [];

  // 1. Education Pillar
  const gpaStr = student.gpa ? `${student.gpa.toFixed(2)}/${student.maxGpa || 4.0}` : 'Unlisted';
  pillars.push({
    category: 'Education',
    scoreLevel: student.gpa >= 3.6 ? 'High' : 'Moderate',
    title: 'Academic Track Record & Major',
    description: `Current enrollment in ${student.currentDegree || 'degree'} in ${student.fieldOfStudy || 'field'} at ${student.university || 'university'}.`,
    studentEvidence: `GPA: ${gpaStr}, ${student.currentYearOrSemester || 'Enrolled student'}`,
    opportunityExpectation: opportunity.gpaRequirement ? `Min GPA: ${opportunity.gpaRequirement.minimumGpa}` : 'Solid academic foundation in related discipline'
  });

  if (student.gpa >= 3.5) {
    strongMatches.push(`Strong academic standing with cumulative GPA of ${gpaStr}`);
  }

  // 2. Skills Pillar
  const allSkills = [
    ...(student.programmingLanguages || []),
    ...(student.technicalSkills || []),
    ...(student.aiMlSkills || [])
  ];

  if (allSkills.length > 0) {
    relevantSkills.push(...allSkills.slice(0, 6));
    pillars.push({
      category: 'Skills',
      scoreLevel: allSkills.length >= 6 ? 'High' : 'Moderate',
      title: 'Technical & Domain Skillset',
      description: `Demonstrated capabilities across ${allSkills.slice(0, 4).join(', ')}.`,
      studentEvidence: allSkills.join(', '),
      opportunityExpectation: 'Proficiency in technical problem solving and relevant tools'
    });
    strongMatches.push(`Relevant technical skillset across ${allSkills.slice(0, 3).join(', ')}`);
  } else {
    areasToStrengthen.push('Add specific programming languages and technical tools to profile to better highlight technical qualifications.');
  }

  // 3. Experience & Internships
  if (student.internships && student.internships.length > 0) {
    student.internships.forEach(internship => {
      relevantExperience.push(`${internship.organization} (${internship.role}) — ${internship.duration}`);
    });
    strongMatches.push(`Practical industry/internship experience with ${student.internships.map(i => i.organization).join(' & ')}`);
    pillars.push({
      category: 'Projects',
      scoreLevel: 'High',
      title: 'Practical Work & Industry Experience',
      description: 'Hands-on experience delivering technical responsibilities in organized environments.',
      studentEvidence: student.internships.map(i => `${i.role} at ${i.organization}`).join('; '),
      opportunityExpectation: 'Demonstrated initiative and practical application of learning'
    });
  } else {
    areasToStrengthen.push('Highlight coursework projects or lab assignments that simulate real-world team delivery.');
  }

  // 4. Research Experience
  if (student.researchExperience && student.researchExperience.length > 0) {
    const research = student.researchExperience[0];
    strongMatches.push(`Formal research involvement: ${research.title} (${research.labOrMentor})`);
    pillars.push({
      category: 'Research',
      scoreLevel: 'High',
      title: 'Undergraduate Research & Inquiry',
      description: research.description,
      studentEvidence: research.publicationsOrOutcomes || research.title,
      opportunityExpectation: 'Inquisitive mindset and scientific methodology'
    });
  } else if (opportunity.type === 'Research Program') {
    areasToStrengthen.push('Since this is a research fellowship, emphasize independent academic inquiries or capstone projects.');
  }

  // 5. Leadership
  if (student.leadership && student.leadership.length > 0) {
    const lead = student.leadership[0];
    strongMatches.push(`Community and extracurricular leadership: ${lead.role} at ${lead.organization}`);
    pillars.push({
      category: 'Leadership',
      scoreLevel: 'High',
      title: 'Leadership & Community Involvement',
      description: lead.description,
      studentEvidence: `${lead.role} (${lead.organization})`,
      opportunityExpectation: 'Demonstrated character, peer mentorship, and team leadership'
    });
  } else {
    growthAreas.push('Incorporate campus club leadership, volunteering, or peer teaching to demonstrate multi-dimensional leadership.');
  }

  // Determine tier
  let tier: OpportunityMatchAnalysis['compatibilityTier'] = 'Competitive Match';
  if (strongMatches.length >= 4 && student.gpa >= 3.6) {
    tier = 'Strong Alignment';
  } else if (strongMatches.length <= 1) {
    tier = 'Selective / Stretch Match';
  }

  return {
    compatibilityTier: tier,
    compatibilitySummary: `Student demonstrates ${tier.toLowerCase()} based on their academic trajectory in ${student.fieldOfStudy}, practical projects, and demonstrable technical skills.`,
    strongMatches,
    relevantExperience,
    relevantSkills,
    areasToStrengthen: areasToStrengthen.length > 0 ? areasToStrengthen : ['Tailor written statements directly to the sponsor’s stated mission.'],
    growthAreas: growthAreas.length > 0 ? growthAreas : ['Quantify outcomes (e.g. users impacted, latency reduced, members mentored) in all application essays.'],
    pillars,
    transparentDisclaimer: 'This compatibility analysis reflects qualitative alignment between your submitted profile and the stated focus areas of this opportunity. It is an advisory evaluation tool, not an official prediction or guarantee of acceptance or funding.'
  };
}
