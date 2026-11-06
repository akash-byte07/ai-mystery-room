import mongoose from 'mongoose';

const mediaJobSchema = new mongoose.Schema({
  investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation', unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  options: { image: Boolean, audio: Boolean, video: Boolean },
  status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' },
  attempts: { type: Number, default: 0 },
  error: String,
  completedAt: Date
}, { timestamps: true });

export default mongoose.model('MediaJob', mediaJobSchema);
