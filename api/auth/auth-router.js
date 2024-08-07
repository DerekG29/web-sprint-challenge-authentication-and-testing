const router = require('express').Router();
const Users = require('./auth-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validate } = require('./auth-middleware');

router.post('/register', validate, async (req, res, next) => {
 try {
    const { username, password } = req.body;
    const user = await Users.findBy({ username });
    if (user) {
      res.status(422).json('username taken')
    } else {
      const hash = bcrypt.hashSync(password, 8);
      const result = await Users.insert({ username, password: hash });
      res.status(201).json(result);
    }
  } catch (error) {
    next(error)
  }
});

router.post('/login', validate, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findBy({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = buildToken(user);
      res.status(200).json({ message: `welcome, ${username}`, token });
    } else {
      res.status(422).json('invalid credentials')
    }
  } catch (error) {
    next(error)
  }
});

function buildToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  }
  const options = {
    expiresIn: '1d',
  }
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign(payload, secret, options);
}

module.exports = router;
