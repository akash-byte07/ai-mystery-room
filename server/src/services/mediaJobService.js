import MediaJob from '../models/MediaJob.js';
import Investigation from '../models/Investigation.js';
import { generateEvidenceMedia } from './mediaService.js';

const selectedStatus = (enabled, ready) => !enabled ? 'skipped' : ready ? 'ready' : 'pending';

export async function processMediaJob(jobId) {
  const job = await MediaJob.findById(jobId);
  if (!job || ['completed', 'failed'].includes(job.status)) return;
  const investigation = await Investigation.findOne({ _id: job.investigationId, userId: job.userId });
  if (!investigation) { job.status = 'failed'; job.error = 'Investigation no longer exists.'; await job.save(); return; }

  job.status = 'processing'; job.attempts += 1; job.error = undefined; await job.save();
  investigation.mediaGeneration.status = 'processing';
  for (const type of ['image', 'audio', 'video']) {
    investigation.mediaGeneration[type] = selectedStatus(job.options[type], investigation.evidence.some(e => e.evidenceType === type.toUpperCase() && e.fileUrl));
  }
  investigation.mediaGeneration.updatedAt = new Date(); await investigation.save();

  try {
    const outcome = await generateEvidenceMedia(investigation, {
      ...job.options,
      onAssetReady: async ({ type, evidence }) => {
        const path = `evidence.$[item]`;
        await Investigation.updateOne({ _id: investigation._id, userId: job.userId }, { $set: {
          [`${path}.fileUrl`]: evidence.fileUrl,
          [`${path}.transcript`]: evidence.transcript,
          [`${path}.durationSeconds`]: evidence.durationSeconds,
          [`mediaGeneration.${type}`]: 'ready',
          'mediaGeneration.updatedAt': new Date()
        } }, { arrayFilters: [{ 'item.evidenceId': evidence.evidenceId }] });
      }
    });
    const latest = await Investigation.findById(investigation._id);
    const hasFile = type => latest.evidence.some(e => e.evidenceType === type.toUpperCase() && e.fileUrl);
    for (const type of ['image', 'audio', 'video']) {
      latest.mediaGeneration[type] = !job.options[type] ? 'skipped' : hasFile(type) ? 'ready' : outcome.status === 'not_configured' ? 'not_configured' : 'failed';
    }
    latest.mediaGeneration.status = outcome.status;
    latest.mediaGeneration.message = outcome.message || '';
    latest.mediaGeneration.updatedAt = new Date(); await latest.save();
    job.status = 'completed'; job.completedAt = new Date(); await job.save();
  } catch (error) {
    const latest = await Investigation.findById(investigation._id);
    if (latest) {
      latest.mediaGeneration.status = 'failed'; latest.mediaGeneration.message = 'Media generation stopped. Written evidence remains available.';
      latest.mediaGeneration.updatedAt = new Date(); await latest.save();
    }
    job.status = 'failed'; job.error = error?.message || 'Media generation failed'; await job.save();
  }
}

export async function recoverPendingMediaJobs() {
  const jobs = await MediaJob.find({ status: { $in: ['queued', 'processing'] } }).select('_id');
  for (const job of jobs) processMediaJob(job._id).catch(error => console.error('Media job recovery failed:', error?.message));
}
