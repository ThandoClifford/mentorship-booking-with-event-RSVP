import { AuditLog } from '../models/AuditLog.js';

export async function writeAudit(req, actorId, action, entityType = null, entityId = null, metadata = {}) {
  try {
    await AuditLog.create({
      actor_id: actorId || null,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      metadata,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null
    });
  } catch (_error) {
    // Best effort only.
  }
}
