const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const request = require('supertest');
const createApp = require('../src/app');
const prisma = require('../src/lib/prisma');

const app = createApp();
const PASSWORD = 'password123';

function bearer(token) {
  return `Bearer ${token}`;
}

function uniqueEmail(prefix) {
  return `${prefix}-${randomUUID()}@college.edu`;
}

async function registerUser(overrides = {}) {
  const payload = {
    name: 'Test Student',
    email: uniqueEmail('student'),
    password: PASSWORD,
    college: 'Test College',
    ...overrides,
  };

  const response = await request(app).post('/api/auth/register').send(payload);
  assert.equal(response.status, 201, response.text);
  return { ...response.body.data, email: payload.email };
}

async function createProject(token, overrides = {}) {
  const payload = {
    title: 'Campus events app',
    description: 'A mobile app that aggregates hackathons, workshops, and club events across campus.',
    skills: ['React', 'Node.js'],
    roles: ['Frontend developer'],
    kind: 'HACKATHON',
    ...overrides,
  };

  const response = await request(app)
    .post('/api/projects')
    .set('Authorization', bearer(token))
    .send(payload);
  assert.equal(response.status, 201, response.text);
  return response.body.data;
}

beforeEach(async () => {
  await prisma.joinRequest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
});

test('reports service health', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'collabspace-api');
});

test('registers users, rejects weak input, and returns the current user', async () => {
  const invalid = await request(app)
    .post('/api/auth/register')
    .send({ name: 'A', email: 'not-an-email', password: 'short' })
    .expect(400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(invalid.body.error.details));

  const account = await registerUser({ name: 'Ada Lovelace' });
  assert.ok(account.token);
  assert.equal(account.user.email, account.email);
  assert.equal(account.user.college, 'Test College');

  const duplicate = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ada', email: account.email.toUpperCase(), password: PASSWORD })
    .expect(409);
  assert.equal(duplicate.body.error.code, 'EMAIL_TAKEN');

  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', bearer(account.token))
    .expect(200);
  assert.equal(me.body.data.id, account.user.id);
  assert.equal(me.body.data.email, account.email);
  assert.equal(me.body.data.passwordHash, undefined);

  const anonymous = await request(app).get('/api/auth/me').expect(401);
  assert.equal(anonymous.body.error.code, 'UNAUTHORIZED');

  const garbage = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer not-a-token')
    .expect(401);
  assert.equal(garbage.body.error.code, 'INVALID_TOKEN');
});

test('logs in with valid credentials only', async () => {
  const account = await registerUser();

  const success = await request(app)
    .post('/api/auth/login')
    .send({ email: account.email, password: PASSWORD })
    .expect(200);
  assert.ok(success.body.data.token);

  const wrongPassword = await request(app)
    .post('/api/auth/login')
    .send({ email: account.email, password: 'wrong-password' })
    .expect(401);
  assert.equal(wrongPassword.body.error.code, 'INVALID_CREDENTIALS');

  const unknownEmail = await request(app)
    .post('/api/auth/login')
    .send({ email: uniqueEmail('ghost'), password: PASSWORD })
    .expect(401);
  assert.equal(unknownEmail.body.error.code, 'INVALID_CREDENTIALS');
});

test('requires authentication to create projects', async () => {
  const response = await request(app)
    .post('/api/projects')
    .send({ title: 'New project', description: 'A description that is definitely long enough.' })
    .expect(401);
  assert.equal(response.body.error.code, 'UNAUTHORIZED');
});

test('creates projects and supports search, skill filters, and pagination', async () => {
  const owner = await registerUser();
  const events = await createProject(owner.token);
  await createProject(owner.token, {
    title: 'Machine learning study notes',
    description: 'A tool that summarizes machine learning papers for campus study groups.',
    kind: 'ACADEMIC',
    skills: ['Python'],
    roles: ['Writer'],
  });

  const all = await request(app).get('/api/projects').expect(200);
  assert.equal(all.body.pagination.total, 2);
  assert.equal(all.body.data[0].memberCount, 0);
  assert.equal(all.body.data[0].owner.email, undefined);

  const bySkill = await request(app).get('/api/projects?skill=React').expect(200);
  assert.equal(bySkill.body.pagination.total, 1);
  assert.equal(bySkill.body.data[0].id, events.id);

  const bySearch = await request(app).get('/api/projects?search=papers').expect(200);
  assert.equal(bySearch.body.pagination.total, 1);

  const secondPage = await request(app).get('/api/projects?limit=1&page=2').expect(200);
  assert.equal(secondPage.body.data.length, 1);
  assert.equal(secondPage.body.pagination.totalPages, 2);

  const invalidFilter = await request(app).get('/api/projects?limit=500').expect(400);
  assert.equal(invalidFilter.body.error.code, 'VALIDATION_ERROR');

  const missing = await request(app).get(`/api/projects/${randomUUID()}`).expect(404);
  assert.equal(missing.body.error.code, 'PROJECT_NOT_FOUND');
});

