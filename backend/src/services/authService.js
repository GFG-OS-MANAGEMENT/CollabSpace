const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { AppError } = require('../lib/errors');
const { signToken } = require('../lib/jwt');

const SALT_ROUNDS = 10;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('collabspace-dummy-password', SALT_ROUNDS);

function toAuthUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    createdAt: user.createdAt,
  };
}

async function register({ name, email, password, college }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, college: college ?? null },
    });
    return { token: signToken(user), user: toAuthUser(user) };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
    }
    throw error;
  }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = user ? user.passwordHash : DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!user || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  return { token: signToken(user), user: toAuthUser(user) };
}

module.exports = { register, login };
