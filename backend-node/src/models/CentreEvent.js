import mongoose from 'mongoose';

const centreEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    event_date: { type: String, required: true },
    event_time: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

centreEventSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const CentreEvent = mongoose.model('CentreEvent', centreEventSchema);
