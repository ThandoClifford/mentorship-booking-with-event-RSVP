import mongoose from 'mongoose';

const mentorAvailabilitySchema = new mongoose.Schema(
  {
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day_of_week: { type: String, enum: ['tuesday', 'thursday'], required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

mentorAvailabilitySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.mentor_id = String(ret.mentor_id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const MentorAvailability = mongoose.model('MentorAvailability', mentorAvailabilitySchema);
