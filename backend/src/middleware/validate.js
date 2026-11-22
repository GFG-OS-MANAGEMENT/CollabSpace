const { AppError } = require('../lib/errors');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(
        new AppError(
          400,
          'Validation failed',
          'VALIDATION_ERROR',
          result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }))
        )
      );
    }

    req.validated = result.data;
    return next();
  };
}

module.exports = { validate };
