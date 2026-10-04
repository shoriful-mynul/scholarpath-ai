import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { getOpenRouterClient } from './server/lib/openrouter';
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import { runScholarPathPipeline } from './server/agents/orchestrator';
import { SAMPLE_STUDENT_PROFILES, SAMPLE_OPPORTUNITIES, DEMO_PRECOMPUTED_ANALYSIS } from './server/sampleData';
import { StudentProfile } from './server/agents/types';

dotenv.config();
const openRouterClient = getOpenRouterClient();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 25mb limit for document uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Server-side OpenRouter Client
if (process.env.OPENROUTER_API_KEY) {
  console.log('[ScholarPath Server] OpenRouter AI initialized successfully.');
} else {
  console.warn('[ScholarPath Server] OPENROUTER_API_KEY is not set. Operating in deterministic and sample evaluation mode.');
}

// 1. Health & Config endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'ScholarPath AI',
    timestamp: new Date().toISOString(),
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
    mode: process.env.OPENROUTER_API_KEY ? 'openrouter_agentic' : 'deterministic_eval'
  });
});

// 2. Samples endpoint
app.get('/api/samples', (req, res) => {
  res.json({
    profiles: SAMPLE_STUDENT_PROFILES,
    opportunities: SAMPLE_OPPORTUNITIES,
    precomputedDemo: DEMO_PRECOMPUTED_ANALYSIS
  });
});

// 3. Document Extraction Endpoint (supports PDF & Text)
app.post('/api/extract-document', async (req, res) => {
  try {
    const { base64Data, mimeType, fileName } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'No document data provided. Please select a file.' });
    }

    const unsupportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.zip', '.tar', '.gz', '.exe', '.bin', '.dmg', '.mp4', '.mp3'];
    if (fileName && unsupportedExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
      return res.status(400).json({
        error: `Unsupported file format (${path.extname(fileName)}). Please upload an opportunity PDF (.pdf) or text document (.txt, .md).`
      });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty (0 bytes). Please upload a valid document.' });
    }

    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(413).json({ error: 'File size exceeds maximum 20MB limit. Please upload a smaller document.' });
    }

    if (mimeType === 'application/pdf' || (fileName && fileName.toLowerCase().endsWith('.pdf'))) {
      try {
        const parsed = await pdfParse(buffer);
        const extractedText = parsed.text ? parsed.text.trim() : '';
        if (!extractedText) {
          return res.status(422).json({
            error: 'Could not extract readable text from PDF. It may contain scanned images without OCR or be password-protected. Please paste the opportunity text directly.'
          });
        }
        return res.json({
          text: extractedText,
          pageCount: parsed.numpages,
          info: parsed.info
        });
      } catch (pdfErr: any) {
        console.error('PDF parsing error:', pdfErr);
        return res.status(422).json({
          error: 'Failed to process PDF document: ' + (pdfErr?.message || 'Invalid or corrupted PDF file. Please ensure it is a readable PDF or paste the text.')
        });
      }
    }

    // Default plain text / markdown / doc
    const text = buffer.toString('utf-8');
    if (!text || !text.trim()) {
      return res.status(422).json({ error: 'Document contains no text.' });
    }
    return res.json({ text: text.trim() });
  } catch (err: any) {
    console.error('Document extraction error:', err);
    return res.status(500).json({ error: 'Document extraction error: ' + (err?.message || 'Unknown error') });
  }
});

// 4. Main Multi-Agent Pipeline Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { rawOpportunityText, studentProfile, allowDeterministicFallback } = req.body;

    if (!rawOpportunityText || typeof rawOpportunityText !== 'string' || !rawOpportunityText.trim()) {
      return res.status(400).json({ error: 'Opportunity text is required.' });
    }

    if (!studentProfile || typeof studentProfile !== 'object') {
      return res.status(400).json({ error: 'Student profile object is required.' });
    }

    const student: StudentProfile = {
      name: studentProfile.name || 'Student Candidate',
      country: studentProfile.country || '',
      nationality: studentProfile.nationality || '',
      age: typeof studentProfile.age === 'number' ? studentProfile.age : (studentProfile.age ? parseInt(studentProfile.age, 10) : null),
      currentDegree: studentProfile.currentDegree || '',
      fieldOfStudy: studentProfile.fieldOfStudy || '',
      university: studentProfile.university || '',
      currentYearOrSemester: studentProfile.currentYearOrSemester || '',
      gpa: typeof studentProfile.gpa === 'number' ? studentProfile.gpa : (studentProfile.gpa ? parseFloat(studentProfile.gpa) : 0),
      maxGpa: typeof studentProfile.maxGpa === 'number' ? studentProfile.maxGpa : 4.0,
      expectedGraduationYear: studentProfile.expectedGraduationYear ? parseInt(String(studentProfile.expectedGraduationYear), 10) : 0,
      technicalSkills: Array.isArray(studentProfile.technicalSkills) ? studentProfile.technicalSkills : [],
      programmingLanguages: Array.isArray(studentProfile.programmingLanguages) ? studentProfile.programmingLanguages : [],
      aiMlSkills: Array.isArray(studentProfile.aiMlSkills) ? studentProfile.aiMlSkills : [],
      otherSkills: Array.isArray(studentProfile.otherSkills) ? studentProfile.otherSkills : [],
      internships: Array.isArray(studentProfile.internships) ? studentProfile.internships : [],
      researchExperience: Array.isArray(studentProfile.researchExperience) ? studentProfile.researchExperience : [],
      projects: Array.isArray(studentProfile.projects) ? studentProfile.projects : [],
      leadership: Array.isArray(studentProfile.leadership) ? studentProfile.leadership : [],
      certificationsAwards: Array.isArray(studentProfile.certificationsAwards) ? studentProfile.certificationsAwards : []
    };

    const analysisResult = await runScholarPathPipeline(
      rawOpportunityText,
      student,
      openRouterClient,
      { allowFallback: Boolean(allowDeterministicFallback) }
    );
    return res.json(analysisResult);
  } catch (err: any) {
    console.error('[API /analyze error]:', err);
    const rawMsg = err?.message || 'Unexpected server error';
    const userFacingMsg = rawMsg.startsWith('Analysis could not be completed')
      ? rawMsg
      : `Analysis could not be completed: ${rawMsg}`;
    return res.status(502).json({
      error: userFacingMsg,
      aiAnalysisFailed: true
    });
  }
});

// Setup Frontend serving (Vite dev middleware vs static production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[ScholarPath Server] Vite dev middleware attached.');
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[ScholarPath Server] Serving static build from /dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScholarPath Server] ScholarPath AI running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[ScholarPath Server] Failed to start server:', err);
  process.exit(1);
});
