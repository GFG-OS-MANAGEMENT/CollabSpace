const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'collabspace123';

const demoUsers = [
  {
    name: 'Ada Lovelace',
    email: 'ada@college.edu',
    college: 'Analytical Engine College',
  },
  {
    name: 'Grace Hopper',
    email: 'grace@college.edu',
    college: 'Compiler University',
  },
];

const demoProjects = [
  {
    title: 'Campus events app',
    description:
      'A mobile-friendly app that aggregates hackathons, workshops and club events across campus in one calendar.',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    roles: ['Frontend developer', 'Backend developer'],
    kind: 'HACKATHON',
  },
  {
    title: 'Algorithms study group notes',
    description:
      'Shared notes and practice problem sets for students preparing for coding interviews and data structures courses.',
    skills: ['Python', 'Technical writing'],
    roles: ['Content contributor', 'Reviewer'],
    kind: 'ACADEMIC',
  },
  {
    title: 'Open-source portfolio tracker',
    description:
      'A small tool that pulls public GitHub activity into a shareable portfolio page for student developers.',
    skills: ['JavaScript', 'REST APIs'],
    roles: ['Full-stack developer'],
    kind: 'PERSONAL',
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users = [];
  for (const user of demoUsers) {
    users.push(
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: { ...user, passwordHash },
      })
    );
  }

  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    for (const [index, project] of demoProjects.entries()) {
      await prisma.project.create({
        data: { ...project, ownerId: users[index % users.length].id },
      });
    }
  }

  console.log(
    `Seeded ${users.length} demo users (password: ${DEMO_PASSWORD}) and ${demoProjects.length} demo projects.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
