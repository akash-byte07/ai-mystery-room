import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return true;
  }
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return false;
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  return true;
}

function chooseEvidence(items, type) {
  return items.filter(item => item.evidenceType === type && !item.fileUrl)
    .sort((a, b) => Number(/high|critical/i.test(b.importance)) - Number(/high|critical/i.test(a.importance)))[0];
}

function pcmToWav(pcm, sampleRate) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function audioScript(evidence) {
  const content = evidence.content;
  const text = evidence.transcript || (typeof content === 'string' ? content : content?.script || content?.transcript || content?.text) || evidence.description;
  return String(text).replace(/\s+/g, ' ').trim().slice(0, 1800);
}

async function generateImage(ai, evidence, caseTitle) {
  const prompt = `Create one realistic, fictional investigative evidence photograph for the mystery case "${caseTitle}". Depict this evidence faithfully: ${evidence.title}. ${evidence.description}. Documentary crime-board photography, natural lighting, no visible text, no labels, no watermark added by you, no graphic injury, no identifiable real people, no extra clues that contradict the description.`;
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
    contents: prompt,
    config: { responseModalities: ['IMAGE'] }
  });
  const part = response.candidates?.flatMap(candidate => candidate.content?.parts || []).find(item => item.inlineData?.data);
  if (!part) throw new Error('Image model returned no image data');
  const mimeType = part.inlineData.mimeType || 'image/png';
  const dataUri = `data:${mimeType};base64,${part.inlineData.data}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: 'ai-mystery-room/evidence', resource_type: 'image',
    public_id: `${evidence.evidenceId}-image`, unique_filename: true, overwrite: false
  });
  evidence.fileUrl = uploaded.secure_url;
  return true;
}

async function generateAudio(ai, evidence, caseTitle) {
  const script = audioScript(evidence);
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts',
    contents: `Synthesize a short fictional evidence recording for the mystery case "${caseTitle}". Speak only the transcript below, naturally and clearly. Do not add words, narration, or sound effects.\n\nTranscript: ${script}`,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.GEMINI_TTS_VOICE || 'Kore' } } }
    }
  });
  const part = response.candidates?.flatMap(candidate => candidate.content?.parts || []).find(item => item.inlineData?.data && item.inlineData.mimeType?.startsWith('audio/'));
  if (!part) throw new Error('Speech model returned no audio data');
  const mimeType = part.inlineData.mimeType || 'audio/L16;codec=pcm;rate=24000';
  let audio = Buffer.from(part.inlineData.data, 'base64');
  let uploadFormat = mimeType.includes('wav') ? 'wav' : mimeType.includes('mpeg') || mimeType.includes('mp3') ? 'mp3' : 'wav';
  let sampleRate = Number(mimeType.match(/rate=(\d+)/i)?.[1] || 24000);
  if (uploadFormat === 'wav' && !mimeType.includes('wav')) {
    audio = pcmToWav(audio, sampleRate);
  } else if (uploadFormat === 'wav' && audio.length > 28) {
    sampleRate = audio.readUInt32LE(24);
  }
  const dataUri = `data:audio/${uploadFormat};base64,${audio.toString('base64')}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: 'ai-mystery-room/evidence', resource_type: 'video',
    public_id: `${evidence.evidenceId}-audio`, unique_filename: true, overwrite: false
  });
  evidence.fileUrl = uploaded.secure_url;
  evidence.transcript ||= script;
  if (uploadFormat === 'wav') {
    const dataLength = audio.length > 44 ? audio.readUInt32LE(40) : audio.length;
    evidence.durationSeconds = Math.max(1, Math.round(dataLength / (sampleRate * 2)));
  }
  return true;
}

