const ValidationError = require("../errors/ValidationError");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))

      return next(new ValidationError(errors));
    }

    req.body = result.data;
    return next();
  }
};

module.exports = { validateRequest };
