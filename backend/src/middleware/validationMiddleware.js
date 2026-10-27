export const validation = (schema, body) => {
  return (req, res, next) => {
    const payload = body === "body" ? req.body : req.query;

    // console.log('payload:',payload);

    const { error } = schema.validate(payload);
    if (error) {
      return res.status(400).json({
        status: 0,
        status_code: 400,
        message: error.details[0].message,
      });
    }
    next();
  };
};
