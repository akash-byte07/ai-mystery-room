import mongoose from 'mongoose';
const solutionSchema = new mongoose.Schema({ investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation', unique: true }, culpritSuspectId: String, motive: String, method: String, completeExplanation: String, supportingEvidenceIds: [String], redHerringEvidenceIds: [String], redHerringExplanations: [{ suspectId: String, explanation: String }], solutionNarrative: String }, { timestamps: true });
export default mongoose.model('Solution', solutionSchema);
