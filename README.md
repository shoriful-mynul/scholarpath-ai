# ScholarPath AI

> **Agentic Opportunity Intelligence for University Students**  
> *"Understand opportunities. Know where you stand. Apply with confidence."*

ScholarPath AI is an agentic AI-powered platform that helps university students evaluate scholarships, internships, fellowships, research grants, and educational competitions. Rather than relying on a generic single-prompt chatbot, ScholarPath AI deploys a coordinated **five-agent pipeline** with hard deterministic code gates and provenance auditing.

---

## 1. Problem Statement

Applying to scholarships and prestigious academic fellowships (such as Google Generation, CERN Summer Student, Rhodes, NSF REUs) presents major obstacles for students:
1. **Dense, Fragmented Eligibility Criteria**: Guidelines are buried in complex 10-page documents with subtle residency, degree cohort, or GPA restrictions.
2. **Hidden Ineligibility & Wasted Effort**: Students spend dozens of hours writing essays only to be disqualified by an overlooked hard prerequisite (e.g., graduating seniors excluded, strict citizenship limitations).
3. **Hallucination Risk in Generic LLM Chatbots**: Off-the-shelf chatbots frequently invent non-existent deadlines, fabricate GPA minimums, or hallucinate document checklists.
4. **Lack of Actionable Roadmaps**: Students struggle to translate eligibility into a concrete chronological preparation plan.

---

## 2. Solution

ScholarPath AI pairs **deterministic code logic** (for strict arithmetic comparisons, major matches, and citizenship rules) with **Gemini 3.8 Flash** (for contextual interpretation and nuanced document reasoning).

Every evaluated requirement retains an **exact evidence quote from the source text**. If reliable evidence is absent, the system flags it as `"Needs Verification"`.

---

## 3. Five-Agent Architecture

```
User Input (PDF Document or Pasted Text) + Student Profile
                          │
                          ▼
 ┌─────────────────────────────────────────────────────────┐
 │  Agent 1 — Opportunity Analyzer                         │
 │  • Extracts metadata & all eligibility requirements     │
 │  • Retains exact evidence snippets from source text     │
 └────────────────────────┬────────────────────────────────┘
                          │ Structured JSON
                          ▼
 ┌─────────────────────────────────────────────────────────┐
 │  Agent 2 — Eligibility Analyzer (Deterministic Engine)   │
 │  • Deterministic GPA comparison in TypeScript code      │
 │  • Citizenship, degree level, and graduation checks     │
 │  • Outputs: Met / Not Met / Needs Verification          │
 └────────────────────────┬────────────────────────────────┘
                          │ Structured JSON
                          ▼
 ┌─────────────────────────────────────────────────────────┐
 │  Agent 3 — Opportunity Match Agent                      │
 │  • Qualitative background & coursework alignment       │
 │  • Analyzes projects, research, leadership, & skills    │
 │  • Academic humility: not an acceptance guarantee      │
 └────────────────────────┬────────────────────────────────┘
                          │ Structured JSON
                          ▼
 ┌─────────────────────────────────────────────────────────┐
 │  Agent 4 — Application Planner                          │
 │  • Maps missing documents & key items to emphasize      │
 │  • Generates prioritized milestone checklist            │
 │  • Organizes tasks chronologically around deadline      │
 └────────────────────────┬────────────────────────────────┘
                          │ Structured JSON
                          ▼
 ┌─────────────────────────────────────────────────────────┐
 │  Agent 5 — Verification & Adversarial Audit Agent       │
 │  • Audits outputs against source text & student profile │
 │  • Detects contradictions, missing evidence, & policies │
 │  • 3-Way Provenance: Source vs Student vs AI Synthesis │
 └────────────────────────┬────────────────────────────────┘
                          │
                          ▼
              Comprehensive Evaluation Report
```

