const Users = require('./auth-model');

module.exports= {
  validate,
}

function validate(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(422).json('username and password required');
  } else {
    next();
  }
}