async function generateVideo(ai, evidence, caseTitle) {
  const operation = await ai.models.generateVideos({
    model: process.env.GEMINI_VIDEO_MODEL || 'veo-3.1-generate-preview',
    prompt: `Create a short, fictional evidence video for the mystery case "${caseTitle}". Scene: ${evidence.title}. ${evidence.description}. Show only this described event, with a restrained documentary CCTV or investigator-recorded look. Keep it non-graphic, avoid readable text, avoid identifiable real people, and do not introduce additional clues.`,
    config: { numberOfVideos: 1, durationSeconds: 4, aspectRatio: '16:9', generateAudio: false }
  });
  let current = operation;
  const deadline = Date.now() + 5 * 60 * 1000;
  while (!current.done && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    current = await ai.operations.getVideosOperation({ operation: current });
  }
  if (!current.done) throw new Error('Video generation timed out');
  if (current.error) throw new Error('Video provider reported a generation error');
  const video = current.response?.generatedVideos?.[0]?.video;
  if (!video) throw new Error('Video model returned no video');

  let uploaded;
  if (video.videoBytes) {
    const mimeType = video.mimeType || 'video/mp4';
    uploaded = await cloudinary.uploader.upload(`data:${mimeType};base64,${video.videoBytes}`, {
      folder: 'ai-mystery-room/evidence', resource_type: 'video',
      public_id: `${evidence.evidenceId}-video`, unique_filename: true, overwrite: false
    });
  } else {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'mystery-video-'));
    const videoPath = path.join(tempDir, 'evidence.mp4');
    try {
      await ai.files.download({ file: video, downloadPath: videoPath });
      uploaded = await cloudinary.uploader.upload(videoPath, {
        folder: 'ai-mystery-room/evidence', resource_type: 'video',
        public_id: `${evidence.evidenceId}-video`, unique_filename: true, overwrite: false
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
  evidence.fileUrl = uploaded.secure_url;
  evidence.durationSeconds = Number(video.durationSeconds) || 4;
  return true;
}

export async function generateEvidenceMedia(publicCase, options = {}) {
  const selected = { image: options.image !== false, audio: options.audio !== false, video: options.video === true };
  if (!selected.image && !selected.audio && !selected.video) return { status: 'skipped', images: 0, audio: 0, videos: 0 };
  if (!process.env.GEMINI_API_KEY) return { status: 'not_configured', images: 0, audio: 0, videos: 0, failedByType: [], message: 'Add GEMINI_API_KEY to server/.env.' };
  if (!configureCloudinary()) return { status: 'not_configured', images: 0, audio: 0, videos: 0, failedByType: [], message: 'Add Cloudinary credentials to server/.env to store generated media.' };
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const imageEvidence = selected.image && chooseEvidence(publicCase.evidence, 'IMAGE');
  const audioEvidence = selected.audio && chooseEvidence(publicCase.evidence, 'AUDIO');
  const videoEvidence = selected.video && chooseEvidence(publicCase.evidence, 'VIDEO');
  const jobs = [
    imageEvidence && ['image', imageEvidence, () => generateImage(ai, imageEvidence, publicCase.caseTitle)],
    audioEvidence && ['audio', audioEvidence, () => generateAudio(ai, audioEvidence, publicCase.caseTitle)],
    videoEvidence && ['video', videoEvidence, () => generateVideo(ai, videoEvidence, publicCase.caseTitle)]
  ].filter(Boolean);
  const counts = { images: 0, audio: 0, videos: 0, failed: 0, failedByType: [] };
  await Promise.all(jobs.map(async ([type, item, run]) => {
    try {
      await run();
      counts[type === 'image' ? 'images' : type === 'audio' ? 'audio' : 'videos']++;
      await options.onAssetReady?.({ type, evidence: item });
    } catch (error) {
      counts.failed++; counts.failedByType.push(type);
      console.warn(`Evidence ${type} generation failed:`, error?.message || 'Unknown provider error');
    }
  }));
  const status = counts.failed ? (counts.images || counts.audio || counts.videos ? 'partial' : 'failed') : 'ready';
  return { status, ...counts, ...(counts.failed ? { message: 'Some evidence media could not be generated. The case is still available with its written evidence.' } : {}) };
}
