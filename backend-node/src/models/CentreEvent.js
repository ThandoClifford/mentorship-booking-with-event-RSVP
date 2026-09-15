import mongoose from 'mongoose';

const centreEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    event_date: { type: String, required: true },
    event_time: { type: String, required: true },
    end_time: { type: String, default: null },
    venue: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    capacity: { type: Number, default: null },
    registration_deadline: { type: String, default: null },
    image: { type: String, default: null }
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
