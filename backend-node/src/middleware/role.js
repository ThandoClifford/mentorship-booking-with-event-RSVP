import { failure } from '../utils/response.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return failure(res, 'Unauthenticated', null, 401);
    }

    if (!roles.includes(req.user.role)) {
      return failure(res, 'Forbidden', null, 403);
    }

    return next();
  };
}
