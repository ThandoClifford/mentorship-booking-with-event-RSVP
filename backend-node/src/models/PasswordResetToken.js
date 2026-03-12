import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    token: { type: String, required: true, trim: true, index: true },
    expires_at: { type: Date, required: true, index: true },
    used_at: { type: Date, default: null }
  },
  { timestamps: true }
);

passwordResetTokenSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
