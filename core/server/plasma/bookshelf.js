'use strict'

var path = require('path')

module.exports = class Bookshelf {

  constructor (plasma, dna) {
    if (!dna.reactOn) this.react(plasma, dna)
    plasma.on(dna.reactOn, (c, next) => {
      this.react(plasma, dna, next)
    })
    plasma.on(dna.killOn || 'kill', (c) => {
      this.transport.destroy()
    })
  }

  react (plasma, dna, next) {
    this.transport = this.openTransport(dna)
    require(path.join(process.cwd(), dna.models)).init(this.transport)
    next && next()
  }

  openTransport (dna) {
    var user = dna.database.auth.user
    var pass = dna.database.auth.pass
    var host = dna.database.host
    var dbname = dna.database.name
    var connection = `postgres://${user}:${pass}@${host}/${dbname}`
    return require('knex')({
      client: 'pg',
      connection: connection,
      searchPath: 'knex,public'
    })
  }
}
