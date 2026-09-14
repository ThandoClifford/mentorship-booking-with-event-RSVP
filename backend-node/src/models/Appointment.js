import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    time_slot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending'
    },
    student_contact_details: { type: String, default: null },
    appointment_subject: { type: String, default: null },
    cancelled_reason: { type: String, default: null },
    confirmed_sent_at: { type: Date, default: null },
    cancelled_sent_at: { type: Date, default: null },
    reminder_sent_at: { type: Date, default: null },
    public_student: {
      full_name: { type: String, default: null },
      student_number: { type: String, default: null },
      email: { type: String, default: null },
      faculty: { type: String, default: null },
      phone: { type: String, default: null }
    }
  },
  { timestamps: true }
);

appointmentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.student_id = ret.student_id ? String(ret.student_id) : null;
    ret.mentor_id = String(ret.mentor_id);
    ret.time_slot_id = String(ret.time_slot_id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
