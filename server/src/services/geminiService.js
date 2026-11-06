import { GoogleGenAI } from '@google/genai';
import { generatedCaseJsonSchema, generatedCaseSchema } from '../validators/schemas.js';

const evidenceRanges = { Easy: '5-7', Medium: '8-11', Hard: '12-16' };

function buildPrompt(config, correction = '') {
  const scenario = config.scenario
    ? `Use this scenario as the basis: ${config.scenario}`
    : 'Invent an original fictional case.';
  const setting = config.setting ? `Location/setting: ${config.setting}.` : '';
  return `Create a ${config.difficulty} ${config.category} mystery with exactly ${config.suspectCount} suspects and ${evidenceRanges[config.difficulty]} evidence items. ${scenario} ${setting}

Write compact JSON matching the supplied schema. Keep each description to 1-3 sentences, suspect backgrounds and alibis to 1-2 sentences, and evidence content concise. Include at least one image, one audio item with an exact short transcript, and one video item with a clear scene description. Use realistic, non-graphic fictional clues. Include a coherent timeline, one culprit, at least two supporting evidence IDs, and explain every red herring.

Each image/audio/video item must name one or more related suspects, have clueRole SUPPORTING, CONTRADICTING, or RED_HERRING, and appear in supportingEvidenceIds or redHerringEvidenceIds. Never invent additional conclusions that are not supported by evidence. ${correction}`;
}

function providerError(error) {
  const status = Number(error?.status || error?.code);
  if (status === 400 || status === 404) {
    return Object.assign(new Error(`Gemini rejected the configured model or request (${status}). Check GEMINI_MODEL in server/.env.`), { status: 502, expose: true });
  }
  if (status === 401 || status === 403) {
    return Object.assign(new Error('Gemini rejected the API key. Check GEMINI_API_KEY in server/.env.'), { status: 503, expose: true });
  }
  if (status === 429) {
    return Object.assign(new Error('Gemini is rate-limiting requests. Wait briefly, then try again.'), { status: 429, expose: true });
  }
  return Object.assign(new Error('Gemini did not respond in time or is temporarily unavailable. Please try again.'), { status: 503, expose: true });
}

export async function generateCase(config) {
  if (!process.env.GEMINI_API_KEY) throw Object.assign(new Error('AI generation is not configured. Add GEMINI_API_KEY to server/.env.'), { status: 503, expose: true });

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    timeout: Number(process.env.GEMINI_TIMEOUT_MS) || 45000,
    maxRetries: 0
  });
  let lastValidationError;
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const thinkingConfig = model.includes('2.5')
    ? { thinkingBudget: 0 }
    : { thinkingLevel: process.env.GEMINI_THINKING_LEVEL || (model.includes('3.8') || model.includes('3.7') ? 'low' : 'minimal') };

  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: buildPrompt(config, attempt ? 'Correct any missing fields or inconsistent evidence links from the previous response, and return only corrected JSON.' : ''),
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: generatedCaseJsonSchema,
          maxOutputTokens: 8192,
          temperature: 0.6,
          thinkingConfig
        }
      });
    } catch (error) {
      console.error('Gemini request failed:', { status: error?.status || error?.code, message: error?.message });
      throw providerError(error);
    }

    try {
      if (!response.text) throw new Error('Gemini returned an empty response.');
      return generatedCaseSchema.parse(JSON.parse(response.text));
    } catch (error) {
      lastValidationError = error;
      console.warn(`Gemini case validation failed (attempt ${attempt + 1}):`, error?.issues?.slice(0, 5) || error?.message);
    }
  }

  throw Object.assign(new Error('Gemini returned an incomplete case twice. Please try again, or check the server log for validation details.'), { status: 502, expose: true, cause: lastValidationError });
}
