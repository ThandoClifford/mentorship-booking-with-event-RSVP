import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    published_on: { type: String, required: true }
  },
  { timestamps: true }
);

announcementSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Announcement = mongoose.model('Announcement', announcementSchema);
