import mongoose from 'mongoose';

const appointmentActionTokenSchema = new mongoose.Schema(
  {
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    action: { type: String, enum: ['accept', 'decline'], required: true },
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
    used_at: { type: Date, default: null }
  },
  { timestamps: true }
);

appointmentActionTokenSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.appointment_id = String(ret.appointment_id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const AppointmentActionToken = mongoose.model('AppointmentActionToken', appointmentActionTokenSchema);
