const db = require('../../data/dbConfig')

module.exports = {
  findBy,
  insert
}

function findBy(filter) {
  return db('users')
    .where(filter)
    .first();
}

async function insert(user) {
  const id = await db('users').insert(user);
  return findBy({ id });
}
