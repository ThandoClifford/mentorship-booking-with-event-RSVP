import mongoose from 'mongoose';

const sessionNoteSchema = new mongoose.Schema(
  {
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, required: true }
  },
  { timestamps: true }
);

sessionNoteSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.appointment_id = String(ret.appointment_id);
    ret.mentor_id = String(ret.mentor_id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const SessionNote = mongoose.model('SessionNote', sessionNoteSchema);
