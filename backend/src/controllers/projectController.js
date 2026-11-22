const projectService = require('../services/projectService');

async function list(req, res) {
  const result = await projectService.list(req.validated.query);
  res.json(result);
}

async function get(req, res) {
  const project = await projectService.getById(req.validated.params.id);
  res.json({ data: project });
}

async function create(req, res) {
  const project = await projectService.create(req.user.id, req.validated.body);
  res.status(201).json({ data: project });
}

async function update(req, res) {
  const project = await projectService.update(
    req.validated.params.id,
    req.user.id,
    req.validated.body
  );
  res.json({ data: project });
}

async function remove(req, res) {
  await projectService.remove(req.validated.params.id, req.user.id);
  res.status(204).end();
}

module.exports = { list, get, create, update, remove };
