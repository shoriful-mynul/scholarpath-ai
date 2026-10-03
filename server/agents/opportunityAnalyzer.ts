import { GoogleGenAI, Type } from '@google/genai';
import { OpportunityAnalysis, ExtractedRequirement, OpportunityEvidenceItem } from './types';

export async function runOpportunityAnalyzer(
  rawOpportunityText: string,
  aiClient?: GoogleGenAI
): Promise<OpportunityAnalysis> {
  const trimmed = rawOpportunityText.trim();
  if (!trimmed) {
    throw new Error('Opportunity text is empty. Please provide opportunity text or upload a document.');
  }

  // If Gemini client is provided and has API key, use Gemini 3.8 Flash with structured schema
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are Agent 1 (Opportunity Analyzer) in ScholarPath AI.
Your responsibility:
1. Read the provided opportunity text carefully.
2. Extract structured opportunity information:
   - opportunityName
   - organization
   - type (Scholarship, Internship, Fellowship, Competition, Research Program, Grant, or Other)
   - deadline (exact stated application deadline string)
   - eligibleCountries (list of countries, nationalities, or regions explicitly eligible)
   - academicRequirements (list of academic performance, course, or standing criteria)
   - gpaRequirements (list of GPA/CGPA requirements if stated)
   - degreeRequirements (list of degree levels, majors, or fields of study required)
   - yearRequirements (current semester, undergraduate/graduate year, or graduation cohort rules)
   - ageRequirements (age restrictions if stated)
   - requiredDocuments (transcripts, CV, essays, recommendations, portfolios, etc.)
   - languageRequirements (English or other language proficiency rules)
   - otherRequirements (diversity, leadership, full-time enrollment, or special conditions)
   - evidence (list of { requirement, snippet, category } quotes directly from the source text)

CRITICAL RULES:
* Every important extracted requirement MUST include supporting evidence from the source text whenever possible.
* Do NOT invent, assume, or hallucinate missing information.
* If a requirement is not present in the source text, leave the array empty or mark as "Not specified".
* Do NOT fabricate numbers, dates, or eligibility conditions.

Opportunity Text:
"""
${trimmed.slice(0, 25000)}
"""`;

      let response: any = null;
      let lastErr: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: 'You are an objective academic document analysis agent. Extract only what is explicitly written in the source text and preserve exact evidence snippets for each requirement.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  opportunityName: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: 'One of: Scholarship, Internship, Fellowship, Competition, Research Program, Grant, Other'
                  },
                  deadline: { type: Type.STRING },
                  eligibleCountries: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  academicRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  gpaRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  degreeRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  yearRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  ageRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  requiredDocuments: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  languageRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  otherRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  evidence: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        requirement: { type: Type.STRING },
                        snippet: { type: Type.STRING },
                        category: { type: Type.STRING }
                      },
                      required: ['requirement', 'snippet']
                    }
                  },
                  summary: { type: Type.STRING },
                  location: { type: Type.STRING },
                  awardOrCompensation: { type: Type.STRING },
                  minimumGpa: { type: Type.NUMBER, description: 'Numeric GPA threshold if stated, e.g. 3.2, otherwise 0' }
                },
                required: [
                  'opportunityName',
                  'organization',
                  'type',
                  'deadline',
                  'eligibleCountries',
                  'academicRequirements',
                  'gpaRequirements',
                  'degreeRequirements',
                  'yearRequirements',
                  'ageRequirements',
                  'requiredDocuments',
                  'languageRequirements',
                  'otherRequirements',
                  'evidence'
                ]
              }
            }
          });
          if (response && response.text) break;
        } catch (callErr: any) {
          lastErr = callErr;
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, 600 * attempt));
          }
        }
      }

      if (!response || !response.text) {
        throw lastErr || new Error('No response from Gemini API.');
      }

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (jsonErr) {
        console.warn('Failed to parse Gemini JSON output directly, attempting safe substring recovery:', jsonErr);
        const match = response.text?.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error('Could not parse structured JSON from Opportunity Analyzer.');
        }
      }

      // Extract minimum GPA value if not already numeric
      let extractedMinGpa: number | undefined = parsed.minimumGpa && parsed.minimumGpa > 0 ? parsed.minimumGpa : undefined;
      let gpaSnippet = '';
      if (!extractedMinGpa && Array.isArray(parsed.gpaRequirements) && parsed.gpaRequirements.length > 0) {
        const joinedGpa = parsed.gpaRequirements.join(' ');
        const numMatch = joinedGpa.match(/([0-9]\.[0-9]+)/);
        if (numMatch) {
          extractedMinGpa = parseFloat(numMatch[1]);
        }
      }

      // Evidence snippet for GPA
      const gpaEvidence = (parsed.evidence || []).find((e: any) =>
        (e.category && e.category.toLowerCase().includes('gpa')) ||
        (e.requirement && e.requirement.toLowerCase().includes('gpa'))
      );
      if (gpaEvidence) {
        gpaSnippet = gpaEvidence.snippet;
      }

      // Build allRequirements array for eligibility checking
      const allRequirements: ExtractedRequirement[] = [];

      // 1. GPA requirement
      if (extractedMinGpa || (parsed.gpaRequirements && parsed.gpaRequirements.length > 0)) {
        const text = parsed.gpaRequirements?.join('; ') || `Minimum GPA of ${extractedMinGpa}`;
        allRequirements.push({
          id: 'req_gpa',
          category: 'gpa',
          label: 'Minimum Cumulative GPA',
          requirementText: text,
          evidenceSnippet: gpaSnippet || text,
          minimumGpa: extractedMinGpa,
          gpaScale: 4.0,
          isMandatory: true
        });
      }

      // 2. Nationality / Countries
      if (parsed.eligibleCountries && parsed.eligibleCountries.length > 0) {
        const natEv = (parsed.evidence || []).find((e: any) =>
          (e.category && (e.category.includes('nation') || e.category.includes('countr'))) ||
          (e.requirement && (e.requirement.toLowerCase().includes('countr') || e.requirement.toLowerCase().includes('citizen')))
        );
        allRequirements.push({
          id: 'req_nationality',
          category: 'nationality',
          label: 'Eligible Countries & Citizenship',
          requirementText: parsed.eligibleCountries.join(', '),
          evidenceSnippet: natEv?.snippet || parsed.eligibleCountries.join(', '),
          eligibleCountries: parsed.eligibleCountries,
          isMandatory: true
        });
      }

      // 3. Degree / Academic level
      if (parsed.degreeRequirements && parsed.degreeRequirements.length > 0) {
        const degEv = (parsed.evidence || []).find((e: any) =>
          (e.category && e.category.includes('degree')) ||
          (e.requirement && e.requirement.toLowerCase().includes('degree'))
        );
        allRequirements.push({
          id: 'req_degree_level',
          category: 'degree_level',
          label: 'Degree Level & Standing',
          requirementText: parsed.degreeRequirements.join('; '),
          evidenceSnippet: degEv?.snippet || parsed.degreeRequirements.join('; '),
          eligibleDegrees: parsed.degreeRequirements,
          isMandatory: true
        });
      }

      // 4. Academic requirements / Field of study
      if (parsed.academicRequirements && parsed.academicRequirements.length > 0) {
        const acadEv = (parsed.evidence || []).find((e: any) =>
          (e.category && e.category.includes('academic')) ||
          (e.requirement && e.requirement.toLowerCase().includes('academic'))
        );
        allRequirements.push({
          id: 'req_field',
          category: 'field_of_study',
          label: 'Academic Disciplines & Standards',
          requirementText: parsed.academicRequirements.join('; '),
          evidenceSnippet: acadEv?.snippet || parsed.academicRequirements.join('; '),
          eligibleFields: parsed.academicRequirements,
          isMandatory: true
        });
      }

      // 5. Year / Cohort requirements
      if (parsed.yearRequirements && parsed.yearRequirements.length > 0) {
        const yrEv = (parsed.evidence || []).find((e: any) =>
          (e.category && e.category.includes('year')) ||
          (e.requirement && e.requirement.toLowerCase().includes('year'))
        );
        allRequirements.push({
          id: 'req_year_semester',
          category: 'year_semester',
          label: 'Enrollment Status & Graduation Cohort',
          requirementText: parsed.yearRequirements.join('; '),
          evidenceSnippet: yrEv?.snippet || parsed.yearRequirements.join('; '),
          isMandatory: true
        });
      }

      // 6. Age requirements
      if (parsed.ageRequirements && parsed.ageRequirements.length > 0) {
        const ageEv = (parsed.evidence || []).find((e: any) =>
          (e.category && e.category.includes('age')) ||
          (e.requirement && e.requirement.toLowerCase().includes('age'))
        );
        allRequirements.push({
          id: 'req_age',
          category: 'age',
          label: 'Age Eligibility Range',
          requirementText: parsed.ageRequirements.join('; '),
          evidenceSnippet: ageEv?.snippet || parsed.ageRequirements.join('; '),
          isMandatory: true
        });
      }

      // 7. Documents
      if (parsed.requiredDocuments && parsed.requiredDocuments.length > 0) {
        const docEv = (parsed.evidence || []).find((e: any) =>
          (e.category && e.category.includes('doc')) ||
          (e.requirement && e.requirement.toLowerCase().includes('document'))
        );
        allRequirements.push({
          id: 'req_documents',
          category: 'documents',
          label: 'Required Application Documents',
          requirementText: parsed.requiredDocuments.join(', '),
          evidenceSnippet: docEv?.snippet || parsed.requiredDocuments.join(', '),
          isMandatory: true
        });
      }

      // 8. Other requirements
      if (parsed.otherRequirements && parsed.otherRequirements.length > 0) {
        const otherEv = (parsed.evidence || []).find((e: any) =>
          (e.category && e.category.includes('other')) ||
          (e.requirement && e.requirement.toLowerCase().includes('other'))
        );
        allRequirements.push({
          id: 'req_other',
          category: 'other',
          label: 'Additional Conditions',
          requirementText: parsed.otherRequirements.join('; '),
          evidenceSnippet: otherEv?.snippet || parsed.otherRequirements.join('; '),
          isMandatory: false
        });
      }

      return {
        opportunityName: parsed.opportunityName || 'Educational Opportunity',
        organization: parsed.organization || 'Sponsoring Organization',
        type: (parsed.type || 'Scholarship') as any,
        deadline: parsed.deadline || 'Deadline not explicitly stated',
        location: parsed.location || 'Not specified',
        awardOrCompensation: parsed.awardOrCompensation || 'Not specified',
        summary: parsed.summary || `${parsed.opportunityName} hosted by ${parsed.organization}.`,
        eligibleCountries: parsed.eligibleCountries || [],
        eligibleNationalities: parsed.eligibleCountries || [],
        academicRequirements: parsed.academicRequirements || [],
        gpaRequirements: parsed.gpaRequirements || [],
        degreeRequirements: parsed.degreeRequirements || [],
        yearRequirements: parsed.yearRequirements || [],
        ageRequirements: parsed.ageRequirements || [],
        requiredDocuments: parsed.requiredDocuments || [],
        languageRequirements: parsed.languageRequirements || [],
        otherRequirements: parsed.otherRequirements || [],
        evidence: parsed.evidence || [],
        degreeLevels: parsed.degreeRequirements || [],
        fieldsOfStudy: parsed.academicRequirements || [],
        gpaRequirement: extractedMinGpa ? {
          minimumGpa: extractedMinGpa,
          scale: 4.0,
          evidenceSnippet: gpaSnippet || `Minimum cumulative GPA of ${extractedMinGpa}`
        } : null,
        allRequirements,
        rawTextLength: trimmed.length
      };
    } catch (err: any) {
      console.warn('Gemini Opportunity Analyzer failed or encountered an error. Falling back to deterministic extractor:', err?.message || err);
    }
  }

  // Deterministic rule-based extractor
  return extractOpportunityDeterministically(trimmed);
}

export function extractOpportunityDeterministically(text: string): OpportunityAnalysis {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let opportunityName = 'Educational Opportunity';
  let organization = 'Educational Institution / Sponsor';
  let deadline = 'Not explicitly specified';
  let award = 'Funding / Opportunity';
  let location = 'Unspecified';

  for (const line of lines) {
    if (/organization\s*:\s*(.+)/i.test(line)) {
      organization = line.replace(/organization\s*:\s*/i, '').trim();
    } else if (/sponsor\s*:\s*(.+)/i.test(line)) {
      organization = line.replace(/sponsor\s*:\s*/i, '').trim();
    } else if (/host institution\s*:\s*(.+)/i.test(line)) {
      organization = line.replace(/host institution\s*:\s*/i, '').trim();
    } else if (/deadline\s*:\s*(.+)/i.test(line)) {
      deadline = line.replace(/.*deadline\s*:\s*/i, '').trim();
    } else if (/award\s*:\s*(.+)/i.test(line) || /stipend\s*:\s*(.+)/i.test(line)) {
      award = line.replace(/.*(award|stipend)\s*:\s*/i, '').trim();
    } else if (/location\s*:\s*(.+)/i.test(line)) {
      location = line.replace(/location\s*:\s*/i, '').trim();
    }
  }

  if (lines.length > 0 && !lines[0].toLowerCase().includes('deadline') && !lines[0].toLowerCase().includes('eligibility')) {
    opportunityName = lines[0].replace(/[-–—].*$/, '').trim();
  }

  let type: OpportunityAnalysis['type'] = 'Scholarship';
  const lower = text.toLowerCase();
  if (lower.includes('fellowship')) type = 'Fellowship';
  else if (lower.includes('summer student') || lower.includes('research experience') || lower.includes('reu')) type = 'Research Program';
  else if (lower.includes('internship') || lower.includes('co-op')) type = 'Internship';
  else if (lower.includes('competition') || lower.includes('hackathon')) type = 'Competition';
  else if (lower.includes('grant')) type = 'Grant';

  const evidence: OpportunityEvidenceItem[] = [];
  const eligibleCountries: string[] = [];
  const academicRequirements: string[] = [];
  const gpaRequirements: string[] = [];
  const degreeRequirements: string[] = [];
  const yearRequirements: string[] = [];
  const ageRequirements: string[] = [];
  const requiredDocuments: string[] = [];
  const languageRequirements: string[] = [];
  const otherRequirements: string[] = [];

  // GPA
  let gpaRequirement: OpportunityAnalysis['gpaRequirement'] = null;
  const gpaMatch = text.match(/(?:minimum|cumulative)?\s*gpa\s*(?:of|>=|at least|:)?\s*([0-9](?:\.[0-9]+)?)(?:\s*(?:on a|out of|\/)\s*([0-9]\.[0-9]+))?/i);
  if (gpaMatch) {
    const min = parseFloat(gpaMatch[1]);
    const scale = gpaMatch[2] ? parseFloat(gpaMatch[2]) : 4.0;
    const startIdx = Math.max(0, gpaMatch.index! - 20);
    const endIdx = Math.min(text.length, gpaMatch.index! + gpaMatch[0].length + 50);
    const snippet = text.slice(startIdx, endIdx).replace(/\s+/g, ' ').trim();
    gpaRequirement = {
      minimumGpa: min,
      scale,
      evidenceSnippet: snippet
    };
    gpaRequirements.push(`Minimum cumulative GPA of ${min} on a ${scale} scale`);
    evidence.push({
      requirement: `Minimum cumulative GPA of ${min}`,
      snippet,
      category: 'GPA'
    });
  }

  // Citizenship / Countries
  const countryListMatch = text.match(/(?:eligible countries|countries eligible|eligible nationalities|citizenship eligible)\s*:\s*([^\n\r.]+)/i);
  if (countryListMatch) {
    const rawList = countryListMatch[1].split(/[,;/]/).map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    for (const c of rawList) {
      if (c && !eligibleCountries.includes(c)) {
        eligibleCountries.push(c);
      }
    }
    evidence.push({
      requirement: `Eligible Countries / Nationalities: ${eligibleCountries.join(', ')}`,
      snippet: countryListMatch[0].trim(),
      category: 'Nationality'
    });
  } else if (lower.includes('united states') || lower.includes('canada') || lower.includes('citizen') || lower.includes('member state')) {
    const citMatch = text.match(/(?:citizenship|eligible countries|national of|permanent resident|studying in)[\s\S]{10,120}\./i);
    const snippet = citMatch ? citMatch[0].replace(/\s+/g, ' ').trim() : 'Must satisfy citizenship or country enrollment criteria.';
    if (lower.includes('united states') && lower.includes('canada')) {
      eligibleCountries.push('United States', 'Canada');
    } else if (lower.includes('united states')) {
      eligibleCountries.push('United States');
    } else if (lower.includes('member state')) {
      eligibleCountries.push('CERN Member States & Associate States');
    }
    evidence.push({
      requirement: 'Country / Citizenship Eligibility',
      snippet,
      category: 'Nationality'
    });
  }

  // Degree
  if (lower.includes('undergraduate') || lower.includes('bachelor')) {
    degreeRequirements.push('Undergraduate / Bachelor’s Degree Program');
    const degMatch = text.match(/(?:undergraduate student|bachelor|enrolled as a)[\s\S]{10,100}\./i);
    if (degMatch) {
      evidence.push({
        requirement: 'Undergraduate Enrollment',
        snippet: degMatch[0].replace(/\s+/g, ' ').trim(),
        category: 'Degree'
      });
    }
  }

  // Fields / Majors
  if (lower.includes('computer science') || lower.includes('engineering') || lower.includes('robotics')) {
    academicRequirements.push('Computer Science, Engineering, or related technical disciplines');
    const fMatch = text.match(/(?:degree in|majors in|field of)[\s\S]{10,100}\./i);
    if (fMatch) {
      evidence.push({
        requirement: 'Field of Study',
        snippet: fMatch[0].replace(/\s+/g, ' ').trim(),
        category: 'Academic'
      });
    }
  }

  // Documents
  if (lower.includes('resume') || lower.includes('cv')) requiredDocuments.push('Resume / Curriculum Vitae');
  if (lower.includes('transcript')) requiredDocuments.push('Academic Transcript');
  if (lower.includes('recommendation') || lower.includes('reference')) requiredDocuments.push('Letter(s) of Recommendation');
  if (lower.includes('essay') || lower.includes('statement')) requiredDocuments.push('Personal Statement / Essays');

  // Build allRequirements
  const allRequirements: ExtractedRequirement[] = [];
  if (gpaRequirement) {
    allRequirements.push({
      id: 'req_gpa',
      category: 'gpa',
      label: 'Minimum Cumulative GPA',
      requirementText: `Minimum cumulative GPA of ${gpaRequirement.minimumGpa} on a ${gpaRequirement.scale} scale`,
      evidenceSnippet: gpaRequirement.evidenceSnippet,
      minimumGpa: gpaRequirement.minimumGpa,
      gpaScale: gpaRequirement.scale,
      isMandatory: true
    });
  }

  if (eligibleCountries.length > 0) {
    allRequirements.push({
      id: 'req_nationality',
      category: 'nationality',
      label: 'Eligible Countries & Citizenship',
      requirementText: eligibleCountries.join(', '),
      evidenceSnippet: evidence.find(e => e.category === 'Nationality')?.snippet || eligibleCountries.join(', '),
      eligibleCountries,
      isMandatory: true
    });
  }

  if (degreeRequirements.length > 0) {
    allRequirements.push({
      id: 'req_degree_level',
      category: 'degree_level',
      label: 'Academic Standing / Degree Level',
      requirementText: degreeRequirements.join('; '),
      evidenceSnippet: evidence.find(e => e.category === 'Degree')?.snippet || degreeRequirements.join('; '),
      isMandatory: true
    });
  }

  if (academicRequirements.length > 0) {
    allRequirements.push({
      id: 'req_field',
      category: 'field_of_study',
      label: 'Academic Disciplines & Standards',
      requirementText: academicRequirements.join('; '),
      evidenceSnippet: evidence.find(e => e.category === 'Academic')?.snippet || academicRequirements.join('; '),
      isMandatory: true
    });
  }

  if (requiredDocuments.length > 0) {
    allRequirements.push({
      id: 'req_documents',
      category: 'documents',
      label: 'Required Application Documents',
      requirementText: requiredDocuments.join(', '),
      evidenceSnippet: 'Official documents must be uploaded through the application portal before deadline.',
      isMandatory: true
    });
  }

  return {
    opportunityName,
    organization,
    type,
    deadline,
    location,
    awardOrCompensation: award,
    summary: `${opportunityName} hosted by ${organization}. Complete evaluation of eligibility and documentation requirements.`,
    eligibleCountries,
    eligibleNationalities: eligibleCountries,
    academicRequirements,
    gpaRequirements,
    degreeRequirements,
    yearRequirements,
    ageRequirements,
    requiredDocuments,
    languageRequirements,
    otherRequirements,
    evidence,
    degreeLevels: degreeRequirements,
    fieldsOfStudy: academicRequirements,
    gpaRequirement,
    allRequirements,
    rawTextLength: text.length
  };
}
