# ScholarPath AI

> **AI-powered scholarship & opportunity intelligence platform for smarter, evidence-grounded application decisions.**

ScholarPath AI is an intelligent multi-agent platform designed to help students discover, evaluate, and prepare for scholarships, fellowships, internships, and other academic opportunities.

Instead of treating an opportunity as a simple search result, ScholarPath AI processes it through a **5-stage analysis pipeline** that separates opportunity understanding, eligibility checking, profile matching, application planning, and adversarial verification.

---

## 🚀 What ScholarPath AI Does

ScholarPath AI takes an opportunity and a student's profile and produces a structured assessment covering:

* 📋 Opportunity overview
* ✅ Eligibility analysis
* 🎯 Student–opportunity profile matching
* 📝 Application preparation plan
* 🔍 Adversarial verification and risk detection

The goal is not simply to tell a student **"apply"** or **"don't apply"**, but to explain **why** an opportunity matches or does not match their profile and what they should prepare next.

---

## 🧠 5-Agent Architecture

ScholarPath AI uses a sequential five-stage pipeline.

```text
                    ┌──────────────────────┐
                    │   Opportunity Input  │
                    └──────────┬───────────┘
                               │
                               ▼
              ┌─────────────────────────────┐
              │  1. Opportunity Analyzer    │
              │  Extracts key requirements, │
              │  funding, deadlines, scope  │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  2. Eligibility Analyzer    │
              │  Checks hard eligibility    │
              │  requirements independently │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  3. Profile Match Agent     │
              │  Compares verified student  │
              │  evidence with opportunity  │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  4. Application Planner     │
              │  Converts requirements into │
              │  actionable preparation     │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  5. Verification Agent      │
              │  Adversarially checks for   │
              │  unsupported claims, gaps,  │
              │  and inconsistencies        │
              └──────────────┬──────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Structured Report│
                    └──────────────────┘
```

### 1. Opportunity Analyzer

Extracts and structures the important information from an opportunity, including:

* Host organization
* Opportunity type
* Deadline
* Funding
* Location
* Study/program scope
* Eligibility requirements
* Required documents
* Other important conditions

---

### 2. Eligibility Analyzer

Evaluates **hard eligibility requirements** separately from application preparation.

Each requirement can be classified as:

* `MET`
* `NOT_MET`
* `NEEDS_VERIFICATION`

The analyzer is designed to distinguish between:

> **"The student is eligible."**

and

> **"The student may be eligible, but some information needs verification."**

For example, if an opportunity explicitly requires students to study at an institution in the United States or Canada, a clearly Pakistan-based student is treated as **NOT_MET** rather than incorrectly being marked as merely requiring verification.

---

### 3. Profile Match Agent

Compares the opportunity requirements against the student's available profile evidence.

It identifies:

* Strong matches
* Relevant experience
* Skills
* Potential gaps
* Areas requiring attention

The system emphasizes **grounded profile evidence** and avoids presenting unsupported personal claims as facts.

---

### 4. Application Planner

Transforms the opportunity requirements into a practical preparation plan.

It can identify:

* Required documents
* Documents that need preparation
* Application components
* Suggested preparation actions
* Profile highlights supported by available evidence

Importantly, application documents are treated as **application-readiness items**, rather than being incorrectly used as eligibility requirements.

---

### 5. Adversarial Verification Agent

The final stage acts as a verification layer.

It looks for:

* Unsupported claims
* Hallucinated profile information
* Incorrect requirements
* Inconsistencies between stages
* Potential eligibility interpretation errors
* Claims that require verification

This provides an additional safeguard before the final analysis is presented to the user.

---

# 🛡️ Grounded & Evidence-Aware Design

A major design principle of ScholarPath AI is:

> **Do not invent information that is not supported by the opportunity or student profile.**

The system therefore attempts to separate:

### Opportunity Evidence

Information explicitly associated with the opportunity, such as:

* Deadline
* GPA requirement
* Degree requirement
* Geographic restrictions
* Funding
* Required documents

### Profile Evidence

Information actually available from the student's profile, such as:

* University
* Degree
* GPA
* Academic background
* Skills
* Projects
* Experience
* Achievements

### Verification

If information cannot be established confidently, the system should prefer:

`NEEDS_VERIFICATION`

rather than inventing an answer.

---

# ⚙️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Modern responsive UI

### Backend

* Node.js
* TypeScript
* Express

### AI / Analysis Layer

* Multi-agent pipeline architecture
* Structured opportunity analysis
* Deterministic eligibility logic
* Profile evidence grounding
* Application planning
* Adversarial verification

### Deployment

* Render
* Production-ready Node.js server
* Static frontend served through the backend

---

# 🔄 Execution Pipeline

The complete analysis follows this flow:

```text
Opportunity
     │
     ▼
Opportunity Analysis
     │
     ▼
Eligibility Analysis
     │
     ▼
Profile Matching
     │
     ▼
Application Planning
     │
     ▼
Adversarial Verification
     │
     ▼
Final Analysis
```

The pipeline executes all five stages sequentially and combines their outputs into a single structured result.

---

