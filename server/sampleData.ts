import { StudentProfile, FullAnalysisResult } from './agents/types';

export const SAMPLE_STUDENT_PROFILES: Record<string, StudentProfile> = {
  elena_cs: {
    id: 'elena_cs',
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
    technicalSkills: [
      'Algorithms & Data Structures',
      'Distributed Systems',
      'Machine Learning Pipeline Design',
      'Computer Vision',
      'REST APIs'
    ],
    programmingLanguages: ['Python', 'TypeScript', 'C++', 'SQL', 'Go'],
    aiMlSkills: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Hugging Face Transformers', 'LangChain'],
    otherSkills: ['Git / CI/CD', 'Docker', 'Technical Writing', 'Public Speaking', 'Agile Scrum'],
    internships: [
      {
        role: 'Software Engineering Intern (Backend)',
        organization: 'Kite FinTech Labs',
        duration: 'June 2025 – August 2025 (3 months)',
        description: 'Engineered high-throughput transaction indexing microservice in Go and PostgreSQL, reducing latency by 28%. Participated in production on-call rotation and peer code reviews.'
      },
      {
        role: 'Data Science Intern',
        organization: 'Urban Green Mobility Initiative',
        duration: 'January 2025 – May 2025 (5 months)',
        description: 'Built geospatial time-series forecasting models for city electric scooter demand using XGBoost and Pandas. Deployed inference container to AWS ECS.'
      }
    ],
    researchExperience: [
      {
        title: 'Undergraduate Researcher — Efficient Deep Learning Lab',
        labOrMentor: 'Prof. S. Vance, Dept of Computer Science',
        description: 'Investigating quantization and pruning techniques on vision-language models for edge robotics. Co-authored workshop paper submitted to CVPR Undergraduate Track.',
        publicationsOrOutcomes: 'Submitted workshop paper: "Zero-Latency Quantized Multi-Modal Ingestion for Edge Drones" (under review).'
      }
    ],
    projects: [
      {
        title: 'NeuralScribe — Accessible Lecture Transcriber & Visual Summarizer',
        techStack: ['Python', 'Whisper API', 'React', 'FastAPI', 'TailwindCSS'],
        description: 'Full-stack application serving over 1,200 students with real-time captioning, semantic concept indexing, and auto-generated latex formula cards.',
        linkOrProof: 'https://github.com/elena-rostova/neural-scribe'
      },
      {
        title: 'Autonomous Rover Obstacle Mapping Simulator',
        techStack: ['C++', 'ROS 2', 'Gazebo', 'OpenCV'],
        description: 'Implemented 2D LiDAR SLAM mapping and A* path planning algorithm with dynamic avoidance in Gazebo simulation.',
        linkOrProof: 'https://github.com/elena-rostova/rover-slam-sim'
      }
    ],
    leadership: [
      {
        role: 'Vice President & Technical Workshop Lead',
        organization: 'ACM-W (Association for Computing Machinery - Women)',
        description: 'Organized 8 hands-on machine learning and technical interview prep bootcamps for 250+ undergraduate members. Mentored 12 underrepresented freshmen students.'
      },
      {
        role: 'Undergraduate Teaching Assistant (CSE 332: Data Structures)',
        organization: 'University of Washington CSE',
        description: 'Led weekly quiz sections of 32 students, held office hours, and graded programming projects in C++ and Java.'
      }
    ],
    certificationsAwards: [
      {
        name: 'Dean’s List Honors (5 consecutive semesters)',
        issuer: 'University of Washington College of Engineering',
        year: '2024–2026'
      },
      {
        name: '1st Place Winner — HackNorthwest AI Track',
        issuer: 'Major League Hacking (MLH)',
        year: '2025'
      },
      {
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: '2025'
      }
    ]
  },
  marcus_eng: {
    id: 'marcus_eng',
    name: 'Marcus Chen',
    country: 'Canada',
    nationality: 'Canadian',
    age: 20,
    currentDegree: 'Bachelor of Applied Science',
    fieldOfStudy: 'Mechanical Engineering (Mechatronics Option)',
    university: 'University of Waterloo',
    currentYearOrSemester: '2nd Year (Sophomore)',
    gpa: 3.48,
    maxGpa: 4.0,
    expectedGraduationYear: 2028,
    technicalSkills: ['SolidWorks CAD', 'Finite Element Analysis', 'ROS 2', 'Embedded Microcontrollers', 'PCB Layout'],
    programmingLanguages: ['C++', 'Python', 'C', 'MATLAB'],
    aiMlSkills: ['Computer Vision with OpenCV', 'Basic PyTorch'],
    otherSkills: ['Rapid Prototyping', '3D Printing', 'Machining (Mill & Lathe)'],
    internships: [
      {
        role: 'Hardware Prototyping Co-op',
        organization: 'Apex Robotics Systems',
        duration: 'September 2025 – December 2025 (4 months)',
        description: 'Designed CNC mounting brackets and cabling harnesses for multi-axis robotic pick-and-place arms.'
      }
    ],
    researchExperience: [
      {
        title: 'Student Researcher — Autonomous Vehicles Group',
        labOrMentor: 'Waterloo Autonomous Racing Team',
        description: 'Calibrated stereoscopic cameras and IMU sensor fusion on scale-1:10 autonomous electric karts.'
      }
    ],
    projects: [
      {
        title: 'Custom 4-DOF Robotic Arm with Inverse Kinematics',
        techStack: ['SolidWorks', 'Arduino', 'C++', 'Python GUI'],
        description: 'Built a 3D-printed desktop arm capable of 0.5mm repeatability for automated chess playing.'
      }
    ],
    leadership: [
      {
        role: 'Chassis Team Lead',
        organization: 'Formula SAE Electric Team',
        description: 'Managed a subgroup of 6 junior members to manufacture tubular steel space frame.'
      }
    ],
    certificationsAwards: [
      {
        name: 'Certified SolidWorks Associate (CSWA)',
        issuer: 'Dassault Systèmes',
        year: '2024'
      }
    ]
  },
  amina_global: {
    id: 'amina_global',
    name: 'Amina Al-Mansoor',
    country: 'Jordan',
    nationality: 'Jordanian',
    age: 22,
    currentDegree: 'Bachelor of Science',
    fieldOfStudy: 'Data Science & Global Public Policy',
    university: 'American University of Beirut',
    currentYearOrSemester: '4th Year (Senior)',
    gpa: 3.93,
    maxGpa: 4.0,
    expectedGraduationYear: 2026,
    technicalSkills: ['Econometric Modeling', 'R Tidyverse', 'SQL', 'Data Visualization', 'Tableau', 'Survey Analysis'],
    programmingLanguages: ['R', 'Python', 'SQL'],
    aiMlSkills: ['NLP for Policy Text Analysis', 'Statistical Inference'],
    otherSkills: ['Bilingual (Arabic Native, English Fluent C2)', 'Policy Brief Writing', 'Grant Management'],
    internships: [
      {
        role: 'Policy Data Analyst Intern',
        organization: 'UNICEF Regional Office for MENA',
        duration: 'June 2025 – November 2025 (6 months)',
        description: 'Synthesized regional youth employment indicators across 8 countries to draft executive recommendations for economic ministries.'
      }
    ],
    researchExperience: [
      {
        title: 'Senior Honors Thesis: Predictive Resource Allocation for Refugee Healthcare Clinics',
        labOrMentor: 'Center for Civic Engagement & Research',
        description: 'Developed Bayesian spatial queueing models predicting clinic wait times in municipal centers.'
      }
    ],
    projects: [
      {
        title: 'MENA Civic Data Observatory',
        techStack: ['Python', 'Streamlit', 'PostgreSQL', 'Plotly'],
        description: 'Open-source interactive portal tracking legislative transparency indicators across 14 municipal jurisdictions.'
      }
    ],
    leadership: [
      {
        role: 'President of Student Representative Council',
        organization: 'American University of Beirut',
        description: 'Elected to represent 9,000 students; negotiated revised campus digital accessibility policies with the University Senate.'
      }
    ],
    certificationsAwards: [
      {
        name: 'Presidential Merit Scholarship Winner (Full Tuition)',
        issuer: 'AUB Board of Trustees',
        year: '2022–2026'
      },
      {
        name: 'Young Arab Leaders Fellow',
        issuer: 'YAL MENA',
        year: '2025'
      }
    ]
  }
};

