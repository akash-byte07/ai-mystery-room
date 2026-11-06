import mongoose from 'mongoose';
export default mongoose.model('Attempt', new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation', unique: true }, selectedSuspectId: String, isCorrect: Boolean, score: Number }, { timestamps: true }));
