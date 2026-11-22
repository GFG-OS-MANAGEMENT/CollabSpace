const prisma = require('../lib/prisma');
const { AppError } = require('../lib/errors');

const ownerSelect = { id: true, name: true, college: true };

const projectInclude = {
  owner: { select: ownerSelect },
  _count: { select: { joinRequests: { where: { status: 'APPROVED' } } } },
};

function serializeProject(project) {
  const { _count, ...rest } = project;
  return { ...rest, memberCount: _count.joinRequests };
}

function cleanTags(tags) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

async function list({ search, skill, kind, status, page, limit }) {
  const where = { status: status || 'OPEN' };

  if (kind) {
    where.kind = kind;
  }
  if (skill) {
    where.skills = { has: skill };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: projects.map(serializeProject),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getById(id) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });

  if (!project) {
    throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
  }

  return serializeProject(project);
}

async function assertOwner(projectId, userId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
  }
  if (project.ownerId !== userId) {
    throw new AppError(403, 'Only the project owner can do that', 'FORBIDDEN');
  }

  return project;
}

async function create(ownerId, { title, description, kind, skills, roles }) {
  const project = await prisma.project.create({
    data: {
      title,
      description,
      kind,
      skills: cleanTags(skills),
      roles: cleanTags(roles),
      ownerId,
    },
    include: projectInclude,
  });

  return serializeProject(project);
}

async function update(id, ownerId, changes) {
  await assertOwner(id, ownerId);

  const data = {};
  for (const field of ['title', 'description', 'kind', 'status']) {
    if (changes[field] !== undefined) {
      data[field] = changes[field];
    }
  }
  for (const field of ['skills', 'roles']) {
    if (changes[field] !== undefined) {
      data[field] = cleanTags(changes[field]);
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data,
    include: projectInclude,
  });

  return serializeProject(project);
}

async function remove(id, ownerId) {
  await assertOwner(id, ownerId);
  await prisma.project.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove, assertOwner, ownerSelect };