test('enforces project ownership for updates and deletes', async () => {
  const owner = await registerUser();
  const stranger = await registerUser();
  const project = await createProject(owner.token);

  await request(app)
    .patch(`/api/projects/${project.id}`)
    .set('Authorization', bearer(stranger.token))
    .send({ title: 'Hijacked title' })
    .expect(403);

  const updated = await request(app)
    .patch(`/api/projects/${project.id}`)
    .set('Authorization', bearer(owner.token))
    .send({ title: 'Updated title', status: 'CLOSED', skills: ['React', 'React', 'Fig'] })
    .expect(200);
  assert.equal(updated.body.data.title, 'Updated title');
  assert.deepEqual(updated.body.data.skills, ['React', 'Fig']);

  const emptyUpdate = await request(app)
    .patch(`/api/projects/${project.id}`)
    .set('Authorization', bearer(owner.token))
    .send({})
    .expect(400);
  assert.equal(emptyUpdate.body.error.code, 'VALIDATION_ERROR');

  await request(app)
    .delete(`/api/projects/${project.id}`)
    .set('Authorization', bearer(stranger.token))
    .expect(403);
  await request(app)
    .delete(`/api/projects/${project.id}`)
    .set('Authorization', bearer(owner.token))
    .expect(204);
  await request(app).get(`/api/projects/${project.id}`).expect(404);
});

test('handles the join request lifecycle', async () => {
  const owner = await registerUser();
  const applicant = await registerUser();
  const project = await createProject(owner.token);

  const own = await request(app)
    .post(`/api/projects/${project.id}/requests`)
    .set('Authorization', bearer(owner.token))
    .send({ message: 'Let me join my own team.' })
    .expect(400);
  assert.equal(own.body.error.code, 'OWN_PROJECT');

  const created = await request(app)
    .post(`/api/projects/${project.id}/requests`)
    .set('Authorization', bearer(applicant.token))
    .send({ message: 'I can help build the React frontend.' })
    .expect(201);
  assert.equal(created.body.data.status, 'PENDING');
  assert.equal(created.body.data.user.email, undefined);

  const duplicate = await request(app)
    .post(`/api/projects/${project.id}/requests`)
    .set('Authorization', bearer(applicant.token))
    .send({})
    .expect(409);
  assert.equal(duplicate.body.error.code, 'ALREADY_REQUESTED');

  await request(app)
    .get(`/api/projects/${project.id}/requests`)
    .set('Authorization', bearer(applicant.token))
    .expect(403);

  const ownerList = await request(app)
    .get(`/api/projects/${project.id}/requests`)
    .set('Authorization', bearer(owner.token))
    .expect(200);
  assert.equal(ownerList.body.data.length, 1);
  assert.equal(ownerList.body.data[0].user.name, applicant.user.name);

  const decided = await request(app)
    .patch(`/api/projects/${project.id}/requests/${created.body.data.id}`)
    .set('Authorization', bearer(owner.token))
    .send({ status: 'APPROVED' })
    .expect(200);
  assert.equal(decided.body.data.status, 'APPROVED');

  const again = await request(app)
    .patch(`/api/projects/${project.id}/requests/${created.body.data.id}`)
    .set('Authorization', bearer(owner.token))
    .send({ status: 'REJECTED' })
    .expect(409);
  assert.equal(again.body.error.code, 'REQUEST_ALREADY_DECIDED');

  const mine = await request(app)
    .get('/api/me/requests')
    .set('Authorization', bearer(applicant.token))
    .expect(200);
  assert.equal(mine.body.data.length, 1);
  assert.equal(mine.body.data[0].project.id, project.id);

  const detail = await request(app).get(`/api/projects/${project.id}`).expect(200);
  assert.equal(detail.body.data.memberCount, 1);
});

test('stops accepting join requests after a project closes', async () => {
  const owner = await registerUser();
  const applicant = await registerUser();
  const project = await createProject(owner.token);

  await request(app)
    .patch(`/api/projects/${project.id}`)
    .set('Authorization', bearer(owner.token))
    .send({ status: 'CLOSED' })
    .expect(200);

  const response = await request(app)
    .post(`/api/projects/${project.id}/requests`)
    .set('Authorization', bearer(applicant.token))
    .send({ message: 'I would still like to help out.' })
    .expect(409);
  assert.equal(response.body.error.code, 'PROJECT_CLOSED');

  const closedList = await request(app).get('/api/projects?status=CLOSED').expect(200);
  assert.equal(closedList.body.pagination.total, 1);

  const openList = await request(app).get('/api/projects').expect(200);
  assert.equal(openList.body.pagination.total, 0);
});

test('returns structured errors for unknown routes and malformed JSON', async () => {
  const unknown = await request(app).get('/api/does-not-exist').expect(404);
  assert.equal(unknown.body.error.code, 'NOT_FOUND');

  const malformed = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send('{"email":')
    .expect(400);
  assert.equal(malformed.body.error.code, 'INVALID_JSON');
});
