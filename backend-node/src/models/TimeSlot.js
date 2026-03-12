import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
  {
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    status: { type: String, enum: ['available', 'booked'], default: 'available' }
  },
  { timestamps: true }
);

timeSlotSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.mentor_id = String(ret.mentor_id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