### Agent Roles:
1. **Agent 1 — Opportunity Analyzer**: Reads uploaded PDF or pasted opportunity text. Extracts opportunity name, sponsor, type, deadline, GPA minimums, eligible degrees/majors, required documents, and languages. Preserves exact verbatim snippets for every condition.
2. **Agent 2 — Eligibility Analyzer**: Compares the student's profile against extracted requirements. Executes hard deterministic math in application code (`student.gpa >= req.minimumGpa`). Classifies each requirement as `Met`, `Not Met`, or `Needs Verification`.
3. **Agent 3 — Opportunity Match Agent**: Examines student coursework, technical skills, projects, research, and leadership. Produces a transparent compatibility tier with concrete alignment reasoning.
4. **Agent 4 — Application Planner**: Synthesizes missing documents, identifies key projects to highlight, and produces a prioritized checklist with estimated hours and timeline phases.
5. **Agent 5 — Verification Agent**: Adversarially reviews previous agent outputs to catch hallucinations, missing citations, or contradictions. Produces a 3-way provenance map (Source Evidence vs. Student Input vs. AI Synthesis).

---

## 4. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, `server.ts`
- **AI Reasoning**: Google Gemini API (`@google/genai` TypeScript SDK, `gemini-3.8-flash` model with server-side proxy)
- **Document Ingestion**: `pdf-parse` for PDF text extraction and FileReader for raw documents
- **Tooling**: Vite 8, tsx, Tailwind CSS Vite plugin

---

## 5. End-to-End Workflow

1. **Profile Setup**: View or edit the candidate profile (GPA, major, university, skills, internships, research, projects, leadership). Switch between curated presets (Elena Rostova, Marcus Chen, Amina Al-Mansoor).
2. **Opportunity Ingestion**:
   - **Method A**: Upload an official PDF/TXT document.
   - **Method B**: Paste the text announcement directly.
   - **Curated Samples**: 1-click test with Google Generation Scholarship, CERN Summer Student Programme, Schwarzman Scholars, or NSF REU Fellowship.
3. **Multi-Agent Execution**: Watch the live animated stepper as Agents 1 through 5 run in sequence.
4. **Interactive Dashboard**:
   - **Opportunity Overview**: Deadline, organization, award, and scope.
   - **Structured Eligibility Table**: Filterable by status (`Met`, `Not Met`, `Needs Verification`) with source citations.
   - **Profile Compatibility Match**: Strong matches, relevant skills, and strategic framing areas.
   - **Action Plan**: Interactive checklist with checkboxes, estimated hours, and milestone timeline.
   - **Verification Audit**: Provenance map, confidence score, and policy advisories.
   - **Export**: Instant Markdown export, print-friendly report generation.

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### Installation
```bash
# Clone the repository and install dependencies
npm install

# Start the full-stack development server (Express + Vite)
npm run dev
```

The application runs on `http://localhost:3000`.

---

## 7. Environment Variables Required

Create a `.env` file in the project root:

```env
# GEMINI_API_KEY: Required for live Gemini 3.8 Flash multi-agent reasoning.
# In Google AI Studio, this is injected automatically from the Secrets panel.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Optional port (defaults to 3000)
PORT=3000
```

> **Note**: If `GEMINI_API_KEY` is not present, ScholarPath AI automatically activates its high-fidelity deterministic engine and pre-computed sample mode, allowing full demonstration of all UI features, eligibility math, and action planning without breaking.

---

## 8. Future Improvements

1. **Multi-Document Ingestion**: Uploading student transcripts and CV PDFs directly for automated student profile extraction.
2. **Live Calendar Sync**: Exporting the Application Action Plan directly to Google Calendar or iCal format with reminder notifications.
3. **Recommendation Letter Packet Generator**: Auto-generating a 1-page briefing packet for faculty recommenders summarizing the student's lab contributions and the opportunity criteria.
4. **Historical Cohort Analysis**: Comparing applicant qualifications against anonymized past recipient profiles.