export const SAMPLE_OPPORTUNITIES: Array<{
  id: string;
  name: string;
  organization: string;
  type: string;
  deadlineDisplay: string;
  description: string;
  rawText: string;
}> = [
  {
    id: 'google_generation',
    name: 'Generation Google Scholarship (North America)',
    organization: 'Google Inc.',
    type: 'Scholarship',
    deadlineDisplay: 'December 15, 2026 at 11:59 PM PST',
    description: 'A $10,000 USD merit and diversity scholarship for undergraduate students in Computer Science, Computer Engineering, or related fields.',
    rawText: `GENERATION GOOGLE SCHOLARSHIP (NORTH AMERICA) - OFFICIAL APPLICATION GUIDE

Organization: Google Inc.
Program: Generation Google Scholarship for Underrepresented Students in Technology
Award: $10,000 USD (for students studying in the United States) or $5,000 CAD (for students studying in Canada) for the upcoming academic year.
Application Deadline: December 15, 2026 at 11:59 PM Pacific Standard Time (PST). Late or incomplete applications will not be reviewed under any circumstance.

1. ELIGIBILITY REQUIREMENTS
To be eligible to apply, applicants must satisfy ALL of the following criteria:
- Must be currently enrolled as a full-time undergraduate student at an accredited university or college in the United States or Canada for the current academic year.
- Must intend to be enrolled in or accepted as a full-time student in a Bachelor’s program at an accredited university in the United States or Canada for the upcoming academic year.
- Must be pursuing a degree in Computer Science, Computer Engineering, Software Engineering, or a closely related technical field.
- Must demonstrate a strong academic record with a minimum cumulative GPA of 3.2 on a 4.0 scale (or equivalent).
- Must exemplify leadership and demonstrate a passion for improving representation of historically underrepresented groups in computer science and technology.
- Applicants of all genders and racial/ethnic backgrounds are eligible, with special encouragement for women, Hispanic/Latino, Black/African American, Native American, or students with disabilities.

2. REQUIRED DOCUMENTS & SUBMISSION MATERIALS
All applicants must submit the following documents in PDF format through the official application portal:
- Current Resume / Curriculum Vitae highlighting technical projects, work experience, open-source contributions, and community leadership.
- Current Academic Transcript (official or unofficial accepted; must clearly show cumulative GPA, institution name, and completed coursework).
- Two Short Answer Essay Responses (maximum 400 words each):
  * Essay 1: Describe a time when you identified a barrier to diversity, equity, or inclusion in technology or your community, and what actions you took to address it.
  * Essay 2: Explain your long-term career aspirations in computing and how this scholarship will enable you to make a tangible technical impact.
- One Letter of Recommendation from an academic instructor, professor, or technical manager who can speak directly to your technical aptitude and character.

3. SELECTION CRITERIA
Recipients will be selected based on the overall strength of their essay responses, academic record, leadership potential, and demonstrated commitment to diversity and inclusion. Recipients will also be invited to attend the annual Google Scholars Retreat.`
  },
  {
    id: 'cern_summer',
    name: 'CERN Summer Student Programme 2027',
    organization: 'CERN (European Organization for Nuclear Research)',
    type: 'Research Program',
    deadlineDisplay: 'January 31, 2027 at 12:00 CET',
    description: 'Fully funded 8-13 week research residency in Geneva, Switzerland, working with leading physicists and software engineers on LHC data acquisition, distributed systems, and instrumentation.',
    rawText: `CERN SUMMER STUDENT PROGRAMME - GENEVA, SWITZERLAND

Host Institution: European Organization for Nuclear Research (CERN)
Location: Geneva, Switzerland / Meyrin Site
Duration: 8 to 13 weeks during the summer period (June to September).
Financial Support: Daily living allowance of 92 CHF per day (net of tax), comprehensive health insurance, and reimbursed travel expenses to and from Geneva.
Application Deadline: January 31, 2027 at 12:00 (midday) Central European Time (CET).

1. ELIGIBILITY CRITERIA
Candidates must fulfill ALL conditions below:
- You are a national of a CERN Member State, Associate Member State, or eligible Non-Member State student program.
- You have completed at least 3 years of full-time studies at university level (Bachelor or Master) in Physics, Computing / Computer Science, Mathematics, or Engineering. You must have reached at least third-year status by the time the programme begins.
- You have not previously worked at CERN as a Summer Student or technical intern for more than 2 months.
- You have a good knowledge of English; knowledge of French is an asset but not mandatory.
- You will remain enrolled as a student at your home university during the entire duration of the programme.

2. REQUIRED APPLICATION DOSSIER
Candidates must upload all documents into the SmartRecruiters system before the deadline:
- An updated Curriculum Vitae in English or French (Europass or clear academic format).
- Most recent official university transcript of records covering all completed university grades and current semester courses.
- Two recent letters of reference from university lecturers or research supervisors (valid within the last 12 months).
- Statement of Purpose detailing technical and scientific interests (computing, instrumentation, accelerator physics, distributed systems, data processing).

3. TECHNICAL SCOPE
Students participate in day-to-day experimental work with high-energy physics teams. Typical projects involve C++, Python, Linux cluster computing, detector simulation in Geant4, or FPGA digital electronics.`
  },
  {
    id: 'schwarzman_scholars',
    name: 'Schwarzman Scholars Leadership Fellowship',
    organization: 'Schwarzman Scholars / Tsinghua University',
    type: 'Fellowship',
    deadlineDisplay: 'September 19, 2026 at 11:59 PM EDT',
    description: 'Fully funded 1-year Master’s Degree in Global Affairs at Tsinghua University in Beijing, designed to prepare the next generation of global leaders.',
    rawText: `SCHWARZMAN SCHOLARS GLOBAL LEADERSHIP FELLOWSHIP

Institution: Schwarzman College at Tsinghua University, Beijing, China
Degree Granted: Master of Global Affairs (fully taught in English)
Funding Coverage: 100% fully funded including tuition, room and board, travel to and from Beijing, health insurance, stipend of $4,000 USD, and laptop/books allowance.
Application Deadline: September 19, 2026 at 11:59 PM Eastern Daylight Time (EDT).

1. ELIGIBILITY CRITERIA
- Undergraduate Degree: Applicants must have successfully completed an undergraduate degree or first bachelor’s degree from an accredited college or university prior to August 1 of the enrollment year.
- Age Requirement: Candidates must be at least 18 but not yet 29 years of age as of August 1 of their matriculation year.
- English Language Proficiency: Strong English proficiency is required. Applicants whose native language is not English must provide official TOEFL (minimum 100) or IELTS (minimum 7.0) scores, unless their undergraduate degree was taught entirely in English.
- Academic Performance: No minimum GPA is formally established; however, competitive applicants typically demonstrate exceptional academic achievement in their respective fields (typically top 10% of their graduating class).
- Citizenship: Open to candidates of all nationalities, ethnicities, and citizenship backgrounds without quota or preference.

2. APPLICATION REQUIREMENTS
- Completed online biographical form.
- Current Resume / CV (maximum 2 pages).
- Two Personal Essays:
  1. Leadership Essay (750 words): Provide a specific, concrete example of a leadership challenge where you mobilized others, navigated adversity, and generated demonstrable outcomes.
  2. Statement of Purpose (500 words): Articulate how a Master’s in Global Affairs in Beijing aligns with your vision to address pressing 21st-century global challenges.
- Three Letters of Recommendation:
  * Two academic recommendations from professors who know your intellectual capacity.
  * One professional or institutional recommendation addressing your leadership initiative.
- Official Transcripts from every post-secondary institution attended.
- 1-minute introductory video.`
  },
  {
    id: 'nsf_reu',
    name: 'NSF REU Fellowship in Intelligent Robotics & Systems',
    organization: 'National Science Foundation (NSF)',
    type: 'Research Program',
    deadlineDisplay: 'February 15, 2027 at 5:00 PM EST',
    description: '10-week funded undergraduate research experience offering a $7,000 stipend, on-campus housing, and hands-on laboratory mentoring in autonomous systems.',
    rawText: `NATIONAL SCIENCE FOUNDATION (NSF) RESEARCH EXPERIENCES FOR UNDERGRADUATES (REU)
Site: Institute for Autonomous Systems & Intelligent Robotics

Sponsor: National Science Foundation (NSF Award #2419082)
Duration: 10 weeks (May 28, 2027 – August 6, 2027)
Award: $7,000 summer stipend, on-campus university housing, meal plan allowance, and up to $600 travel reimbursement.
Application Deadline: February 15, 2027 at 5:00 PM Eastern Standard Time (EST).

1. MANDATORY NSF ELIGIBILITY CRITERIA
Strict Federal Regulations apply to this grant:
- Citizenship: United States Citizens, US Nationals, or permanent residents of the United States. International students holding F-1 or J-1 student visas are NOT eligible due to federal NSF grant restrictions.
- Academic Level: Must be currently enrolled in an undergraduate degree program (freshman, sophomore, or junior standing). Graduating seniors (graduating in May/June 2027 or earlier) are NOT eligible.
- Field of Study: Majors in Computer Science, Mechanical Engineering, Electrical & Computer Engineering, Robotics, or Applied Mathematics.
- Academic Standing: Minimum cumulative GPA of 3.0 on a 4.0 scale.

2. SUBMISSION DOSSIER
- Academic Transcript (unofficial acceptable during review).
- 2-page Statement of Research Interests explaining background in programming (Python/C++), hardware/simulation experience, and desired faculty projects.
- Resume including prior coursework, technical projects, and extracurriculars.
- Two letters of recommendation from STEM faculty members.`
  }
];

