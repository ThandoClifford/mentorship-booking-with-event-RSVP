import mongoose from 'mongoose';

const groupSessionSchema = new mongoose.Schema(
  {
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    event_date: { type: String, required: true },
    event_time: { type: String, required: true },
    venue: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

groupSessionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.mentor_id = String(ret.mentor_id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const GroupSession = mongoose.model('GroupSession', groupSessionSchema);
