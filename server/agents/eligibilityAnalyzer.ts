import { StudentProfile, OpportunityAnalysis, EligibilityAnalysis, EligibilityCriterionResult } from './types';

export function runEligibilityAnalyzer(
  student: StudentProfile,
  opportunity: OpportunityAnalysis
): EligibilityAnalysis {
  const criteriaResults: EligibilityCriterionResult[] = [];
  const hardBlockers: string[] = [];

  // Helper to format criteria result with Section 6 fields
  const pushCriterion = (params: {
    id: string;
    requirement: string;
    requirementDetail?: string;
    studentInformation: string;
    status: 'MET' | 'NOT_MET' | 'NEEDS_VERIFICATION';
    evidence: string;
    explanation: string;
    isDeterministic: boolean;
    category?: any;
  }) => {
    criteriaResults.push({
      id: params.id,
      requirement: params.requirement,
      requirementLabel: params.requirement,
      requirementDetail: params.requirementDetail || params.requirement,
      studentInformation: params.studentInformation,
      studentValue: params.studentInformation,
      status: params.status,
      evidence: params.evidence,
      evidenceSnippet: params.evidence,
      explanation: params.explanation,
      reasoning: params.explanation,
      isDeterministic: params.isDeterministic,
      requirementCategory: params.category,
      category: params.category
    });
  };

  const oppTextCombined = `${opportunity.opportunityName} ${opportunity.organization} ${opportunity.summary} ${opportunity.allRequirements.map(r => r.requirementText).join(' ')} ${opportunity.eligibleCountries.join(' ')}`.toLowerCase();

  // 1. DETERMINISTIC GPA CHECK
  const minGpa = opportunity.gpaRequirement?.minimumGpa || 
    (opportunity.gpaRequirements && opportunity.gpaRequirements.length > 0 
      ? parseFloat(opportunity.gpaRequirements[0].match(/([0-9]\.[0-9]+)/)?.[1] || '0')
      : 0);

  if (minGpa > 0) {
    const studentGpa = student.gpa;
    const studentMaxGpa = student.maxGpa || 4.0;
    const gpaEvidence = opportunity.gpaRequirement?.evidenceSnippet || 
      opportunity.evidence.find(e => e.requirement.toLowerCase().includes('gpa') || e.category?.toLowerCase() === 'gpa')?.snippet ||
      `Minimum cumulative GPA of ${minGpa}`;

    if (studentGpa === undefined || studentGpa === null || isNaN(studentGpa) || studentGpa <= 0) {
      pushCriterion({
        id: 'crit_gpa',
        category: 'gpa',
        requirement: `Minimum GPA >= ${minGpa.toFixed(2)} on a 4.0 scale`,
        studentInformation: 'Not provided in profile',
        status: 'NEEDS_VERIFICATION',
        evidence: gpaEvidence,
        explanation: `Cannot verify GPA eligibility because your profile is missing cumulative GPA. The opportunity strictly requires a minimum GPA of ${minGpa.toFixed(2)}.`,
        isDeterministic: true
      });
    } else {
      const normalizedStudentGpa = studentMaxGpa === 4.0 ? studentGpa : (studentGpa / studentMaxGpa) * 4.0;
      if (normalizedStudentGpa >= minGpa) {
        const delta = (normalizedStudentGpa - minGpa).toFixed(2);
        pushCriterion({
          id: 'crit_gpa',
          category: 'gpa',
          requirement: `Minimum cumulative GPA >= ${minGpa.toFixed(2)} on a 4.0 scale`,
          studentInformation: `${student.gpa.toFixed(2)} / ${studentMaxGpa.toFixed(1)} (${student.university || 'Enrolled University'})`,
          status: 'MET',
          evidence: gpaEvidence,
          explanation: `Deterministic check passed in application code: Student cumulative GPA (${student.gpa.toFixed(2)}) meets or exceeds the required minimum (${minGpa.toFixed(2)}) by +${delta} points.`,
          isDeterministic: true
        });
      } else {
        const gap = (minGpa - normalizedStudentGpa).toFixed(2);
        hardBlockers.push(`GPA below requirement: ${student.gpa.toFixed(2)} vs ${minGpa.toFixed(2)} minimum`);
        pushCriterion({
          id: 'crit_gpa',
          category: 'gpa',
          requirement: `Minimum cumulative GPA >= ${minGpa.toFixed(2)} on a 4.0 scale`,
          studentInformation: `${student.gpa.toFixed(2)} / ${studentMaxGpa.toFixed(1)}`,
          status: 'NOT_MET',
          evidence: gpaEvidence,
          explanation: `Deterministic check failed: Student cumulative GPA (${student.gpa.toFixed(2)}) is below the required threshold (${minGpa.toFixed(2)}) by -${gap} points.`,
          isDeterministic: true
        });
      }
    }
  }

  // 2. NATIONALITY / COUNTRY / CITIZENSHIP CHECK
  const requiresUSCitizenship = oppTextCombined.includes('united states citizens') || 
    oppTextCombined.includes('us citizen') || 
    oppTextCombined.includes('permanent resident of the united states');

  const requiresUSorCanada = (oppTextCombined.includes('united states') && oppTextCombined.includes('canada')) ||
    opportunity.eligibleCountries.some(c => c.toLowerCase().includes('united states') || c.toLowerCase().includes('canada'));

  // Distinguish institution-location rules from citizenship/nationality rules.
  // If the source explicitly ties US/Canada eligibility to where the student studies,
  // an institution outside those countries is a deterministic hard failure, not
  // something that should be sent back as a vague verification request.
  const requiresUSorCanadaStudyLocation = requiresUSorCanada &&
    /(enrolled|studying|student at|university|college|institution|academic year|bachelor.?s program)/i.test(oppTextCombined);

  const countryEvidence = opportunity.evidence.find(e => 
    e.requirement.toLowerCase().includes('citizen') || 
    e.requirement.toLowerCase().includes('countr') ||
    e.category?.toLowerCase() === 'nationality'
  )?.snippet || (opportunity.eligibleCountries.length > 0 ? opportunity.eligibleCountries.join(', ') : 'Country and citizenship criteria in guidelines.');

  if (requiresUSCitizenship) {
    const studentCountry = (student.country || '').toLowerCase();
    const studentNat = (student.nationality || '').toLowerCase();

    if (!student.nationality && !student.country) {
      pushCriterion({
        id: 'crit_nationality',
        category: 'nationality',
        requirement: 'US Citizenship or Permanent Residency',
        studentInformation: 'Not provided in profile',
        status: 'NEEDS_VERIFICATION',
        evidence: countryEvidence,
        explanation: 'Cannot verify citizenship eligibility because your profile is missing nationality and country information.',
        isDeterministic: true
      });
    } else if (studentCountry.includes('united states') || studentCountry.includes('usa') || studentNat.includes('american') || studentNat.includes('us')) {
      pushCriterion({
        id: 'crit_nationality',
        category: 'nationality',
        requirement: 'US Citizenship or US Permanent Residency',
        studentInformation: `${student.nationality || 'American'} · Based in ${student.country || 'USA'}`,
        status: 'MET',
        evidence: countryEvidence,
        explanation: 'Deterministic check passed: Student citizenship/residency matches the federal grant citizenship requirement.',
        isDeterministic: true
      });
    } else {
      hardBlockers.push('Citizenship restriction: Requires US Citizenship or Permanent Residency');
      pushCriterion({
        id: 'crit_nationality',
        category: 'nationality',
        requirement: 'US Citizenship or US Permanent Residency',
        studentInformation: `${student.nationality || 'International'} · Based in ${student.country || 'Not specified'}`,
        status: 'NOT_MET',
        evidence: countryEvidence,
        explanation: `Deterministic check failed: Program strictly requires US Citizenship / Permanent Residency. Student profile lists nationality "${student.nationality || 'Non-US'}".`,
        isDeterministic: true
      });
    }
  } else if (requiresUSorCanadaStudyLocation) {
    const studentCountry = (student.country || '').toLowerCase().trim();
    const studentUniv = (student.university || '').trim();

    if (!studentCountry && !studentUniv) {
      pushCriterion({
        id: 'crit_nationality',
        category: 'nationality',
        requirement: 'Enrolled in an accredited institution in the United States or Canada',
        studentInformation: 'Institution location not provided in profile',
        status: 'NEEDS_VERIFICATION',
        evidence: countryEvidence,
        explanation: 'Cannot verify the institution-location requirement because the student profile does not provide a study country or university.',
        isDeterministic: true
      });
    } else if (
      studentCountry.includes('united states') || studentCountry.includes('usa') || studentCountry.includes('canada')
    ) {
      pushCriterion({
        id: 'crit_nationality',
        category: 'nationality',
        requirement: 'Enrolled in an accredited university in the United States or Canada',
        studentInformation: studentUniv ? `${studentUniv} (${student.country})` : student.country,
        status: 'MET',
        evidence: countryEvidence,
        explanation: 'Deterministic check passed: the student profile places the current institution in the required US/Canada study region.',
        isDeterministic: true
      });
    } else {
      hardBlockers.push(`Institution-location restriction: Current study location ${student.country} is outside the eligible United States/Canada region.`);
      pushCriterion({
        id: 'crit_nationality',
        category: 'nationality',
        requirement: 'Enrolled in an accredited institution in the United States or Canada',
        studentInformation: studentUniv ? `${studentUniv} (${student.country})` : student.country,
        status: 'NOT_MET',
        evidence: countryEvidence,
        explanation: `Deterministic check failed: the student profile places the current institution in ${student.country}, outside the required United States/Canada study region. This is an eligibility blocker unless the student will be enrolled in an eligible US/Canadian institution for the required upcoming period.`,
        isDeterministic: true
      });
    }
  }  } else if (opportunity.eligibleCountries.length > 0) {
    const studentNat = (student.nationality || '').toLowerCase().trim();
    const studentCountry = (student.country || '').toLowerCase().trim();

    if (!studentNat && !studentCountry) {
      pushCriterion({
        id: 'crit_nationality',
        category: 'nationality',
        requirement: `Eligible Countries / Nationalities: ${opportunity.eligibleCountries.join(', ')}`,
        studentInformation: 'Not provided in profile',
        status: 'NEEDS_VERIFICATION',
        evidence: countryEvidence,
        explanation: 'Cannot verify citizenship eligibility because your profile is missing nationality and country information.',
        isDeterministic: true
      });
    } else {
      const isGlobal = opportunity.eligibleCountries.some(c => {
        const cl = c.toLowerCase().trim();
        return cl.includes('open globally') || cl.includes('global') || cl.includes('worldwide') || cl.includes('all countries') || cl.includes('all nationalit') || cl.includes('all citizenship') || cl.includes('all ethnicit') || cl.includes('any nationality') || cl.includes('open to candidates of all') || cl === 'all' || cl === 'any';
      });

      const isMatch = isGlobal || opportunity.eligibleCountries.some(c => {
        const countryLower = c.toLowerCase().trim();
        return (studentNat && (countryLower.includes(studentNat) || studentNat.includes(countryLower))) ||
               (studentCountry && (countryLower.includes(studentCountry) || studentCountry.includes(countryLower)));
      });

      if (isMatch) {
        pushCriterion({
          id: 'crit_nationality',
          category: 'nationality',
          requirement: `Eligible Countries / Nationalities: ${opportunity.eligibleCountries.join(', ')}`,
          studentInformation: `${student.nationality || student.country}`,
          status: 'MET',
          evidence: countryEvidence,
          explanation: `Deterministic check passed: Student nationality/country (${student.nationality || student.country}) matches the eligible list (${opportunity.eligibleCountries.join(', ')}).`,
          isDeterministic: true
        });
      } else {
        hardBlockers.push(`Country restriction: ${student.nationality || student.country} not in eligible list (${opportunity.eligibleCountries.join(', ')})`);
        pushCriterion({
          id: 'crit_nationality',
          category: 'nationality',
          requirement: `Eligible Countries / Nationalities: ${opportunity.eligibleCountries.join(', ')}`,
          studentInformation: `${student.nationality || student.country}`,
          status: 'NOT_MET',
          evidence: countryEvidence,
          explanation: `Deterministic check failed: Student nationality/country (${student.nationality || student.country}) is not among the eligible countries (${opportunity.eligibleCountries.join(', ')}).`,
          isDeterministic: true
        });
      }
    }
  }

  // 3. ACADEMIC DEGREE LEVEL & ENROLLMENT STATUS
  const requiresUndergrad = oppTextCombined.includes('undergraduate') || oppTextCombined.includes('bachelor');
  const requiresGraduate = oppTextCombined.includes('master') || oppTextCombined.includes('doctoral') || oppTextCombined.includes('phd');
  const degreeEvidence = opportunity.evidence.find(e => 
    e.requirement.toLowerCase().includes('degree') || 
    e.requirement.toLowerCase().includes('undergraduate') ||
    e.category?.toLowerCase() === 'degree'
  )?.snippet || 'Degree standing specified in program eligibility conditions.';

  if (requiresUndergrad || requiresGraduate) {
    const studentDegree = (student.currentDegree || '').toLowerCase();

    if (!student.currentDegree) {
      pushCriterion({
        id: 'crit_degree_level',
        category: 'degree_level',
        requirement: requiresUndergrad ? 'Enrolled full-time undergraduate student' : 'University degree enrollment',
        studentInformation: 'Degree not provided in profile',
        status: 'NEEDS_VERIFICATION',
        evidence: degreeEvidence,
        explanation: 'Some eligibility requirements cannot be verified because your profile is missing current degree.',
        isDeterministic: true
      });
    } else if (requiresUndergrad && !requiresGraduate) {
      if (studentDegree.includes('bachelor') || studentDegree.includes('undergraduate') || studentDegree.includes('bs') || studentDegree.includes('ba')) {
        pushCriterion({
          id: 'crit_degree_level',
          category: 'degree_level',
          requirement: 'Currently enrolled undergraduate student in an accredited institution',
          studentInformation: `${student.currentDegree} · ${student.currentYearOrSemester || 'Current Standing'}`,
          status: 'MET',
          evidence: degreeEvidence,
          explanation: `Deterministic check passed: Student is actively enrolled in an undergraduate degree program (${student.currentDegree}).`,
          isDeterministic: true
        });
      } else if (studentDegree.includes('master') || studentDegree.includes('phd') || studentDegree.includes('doctor')) {
        hardBlockers.push('Degree mismatch: Requires undergraduate student standing');
        pushCriterion({
          id: 'crit_degree_level',
          category: 'degree_level',
          requirement: 'Currently enrolled undergraduate student',
          studentInformation: `${student.currentDegree}`,
          status: 'NOT_MET',
          evidence: degreeEvidence,
          explanation: `Deterministic check failed: Opportunity requires undergraduate status, but student is enrolled in a graduate program (${student.currentDegree}).`,
          isDeterministic: true
        });
      } else {
        pushCriterion({
          id: 'crit_degree_level',
          category: 'degree_level',
          requirement: 'Undergraduate student enrollment',
          studentInformation: student.currentDegree,
          status: 'NEEDS_VERIFICATION',
          evidence: degreeEvidence,
          explanation: `Student listed degree "${student.currentDegree}". Verify with sponsoring department if this qualifies for undergraduate criteria.`,
          isDeterministic: false
        });
      }
    } else {
      pushCriterion({
        id: 'crit_degree_level',
        category: 'degree_level',
        requirement: 'Post-secondary university degree enrollment',
        studentInformation: student.currentDegree,
        status: 'MET',
        evidence: degreeEvidence,
        explanation: `Student degree enrollment (${student.currentDegree}) satisfies the general university standing requirement.`,
        isDeterministic: true
      });
    }
  }

  // 4. FIELD OF STUDY / MAJOR
  const fieldEvidence = opportunity.evidence.find(e => 
    e.requirement.toLowerCase().includes('field') || 
    e.requirement.toLowerCase().includes('major') ||
    e.requirement.toLowerCase().includes('academic') ||
    e.category?.toLowerCase() === 'academic'
  )?.snippet || (opportunity.academicRequirements.length > 0 ? opportunity.academicRequirements.join('; ') : 'Academic field criteria.');

  if (!student.fieldOfStudy) {
    pushCriterion({
      id: 'crit_field',
      category: 'field_of_study',
      requirement: 'Pursuing eligible academic discipline / major',
      studentInformation: 'Field of study not specified in profile',
      status: 'NEEDS_VERIFICATION',
      evidence: fieldEvidence,
      explanation: 'Some eligibility requirements cannot be verified because your profile is missing field of study / major.',
      isDeterministic: true
    });
  } else {
    const studentField = student.fieldOfStudy.toLowerCase();
    const techKeywords = ['computer', 'software', 'data', 'information', 'ai', 'artificial intelligence', 'engineering', 'science', 'math', 'robotics', 'physics'];
    const isTechMajor = techKeywords.some(kw => studentField.includes(kw));

    if (oppTextCombined.includes('computer science') || oppTextCombined.includes('engineering') || oppTextCombined.includes('stem')) {
      if (isTechMajor) {
        pushCriterion({
          id: 'crit_field',
          category: 'field_of_study',
          requirement: 'Degree in Computer Science, Engineering, or related technical disciplines',
          studentInformation: student.fieldOfStudy,
          status: 'MET',
          evidence: fieldEvidence,
          explanation: `Deterministic keyword match: Student field of study "${student.fieldOfStudy}" directly falls within the eligible disciplines.`,
          isDeterministic: true
        });
      } else {
        pushCriterion({
          id: 'crit_field',
          category: 'field_of_study',
          requirement: 'Technical STEM discipline (Computer Science, Engineering, or Mathematics)',
          studentInformation: student.fieldOfStudy,
          status: 'NEEDS_VERIFICATION',
          evidence: fieldEvidence,
          explanation: `Student is pursuing "${student.fieldOfStudy}". Check if computing minor or interdisciplinary coursework satisfies the department sponsor.`,
          isDeterministic: false
        });
      }
    } else {
      pushCriterion({
        id: 'crit_field',
        category: 'field_of_study',
        requirement: 'Eligible academic discipline',
        studentInformation: student.fieldOfStudy,
        status: 'MET',
        evidence: fieldEvidence,
        explanation: `Student field of study (${student.fieldOfStudy}) matches the open or stated academic parameters.`,
        isDeterministic: false
      });
    }
  }

  // 5. GRADUATION YEAR & CONTINUATION TIMELINE
  // Do not infer an enrollment requirement merely because the candidate has a graduation year.
  // Only evaluate this criterion when the opportunity explicitly states a year/cohort/enrollment rule.
  if ((opportunity.yearRequirements || []).length > 0) {
    const currentYear = new Date().getFullYear();
    const gradEvidence = opportunity.evidence.find(e =>
      e.requirement.toLowerCase().includes('year') ||
      e.requirement.toLowerCase().includes('graduat') ||
      e.requirement.toLowerCase().includes('cohort') ||
      e.category?.toLowerCase().includes('year')
    )?.snippet || 'Enrollment/year requirement extracted from the opportunity source.';

    if (!student.expectedGraduationYear) {
      pushCriterion({
        id: 'crit_graduation',
        category: 'year_semester',
        requirement: 'Enrollment continuity and graduation year verification',
        studentInformation: 'Graduation year missing from profile',
        status: 'NEEDS_VERIFICATION',
        evidence: gradEvidence,
        explanation: 'The opportunity contains an explicit year/cohort condition, but the student profile is missing graduation-year information.',
        isDeterministic: true
      });
    } else if (oppTextCombined.includes('graduating seniors') && oppTextCombined.includes('not eligible')) {
      if (student.expectedGraduationYear <= currentYear) {
        hardBlockers.push('Ineligible graduation cohort (graduating seniors excluded from program)');
        pushCriterion({
          id: 'crit_graduation',
          category: 'year_semester',
          requirement: 'Must be continuing undergraduate (graduating seniors ineligible)',
          studentInformation: `Expected Graduation: ${student.expectedGraduationYear}`,
          status: 'NOT_MET',
          evidence: gradEvidence,
          explanation: `Deterministic check failed: Opportunity excludes graduating seniors, and student graduation year is ${student.expectedGraduationYear}.`,
          isDeterministic: true
        });
      } else {
        pushCriterion({
          id: 'crit_graduation',
          category: 'year_semester',
          requirement: 'Must be continuing undergraduate student (non-graduating senior)',
          studentInformation: `Expected Graduation: ${student.expectedGraduationYear} (${student.currentYearOrSemester || 'Continuing'})`,
          status: 'NEEDS_VERIFICATION',
          evidence: gradEvidence,
          explanation: 'Expected graduation suggests continued study, but active enrollment should be confirmed against the opportunity start period.',
          isDeterministic: false
        });
      }
    } else {
      pushCriterion({
        id: 'crit_graduation',
        category: 'year_semester',
        requirement: 'Enrollment/year eligibility requirement',
        studentInformation: `Expected Graduation: ${student.expectedGraduationYear}`,
        status: 'NEEDS_VERIFICATION',
        evidence: gradEvidence,
        explanation: 'Expected graduation suggests continued study, but the opportunity-specific enrollment/year condition requires verification against the programme dates.',
        isDeterministic: false
      });
    }
  }

  // Application documents are intentionally NOT eligibility criteria.
  // Their preparation/readiness is handled by Stage 4 (Application Planner).
  // This prevents missing documents from changing a candidate's eligibility status.

  // Calculate statistics
  const metCount = criteriaResults.filter(c => c.status === 'MET').length;
  const notMetCount = criteriaResults.filter(c => c.status === 'NOT_MET').length;
  const needsVerificationCount = criteriaResults.filter(c => c.status === 'NEEDS_VERIFICATION').length;

  let overallStatus: 'MET' | 'NOT_MET' | 'NEEDS_VERIFICATION' = 'MET';
  if (notMetCount > 0) {
    overallStatus = 'NOT_MET';
  } else if (needsVerificationCount > 0) {
    overallStatus = 'NEEDS_VERIFICATION';
  }

  let summary = '';
  if (overallStatus === 'MET') {
    summary = `Student satisfies all evaluated mandatory eligibility criteria (${metCount}/${criteriaResults.length} criteria MET). Hard numerical and cohort checks passed deterministically in code.`;
  } else if (overallStatus === 'NOT_MET') {
    summary = `Hard eligibility blocker(s) detected: ${hardBlockers.join('; ')}. The applicant does not meet one or more mandatory conditions.`;
  } else {
    summary = `${metCount} criteria MET, with ${needsVerificationCount} item(s) requiring verification or pending missing profile fields.`;
  }

  return {
    overallStatus,
    metCount,
    notMetCount,
    needsVerificationCount,
    totalCriteriaCount: criteriaResults.length,
    criteriaResults,
    hardBlockers,
    summary
  };
}
