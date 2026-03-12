import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin', 'super_admin'],
      default: 'student'
    },
    faculty: { type: String, default: null },
    profile_photo_path: { type: String, default: null },
    mentor_verified_at: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
