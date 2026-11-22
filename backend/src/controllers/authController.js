const authService = require('../services/authService');

async function register(req, res) {
  const result = await authService.register(req.validated.body);
  res.status(201).json({ data: result });
}

async function login(req, res) {
  const result = await authService.login(req.validated.body);
  res.json({ data: result });
}

async function me(req, res) {
  res.json({ data: req.user });
}

module.exports = { register, login, me };
