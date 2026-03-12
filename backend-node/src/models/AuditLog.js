import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true },
    entity_type: { type: String, default: null },
    entity_id: { type: String, default: null },
    metadata: { type: Object, default: {} },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    if (ret.actor_id) {
      ret.actor_id = String(ret.actor_id);
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
