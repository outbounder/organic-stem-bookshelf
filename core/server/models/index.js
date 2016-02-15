module.exports = {
  init: function (knex) {
    module.exports.knex = knex
    module.exports.bookshelf = require('bookshelf')(knex)
    module.exports.Model = module.exports.bookshelf.Model
  },
  // required to be populated when using models
  knex: null,
  bookshelf: null,
  Model: null
}
