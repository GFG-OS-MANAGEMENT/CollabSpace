const prisma = require('../lib/prisma');
const { verifyToken } = require('../lib/jwt');
const { AppError } = require('../lib/errors');

const authUserSelect = {
  id: true,
  name: true,
  email: true,
  college: true,
  createdAt: true,
};

async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: authUserSelect,
    });

    if (!user) {
      throw new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireAuth, authUserSelect };
