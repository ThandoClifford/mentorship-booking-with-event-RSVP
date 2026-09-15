import mongoose from 'mongoose';

const eventRsvpSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CentreEvent', required: true },
    full_name: { type: String, required: true, trim: true },
    student_number: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: null, trim: true },
    faculty_programme: { type: String, default: null, trim: true }
  },
  { timestamps: true }
);

eventRsvpSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.event_id = String(ret.event_id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const EventRSVP = mongoose.model('EventRSVP', eventRsvpSchema);
