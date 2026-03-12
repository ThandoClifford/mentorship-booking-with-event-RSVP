import { User } from '../models/User.js';
import { verifyToken } from '../utils/auth.js';
import { failure } from '../utils/response.js';

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return failure(res, 'Unauthenticated', null, 401);
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user || (user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
      return failure(res, 'Unauthenticated', null, 401);
    }

    if (user.role === 'mentor' && !user.mentor_verified_at && req.path !== '/auth/logout') {
      return failure(res, 'Your mentor account is pending verification by admin.', null, 403);
    }

    req.user = user;
    return next();
  } catch (_error) {
    return failure(res, 'Unauthenticated', null, 401);
  }
}
