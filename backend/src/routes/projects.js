const express = require('express');
const projectController = require('../controllers/projectController');
const requestController = require('../controllers/requestController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../lib/errors');
const {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  projectParamsSchema,
  createRequestSchema,
  decideRequestSchema,
} = require('../validation/projects');

const router = express.Router();

router.get('/', validate(listProjectsSchema), asyncHandler(projectController.list));
router.post('/', requireAuth, validate(createProjectSchema), asyncHandler(projectController.create));
router.get('/:id', validate(projectParamsSchema), asyncHandler(projectController.get));
router.patch('/:id', requireAuth, validate(updateProjectSchema), asyncHandler(projectController.update));
router.delete('/:id', requireAuth, validate(projectParamsSchema), asyncHandler(projectController.remove));

router.post(
  '/:id/requests',
  requireAuth,
  validate(createRequestSchema),
  asyncHandler(requestController.create)
);
router.get(
  '/:id/requests',
  requireAuth,
  validate(projectParamsSchema),
  asyncHandler(requestController.listForProject)
);
router.patch(
  '/:id/requests/:requestId',
  requireAuth,
  validate(decideRequestSchema),
  asyncHandler(requestController.decide)
);

module.exports = router;
