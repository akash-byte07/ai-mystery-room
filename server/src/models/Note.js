import mongoose from 'mongoose';
export default mongoose.model('Note', new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation' }, noteContent: { type: String, required: true, maxlength: 3000 } }, { timestamps: true }));
