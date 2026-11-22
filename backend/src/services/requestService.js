const prisma = require('../lib/prisma');
const { AppError } = require('../lib/errors');
const { assertOwner, ownerSelect } = require('./projectService');

const requesterSelect = { id: true, name: true, college: true };

async function create(projectId, userId, { message }) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true, status: true },
  });

  if (!project) {
    throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
  }
  if (project.ownerId === userId) {
    throw new AppError(400, 'You cannot request to join your own project', 'OWN_PROJECT');
  }
  if (project.status !== 'OPEN') {
    throw new AppError(409, 'This project is not accepting join requests', 'PROJECT_CLOSED');
  }

  try {
    return await prisma.joinRequest.create({
      data: { projectId, userId, message: message ?? null },
      include: { user: { select: requesterSelect } },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(409, 'You already requested to join this project', 'ALREADY_REQUESTED');
    }
    throw error;
  }
}

async function listForProject(projectId, userId) {
  await assertOwner(projectId, userId);

  return prisma.joinRequest.findMany({
    where: { projectId },
    include: { user: { select: requesterSelect } },
    orderBy: { createdAt: 'desc' },
  });
}

async function decide(projectId, requestId, userId, status) {
  await assertOwner(projectId, userId);

  const joinRequest = await prisma.joinRequest.findUnique({ where: { id: requestId } });

  if (!joinRequest || joinRequest.projectId !== projectId) {
    throw new AppError(404, 'Join request not found', 'REQUEST_NOT_FOUND');
  }
  if (joinRequest.status !== 'PENDING') {
    throw new AppError(409, 'This join request has already been decided', 'REQUEST_ALREADY_DECIDED');
  }

  return prisma.joinRequest.update({
    where: { id: requestId },
    data: { status },
    include: { user: { select: requesterSelect } },
  });
}

async function listMine(userId) {
  return prisma.joinRequest.findMany({
    where: { userId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          kind: true,
          owner: { select: ownerSelect },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { create, listForProject, decide, listMine };
