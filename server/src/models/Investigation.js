import mongoose from 'mongoose';
const suspect = new mongoose.Schema({ suspectId: String, name: String, age: Number, occupation: String, background: String, relationship: String, motive: String, alibi: String, suspiciousDetails: String, avatarUrl: String }, { _id: false });
const evidence = new mongoose.Schema({ evidenceId: String, title: String, description: String, evidenceType: { type: String, enum: ['MESSAGE','IMAGE','AUDIO','VIDEO','WITNESS_STATEMENT','PHYSICAL','DIGITAL'] }, category: String, content: mongoose.Schema.Types.Mixed, fileUrl: String, transcript: String, durationSeconds: Number, timestamp: String, relatedSuspectIds: [String], clueRole: { type: String, enum: ['SUPPORTING','CONTRADICTING','RED_HERRING','CONTEXT'], default: 'CONTEXT' }, importance: String }, { _id: false });
const investigationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, caseTitle: String, caseCategory: String, difficulty: String,
  scenario: String, description: String, detailedStory: String, incidentLocation: String, incidentDate: String, objectives: [String],
  suspects: [suspect], evidence: [evidence], timeline: [{ time: String, event: String }],
  mediaGeneration: { status: { type: String, default: 'not_requested' }, image: { type: String, default: 'not_requested' }, audio: { type: String, default: 'not_requested' }, video: { type: String, default: 'not_requested' }, updatedAt: Date, message: String },
  status: { type: String, enum: ['active','completed'], default: 'active' }, completedAt: Date
}, { timestamps: true });
export default mongoose.model('Investigation', investigationSchema);