// Pre-computed fallback analysis for instant demo execution if API keys are missing or throttled
export const DEMO_PRECOMPUTED_ANALYSIS: FullAnalysisResult = {
  id: 'demo-google-gen-elena',
  createdAt: '2026-10-02T15:00:00.000Z',
  opportunityName: 'Generation Google Scholarship (North America)',
  studentName: 'Elena Rostova',
  isDemoFallback: true,
  opportunity: {
    opportunityName: 'Generation Google Scholarship (North America)',
    organization: 'Google Inc.',
    type: 'Scholarship',
    deadline: 'December 15, 2026 at 11:59 PM PST',
    deadlineDate: '2026-12-15T23:59:00-08:00',
    location: 'United States & Canada',
    awardOrCompensation: '$10,000 USD (US) / $5,000 CAD (Canada)',
    summary: 'A prestigious merit and diversity scholarship awarded to undergraduate students in Computer Science and related computing fields who demonstrate strong academic performance and leadership in expanding computing opportunities for underrepresented groups.',
    eligibleCountries: ['United States', 'Canada'],
    eligibleNationalities: ['United States', 'Canada', 'International students currently studying at accredited US/Canadian institutions'],
    academicRequirements: ['Computer Science', 'Computer Engineering', 'Software Engineering'],
    gpaRequirements: ['Minimum cumulative GPA of 3.2 on a 4.0 scale'],
    degreeRequirements: ['Undergraduate (Bachelor of Science / Bachelor of Arts)'],
    yearRequirements: ['Currently enrolled full-time undergraduate continuing next academic year'],
    ageRequirements: [],
    requiredDocuments: [
      'Resume / Curriculum Vitae',
      'Academic Transcript (showing GPA)',
      'Two Short Answer Essays',
      'Letter of Recommendation'
    ],
    requiredDocumentDetails: [
      {
        name: 'Resume / Curriculum Vitae',
        details: 'Highlighting technical projects, work experience, open-source contributions, and community leadership.',
        evidenceSnippet: 'Current Resume / Curriculum Vitae highlighting technical projects, work experience, open-source contributions, and community leadership.',
        isMandatory: true
      },
      {
        name: 'Academic Transcript',
        details: 'Official or unofficial accepted; must clearly show cumulative GPA, institution name, and completed coursework.',
        evidenceSnippet: 'Current Academic Transcript (official or unofficial accepted; must clearly show cumulative GPA, institution name, and completed coursework).',
        isMandatory: true
      },
      {
        name: 'Two Short Answer Essays',
        details: 'Maximum 400 words each on diversity/equity barriers addressed and long-term computing impact.',
        evidenceSnippet: 'Two Short Answer Essay Responses (maximum 400 words each) on diversity barriers and career aspirations.',
        isMandatory: true
      },
      {
        name: 'Letter of Recommendation',
        details: 'From an academic instructor, professor, or technical manager who can speak to technical aptitude and character.',
        evidenceSnippet: 'One Letter of Recommendation from an academic instructor, professor, or technical manager who can speak directly to your technical aptitude and character.',
        isMandatory: true
      }
    ],
    languageRequirements: ['English (Academic Working Proficiency)'],
    otherRequirements: ['Commitment to diversity and inclusion in technology'],
    evidence: [
      {
        requirement: 'Minimum GPA of 3.2',
        snippet: 'Must demonstrate a strong academic record with a minimum cumulative GPA of 3.2 on a 4.0 scale (or equivalent).',
        category: 'GPA'
      },
      {
        requirement: 'Eligible Location',
        snippet: 'accredited university or college in the United States or Canada for the current academic year.',
        category: 'Nationality'
      }
    ],
    allRequirements: [
      {
        id: 'req_gpa',
        category: 'gpa',
        label: 'Minimum Cumulative GPA',
        requirementText: 'Minimum cumulative GPA of 3.2 on a 4.0 scale',
        evidenceSnippet: 'Must demonstrate a strong academic record with a minimum cumulative GPA of 3.2 on a 4.0 scale (or equivalent).',
        minimumGpa: 3.2,
        gpaScale: 4.0,
        isMandatory: true
      },
      {
        id: 'req_enrollment',
        category: 'degree_level',
        label: 'Current Undergraduate Enrollment',
        requirementText: 'Enrolled as a full-time undergraduate student at an accredited US or Canadian university',
        evidenceSnippet: 'Must be currently enrolled as a full-time undergraduate student at an accredited university or college in the United States or Canada.',
        eligibleDegrees: ['Bachelor of Science', 'Bachelor of Arts'],
        eligibleLevels: ['Undergraduate', 'Junior', 'Sophomore', 'Freshman'],
        isMandatory: true
      },
      {
        id: 'req_field',
        category: 'field_of_study',
        label: 'Degree Field / Major',
        requirementText: 'Computer Science, Computer Engineering, Software Engineering, or related technical field',
        evidenceSnippet: 'Must be pursuing a degree in Computer Science, Computer Engineering, Software Engineering, or a closely related technical field.',
        eligibleFields: ['Computer Science', 'Computer Engineering', 'Software Engineering', 'Artificial Intelligence', 'Data Science'],
        isMandatory: true
      },
      {
        id: 'req_institution_location',
        category: 'nationality',
        label: 'Eligible Study Location',
        requirementText: 'Studying in United States or Canada',
        evidenceSnippet: 'accredited university or college in the United States or Canada for the current academic year.',
        eligibleCountries: ['United States', 'Canada'],
        isMandatory: true
      },
      {
        id: 'req_future_enrollment',
        category: 'year_semester',
        label: 'Upcoming Year Enrollment',
        requirementText: 'Must intend to remain enrolled in a Bachelor’s program for upcoming academic year',
        evidenceSnippet: 'Must intend to be enrolled in or accepted as a full-time student in a Bachelor’s program at an accredited university in the United States or Canada for the upcoming academic year.',
        isMandatory: true
      },
      {
        id: 'req_leadership_diversity',
        category: 'other',
        label: 'Commitment to Diversity & Inclusion',
        requirementText: 'Demonstrated passion for improving representation of underrepresented groups in computer science',
        evidenceSnippet: 'Must exemplify leadership and demonstrate a passion for improving representation of historically underrepresented groups in computer science and technology.',
        isMandatory: true
      }
    ],
    rawTextLength: 2180
  },
  eligibility: {
    overallStatus: 'MET',
    metCount: 6,
    notMetCount: 0,
    needsVerificationCount: 0,
    totalCriteriaCount: 6,
    hardBlockers: [],
    summary: 'Elena meets all 6 mandatory eligibility requirements, including deterministic GPA threshold (3.82 vs 3.20 required), full-time undergraduate status at University of Washington, relevant Computer Science major, and location qualifications.',
    criteriaResults: [
      {
        id: 'crit_gpa',
        requirementCategory: 'gpa',
        requirement: 'Cumulative GPA Threshold (>= 3.20)',
        requirementLabel: 'Cumulative GPA Threshold',
        requirementDetail: 'Requires cumulative GPA >= 3.20 on a 4.0 scale',
        studentInformation: '3.82 / 4.00 (UW Seattle)',
        studentValue: '3.82 / 4.00 (UW Seattle)',
        status: 'MET',
        evidence: 'Must demonstrate a strong academic record with a minimum cumulative GPA of 3.2 on a 4.0 scale (or equivalent).',
        evidenceSnippet: 'Must demonstrate a strong academic record with a minimum cumulative GPA of 3.2 on a 4.0 scale (or equivalent).',
        explanation: 'Deterministic check: Student GPA (3.82) is strictly greater than the minimum requirement (3.20) by +0.62 points.',
        reasoning: 'Deterministic check: Student GPA (3.82) is strictly greater than the minimum requirement (3.20) by +0.62 points.',
        isDeterministic: true
      },
      {
        id: 'crit_enrollment',
        requirementCategory: 'degree_level',
        requirement: 'Undergraduate Program Enrollment',
        requirementLabel: 'Undergraduate Program Enrollment',
        requirementDetail: 'Full-time undergraduate at accredited US/Canadian institution',
        studentInformation: 'Bachelor of Science, 3rd Year (Junior) at University of Washington, Seattle',
        studentValue: 'Bachelor of Science, 3rd Year (Junior) at University of Washington, Seattle',
        status: 'MET',
        evidence: 'Must be currently enrolled as a full-time undergraduate student at an accredited university or college in the United States or Canada.',
        evidenceSnippet: 'Must be currently enrolled as a full-time undergraduate student at an accredited university or college in the United States or Canada.',
        explanation: 'Student is currently an active full-time junior in an accredited US public research institution.',
        reasoning: 'Student is currently an active full-time junior in an accredited US public research institution.',
        isDeterministic: true
      },
      {
        id: 'crit_field',
        requirementCategory: 'field_of_study',
        requirement: 'Approved Academic Major',
        requirementLabel: 'Approved Academic Major',
        requirementDetail: 'Computer Science, Computer Engineering, or closely related technical field',
        studentInformation: 'Computer Science & Artificial Intelligence',
        studentValue: 'Computer Science & Artificial Intelligence',
        status: 'MET',
        evidence: 'Must be pursuing a degree in Computer Science, Computer Engineering, Software Engineering, or a closely related technical field.',
        evidenceSnippet: 'Must be pursuing a degree in Computer Science, Computer Engineering, Software Engineering, or a closely related technical field.',
        explanation: 'Exact field match with "Computer Science" core discipline.',
        reasoning: 'Exact field match with "Computer Science" core discipline.',
        isDeterministic: true
      },
      {
        id: 'crit_country',
        requirementCategory: 'nationality',
        requirement: 'Institution Location in US/Canada',
        requirementLabel: 'Institution Location',
        requirementDetail: 'Accredited college in the United States or Canada',
        studentInformation: 'United States (University of Washington, Seattle)',
        studentValue: 'United States (University of Washington, Seattle)',
        status: 'MET',
        evidence: 'accredited university or college in the United States or Canada for the current academic year.',
        evidenceSnippet: 'accredited university or college in the United States or Canada for the current academic year.',
        explanation: 'Institution is based in Seattle, WA, United States.',
        reasoning: 'Institution is based in Seattle, WA, United States.',
        isDeterministic: true
      },
      {
        id: 'crit_graduation',
        requirementCategory: 'year_semester',
        requirement: 'Continuing Bachelor Enrollment',
        requirementLabel: 'Continuing Bachelor Enrollment',
        requirementDetail: 'Enrolled in Bachelor’s program for upcoming academic year',
        studentInformation: 'Expected Graduation: 2027 (Currently Junior / 3rd Year)',
        studentValue: 'Expected Graduation: 2027 (Currently Junior / 3rd Year)',
        status: 'MET',
        evidence: 'Must intend to be enrolled in or accepted as a full-time student in a Bachelor’s program at an accredited university in the United States or Canada for the upcoming academic year.',
        evidenceSnippet: 'Must intend to be enrolled in or accepted as a full-time student in a Bachelor’s program at an accredited university in the United States or Canada for the upcoming academic year.',
        explanation: 'Student expected graduation is 2027; they will be an enrolled senior during the upcoming 2026–2027 award year.',
        reasoning: 'Student expected graduation is 2027; they will be an enrolled senior during the upcoming 2026–2027 award year.',
        isDeterministic: true
      },
      {
        id: 'crit_diversity',
        requirementCategory: 'other',
        requirement: 'Diversity & Community Leadership',
        requirementLabel: 'Diversity & Community Leadership',
        requirementDetail: 'Demonstrated passion for improving representation in technology',
        studentInformation: 'Vice President & Workshop Lead for ACM-W; mentored 12 underrepresented freshmen students',
        studentValue: 'Vice President & Workshop Lead for ACM-W; mentored 12 underrepresented freshmen students',
        status: 'MET',
        evidence: 'Must exemplify leadership and demonstrate a passion for improving representation of historically underrepresented groups in computer science and technology.',
        evidenceSnippet: 'Must exemplify leadership and demonstrate a passion for improving representation of historically underrepresented groups in computer science and technology.',
        explanation: 'Active leadership role as Vice President of ACM-W organizing 8 technical bootcamps directly matches Google’s core diversity and inclusion pillar.',
        reasoning: 'Active leadership role as Vice President of ACM-W organizing 8 technical bootcamps directly matches Google’s core diversity and inclusion pillar.',
        isDeterministic: false
      }
    ]
  },
  match: {
    compatibilityTier: 'Strong Alignment',
    compatibilitySummary: 'Elena exhibits an exceptionally strong profile for the Generation Google Scholarship. Her 3.82 GPA surpasses the threshold, her backend software engineering and research experience demonstrate technical competence, and her sustained leadership as ACM-W Vice President directly aligns with Google’s diversity mission.',
    strongMatches: [
      'Proven leadership in ACM-W organizing technical bootcamps and mentoring 12 underrepresented students',
      'High-impact software engineering internship experience at Kite FinTech Labs (Go, PostgreSQL, microservices)',
      'Undergraduate research experience in edge AI efficiency with Prof. S. Vance (paper submitted to CVPR workshop)',
      'Strong academic performance (3.82 GPA, 5 semesters on Dean’s List Honors)'
    ],
    relevantExperience: [
      'Kite FinTech Labs (Backend SWE Intern) — Production systems, microservices, latency optimization',
      'Urban Green Mobility Initiative (Data Science Intern) — Time-series forecasting and AWS deployment',
      'UW CSE 332 Teaching Assistant — Peer mentoring and instructional leadership'
    ],
    relevantSkills: [
      'Python, Go, C++, SQL, PyTorch, Distributed Systems',
      'Technical communication and workshop facilitation'
    ],
    areasToStrengthen: [
      'Translate technical achievements into accessible non-technical storytelling in the 400-word essay answers',
      'Ensure the recommendation letter writer specifically addresses both technical competence AND character/advocacy'
    ],
    growthAreas: [
      'Quantify the measurable community impact of the ACM-W mentorship initiative in the essay (e.g. retention rate, internship placements)'
    ],
    pillars: [
      {
        category: 'Education',
        scoreLevel: 'High',
        title: 'Rigorous Academic Foundation',
        description: 'Consistent high marks in foundational computing coursework with Dean’s Honor List recognition.',
        studentEvidence: '3.82 GPA, CSE Junior, 5-term Dean’s Honor List at UW Seattle',
        opportunityExpectation: 'Minimum 3.20 GPA, strong academic standing in CS'
      },
      {
        category: 'Leadership',
        scoreLevel: 'High',
        title: 'Community Empowerment & Inclusion',
        description: 'Direct, demonstrable track record of lowering barriers for underrepresented peers in computing.',
        studentEvidence: 'ACM-W Vice President, designed 8 workshops, 12 mentees guided',
        opportunityExpectation: 'Exemplify leadership and passion for expanding diversity in CS'
      },
      {
        category: 'Skills',
        scoreLevel: 'High',
        title: 'Applied Engineering & Systems',
        description: 'Versatile engineering portfolio spanning distributed backend, edge machine learning, and full-stack assistive tools.',
        studentEvidence: 'NeuralScribe (1,200 users), Go backend internship, ROS robotics sim',
        opportunityExpectation: 'High technical aptitude and potential for computing career impact'
      },
      {
        category: 'Research',
        scoreLevel: 'Moderate',
        title: 'Edge AI & Efficiency Research',
        description: 'Formal lab research with workshop submission, exceeding average undergraduate applicant profiles.',
        studentEvidence: 'Undergraduate researcher in Efficient Deep Learning Lab (Prof. Vance)',
        opportunityExpectation: 'Demonstrated passion for pushing technical boundaries'
      }
    ],
    transparentDisclaimer: 'This compatibility analysis reflects qualitative alignment between your submitted profile and the stated focus areas of this scholarship. It is an advisory evaluation tool, not an official prediction or guarantee of award by Google.'
  },
  plan: {
    missingDocuments: [
      'Official / Unofficial Academic Transcript PDF (must download current term grade report)',
      'Recommendation Letter (must be requested from Prof. Vance or Engineering Manager)',
      'Short Answer Essay 1 Draft (Inclusion Barrier & Action)',
      'Short Answer Essay 2 Draft (Long-term Technical Aspirations)'
    ],
    missingRequirements: [
      'Verify that cumulative GPA is updated on official transcript through most recent completed term',
      'Confirm referee email and availability before sending portal invite'
    ],
    skillsToHighlight: [
      'Mentorship & ACM-W community initiatives (primary focus of Essay 1)',
      'NeuralScribe accessibility impact (1,200 student users) as tangible evidence of technology for social good',
      'Proficiency in distributed systems and edge AI optimization'
    ],
    projectsToEmphasize: [
      'NeuralScribe — highlight accessibility focus and real student adoption',
      'Kite FinTech Backend Internship — highlight ownership and engineering rigor'
    ],
    recommendedPreparationSequence: [
      'Step 1 (Immediate): Request recommendation letter from Prof. S. Vance with your updated CV and scholarship bullet points attached',
      'Step 2 (Week 1): Order official transcript PDF from UW Registrar and verify GPA shows 3.82',
      'Step 3 (Week 2): Draft Essay 1 (ACM-W leadership) and Essay 2 (career vision in accessible systems)',
      'Step 4 (Week 3): Conduct 2 rounds of peer review with writing center or senior peers',
      'Step 5 (Final Week): Review all PDF formatting, confirm letter upload, and submit 48 hours ahead of December 15 deadline'
    ],
    estimatedTotalHours: 18,
    submissionReadinessScore: 78,
    tasks: [
      {
        id: 'task_rec_letter',
        title: 'Request Letter of Recommendation from Prof. Vance',
        category: 'Document Prep',
        priority: 'High',
        estimatedHours: 2,
        timelinePhase: 'Immediate (Week 1)',
        description: 'Send formal email request with a brief 1-page summary of your lab contributions, CV, and Google Scholarship criteria. Allow the recommender at least 3-4 weeks before the December 15 deadline.',
        targetDeadline: 'November 10, 2026',
        completed: false
      },
      {
        id: 'task_transcript',
        title: 'Export Official Academic Transcript PDF',
        category: 'Document Prep',
        priority: 'High',
        estimatedHours: 1,
        timelinePhase: 'Immediate (Week 1)',
        description: 'Download the latest transcript from the university registrar portal. Ensure your name, University of Washington, current major, and 3.82 GPA are clearly legible.',
        targetDeadline: 'November 15, 2026',
        completed: false
      },
      {
        id: 'task_essay_1',
        title: 'Draft Essay 1: Diversity, Equity & Inclusion Leadership',
        category: 'Writing & Essays',
        priority: 'High',
        estimatedHours: 5,
        timelinePhase: 'Phase 2: Drafting & Assembly',
        description: 'Write 400 words detailing your specific initiative with ACM-W. Focus on the STAR method (Situation, Task, Action, Result) and concrete student outcomes.',
        targetDeadline: 'November 22, 2026',
        completed: false
      },
      {
        id: 'task_essay_2',
        title: 'Draft Essay 2: Long-Term Computing Career Vision',
        category: 'Writing & Essays',
        priority: 'High',
        estimatedHours: 4,
        timelinePhase: 'Phase 2: Drafting & Assembly',
        description: 'Articulate how your work in efficient AI and accessible tools like NeuralScribe motivates your vision for democratic, low-latency computing.',
        targetDeadline: 'November 26, 2026',
        completed: false
      },
      {
        id: 'task_cv_tailor',
        title: 'Tailor 1-Page Technical Resume for Scholarship Reviewers',
        category: 'Skill Showcase',
        priority: 'Medium',
        estimatedHours: 3,
        timelinePhase: 'Phase 2: Drafting & Assembly',
        description: 'Elevate the ACM-W leadership section to the top half of your resume and quantify the NeuralScribe user metrics (1,200+ students).',
        targetDeadline: 'December 1, 2026',
        completed: false
      },
      {
        id: 'task_peer_review',
        title: 'Peer Review & Proofreading Exchange',
        category: 'Review & Submission',
        priority: 'Medium',
        estimatedHours: 2,
        timelinePhase: 'Phase 3: Feedback & Polish',
        description: 'Exchange essays with a trusted mentor or writing tutor to audit word counts (strict 400-word limit) and tone.',
        targetDeadline: 'December 8, 2026',
        completed: false
      },
      {
        id: 'task_final_submit',
        title: 'Final Portal Verification & Early Submission',
        category: 'Review & Submission',
        priority: 'High',
        estimatedHours: 1,
        timelinePhase: 'Phase 4: Submission',
        description: 'Verify letter submission status on the portal, double check PDF file rendering, and click submit at least 48 hours prior to deadline.',
        targetDeadline: 'December 13, 2026',
        completed: false
      }
    ]
  },
  verification: {
    auditStatus: 'Verified Compliant',
    confidenceScore: 96,
    detectedWarnings: [
      {
        type: 'Strict Policy Notice',
        severity: 'Caution',
        message: 'Google enforces a zero-tolerance policy for late or incomplete submissions. Letters of recommendation must be received before the deadline.',
        affectedArea: 'Required Documents & Recommender Workflow',
        recommendation: 'Send recommendation reminder at least 10 days before the December 15 cutoff.'
      },
      {
        type: 'Ambiguous Term',
        severity: 'Advisory',
        message: 'Word count limit for essays is strictly capped at 400 words each. Submission portal may truncate text that exceeds the limit.',
        affectedArea: 'Short Answer Essays',
        recommendation: 'Target 370–390 words per essay to allow margin for web form character counter variations.'
      }
    ],
    provenanceMap: [
      {
        claim: 'Minimum GPA required is 3.2 on a 4.0 scale',
        sourceType: 'Source Opportunity',
        referenceSnippet: 'Must demonstrate a strong academic record with a minimum cumulative GPA of 3.2 on a 4.0 scale (or equivalent).',
        verified: true
      },
      {
        claim: 'Student cumulative GPA is 3.82',
        sourceType: 'Student Profile',
        referenceSnippet: 'Elena Rostova, GPA 3.82 / 4.0, University of Washington',
        verified: true
      },
      {
        claim: 'Student GPA exceeds requirement deterministically by +0.62',
        sourceType: 'AI Synthesis',
        referenceSnippet: 'Deterministic arithmetic comparison: 3.82 >= 3.20 is TRUE.',
        verified: true
      },
      {
        claim: 'Eligible disciplines include Computer Science and related engineering',
        sourceType: 'Source Opportunity',
        referenceSnippet: 'Must be pursuing a degree in Computer Science, Computer Engineering, Software Engineering, or a closely related technical field.',
        verified: true
      },
      {
        claim: 'Scholarship award value is $10,000 USD for US students',
        sourceType: 'Source Opportunity',
        referenceSnippet: 'Award: $10,000 USD (for students studying in the United States) or $5,000 CAD',
        verified: true
      },
      {
        claim: 'Two short answer essays of max 400 words are required',
        sourceType: 'Source Opportunity',
        referenceSnippet: 'Two Short Answer Essay Responses (maximum 400 words each)',
        verified: true
      }
    ],
    hallucinationAuditSummary: 'All 6 extracted requirements and criteria correspond directly to verbatim snippets in the source text. Zero external requirements or unstated conditions were introduced. Deterministic calculations were verified in code.',
    finalStatement: 'This evaluation complies with ScholarPath AI verification standards: evidence is grounded in source documentation, student inputs are preserved accurately, and synthesis is marked as advisory analysis.'
  }
};
