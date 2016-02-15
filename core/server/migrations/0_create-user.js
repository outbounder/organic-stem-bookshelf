module.exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary()
    table.string('username')
    table.string('email').unique()
    table.string('password')
  })
}

module.exports.down = function (knex) {
  return knex.schema.dropTable('users')
}
