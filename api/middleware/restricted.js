const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'secret';

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).json('token invalid')
      } else {
        req.decodedJwt = decoded;
        next();
      }
    })
  } else {
    res.status(401).json('token required')
  }
};
