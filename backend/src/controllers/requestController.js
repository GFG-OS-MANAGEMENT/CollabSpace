const requestService = require('../services/requestService');

async function create(req, res) {
  const joinRequest = await requestService.create(
    req.validated.params.id,
    req.user.id,
    req.validated.body
  );
  res.status(201).json({ data: joinRequest });
}

async function listForProject(req, res) {
  const joinRequests = await requestService.listForProject(
    req.validated.params.id,
    req.user.id
  );
  res.json({ data: joinRequests });
}

async function decide(req, res) {
  const joinRequest = await requestService.decide(
    req.validated.params.id,
    req.validated.params.requestId,
    req.user.id,
    req.validated.body.status
  );
  res.json({ data: joinRequest });
}

async function listMine(req, res) {
  const joinRequests = await requestService.listMine(req.user.id);
  res.json({ data: joinRequests });
}

module.exports = { create, listForProject, decide, listMine };