# 🔐 Deterministic Fallback Mode

ScholarPath AI includes a deterministic/sample evaluation mode.

When an external AI API key is not configured, the application can still execute the core pipeline using deterministic logic and sample evaluation data.

The server explicitly reports this state:

```text
OPENROUTER_API_KEY is not set.
Operating in deterministic and sample evaluation mode.
```

This provides a reliable fallback for development, demonstrations, and environments where an external AI provider is unavailable.

> **Note:** Deterministic mode is intended as a fallback/evaluation mechanism. AI-powered functionality depends on the corresponding API configuration.

---

# 📊 Reliability Considerations

ScholarPath AI is designed with several safeguards against common problems in AI-powered opportunity analysis.

### Hard Eligibility vs. Preparation

Eligibility requirements are kept separate from application preparation.

For example:

```text
Eligibility:
"Must study at an accredited institution in the US/Canada"

Application Preparation:
"Submit current transcript"
```

A missing transcript should not automatically make a student ineligible.

---

### Geographic Requirements

Geographic restrictions are evaluated explicitly.

The system distinguishes between:

* Citizenship
* Current study location
* University location
* Opportunity location/scope

This helps avoid incorrectly treating nationality as equivalent to institutional eligibility.

---

### Profile Hallucination Prevention

Generated profile summaries are constrained using available profile evidence.

Unsupported claims such as invented:

* Leadership positions
* Awards
* GPA values
* University affiliations
* Research roles
* Technical experience

should not be presented as verified student facts.

---

### Final Verification

The fifth stage provides an additional adversarial review before the final result is returned.

---

# 🧪 Example Use Case

Suppose a scholarship requires:

```text
• Undergraduate student
• Computer Science / related degree
• Minimum GPA: 3.2/4.0
• Currently studying in the United States or Canada
```

A student studying Computer Science in Pakistan with a GPA above 3.2 may satisfy:

```text
Degree       → MET
GPA          → MET
Study level  → MET
US/Canada    → NOT_MET
```

Therefore, the system should identify the geographic requirement as a **hard blocker**, rather than incorrectly recommending the opportunity simply because the student's degree and GPA match.

---

# 📁 Project Structure

```text
scholarpath-ai/
│
├── client/                  # Frontend application
│
├── server/
│   ├── agents/
│   │   ├── opportunityAnalyzer.ts
│   │   ├── eligibilityAnalyzer.ts
│   │   ├── profileMatchAgent.ts
│   │   ├── applicationPlanner.ts
│   │   └── verificationAgent.ts
│   │
│   ├── lib/                 # Backend utilities / AI integration
│   │
│   └── server.ts            # Backend entry point
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# 🛠️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/shoriful-mynul/scholarpath-ai.git
cd scholarpath-ai
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Run development mode

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Start production server

```bash
npm start
```

---

# 🌐 Deployment

ScholarPath AI is deployed as a production web application using Render.

The deployment process builds the frontend and starts the Node.js backend:

```text
npm install --legacy-peer-deps
        ↓
npm run build
        ↓
npm start
```

The production server serves the compiled frontend and exposes the backend API.

---

# 📌 Current Project Status

**Status: 🟢 Live**

The production deployment has been successfully tested with the complete five-stage pipeline:

```text
✓ Opportunity Analyzer
✓ Eligibility Analyzer
✓ Profile Match Agent
✓ Application Planner
✓ Verification Agent
✓ Final structured analysis
```

The pipeline successfully completes end-to-end in deterministic fallback mode when no external AI API key is configured.

---

# ⚠️ Current Limitations

ScholarPath AI is an academic/project prototype and should not be treated as an authoritative admissions or scholarship decision system.

Important limitations include:

* Opportunity information depends on the quality and freshness of the provided source data.
* Some requirements may require manual verification from the official opportunity source.
* Deterministic fallback mode does not provide the full capabilities of an external generative AI model.
* AI-generated interpretations should be reviewed before submitting an actual application.
* The system assists with decision-making; it does not replace official eligibility rules.

> **Always verify critical requirements directly with the official scholarship, fellowship, university, or program website before applying.**

---

# 🎯 Project Objective

ScholarPath AI was built around a simple idea:

> **Students should spend less time figuring out whether an opportunity is worth applying to, and more time preparing a strong application.**

By combining structured extraction, deterministic eligibility logic, profile matching, application planning, and adversarial verification, ScholarPath AI aims to provide a more transparent and practical approach to scholarship and opportunity discovery.

---

# 👨‍💻 Author

**Shoriful Islam**

Computer Science Undergraduate
COMSATS University Islamabad

### Interests

* Artificial Intelligence & Machine Learning
* Agentic AI
* Applied Research
* Natural Language Processing
* Computer Vision
* Search & Ranking Systems
* AI Safety
* Robotics & Intelligent Systems

---

## ⭐ If You Find This Project Interesting
Feel free to explore the repository, experiment with the architecture, and build upon the idea of evidence-grounded multi-agent systems for educational opportunity discovery.

Feel free to explore the repository, experiment with the architecture, and build upon the idea of evidence-grounded multi-agent systems for educational opportunity discovery.
