import mongoose from 'mongoose';

const evidenceBoardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation', required: true },
  bookmarkedEvidenceIds: { type: [String], default: [] },
  links: { type: [{ evidenceId: String, suspectId: String }], default: [] }
}, { timestamps: true });

evidenceBoardSchema.index({ userId: 1, investigationId: 1 }, { unique: true });
export default mongoose.model('EvidenceBoard', evidenceBoardSchema);
