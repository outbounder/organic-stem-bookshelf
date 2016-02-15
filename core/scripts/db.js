module.exports = function (angel) {
  var loadDNA = require('organic-dna-loader')
  require('angelabilities-exec')(angel)

  var handleError = function (err) {
    console.error(err.stack || err)
    process.exit(1)
  }
  var config = {}

  var loadConfig = function (next) {
    process.env.CELL_MODE = process.env.CELL_MODE || '_development'
    loadDNA(function (err, dna) {
      if (err) return next(err)
      var user = dna.server.database.auth.user
      var pass = dna.server.database.auth.pass
      var host = dna.server.database.host
      var dbname = dna.server.database.name
      var connection = `postgres://${user}:${pass}@${host}/${dbname}`
      config = {
        client: 'pg',
        connection: connection,
        searchPath: 'knex,public',
        directory: './server/migrations',
        dbname: dbname,
        user: user
      }
      next()
    })
  }

  var initConnection = function (next) {
    loadConfig(function () {
      var knex = require('knex')(config)
      next(null, knex)
    })
  }

  angel.on('db migration :name', function (angel, next) {
    initConnection(function (err, knex) {
      if (err) return handleError(err)
      knex.migrate.make(angel.cmdData.name, config).then((r) => {
        console.info('make complete.')
        knex.destroy()
        next && next(null, r)
      }).catch(handleError)
    })
  })
  angel.on('db migrate', function () {
    initConnection(function (err, knex) {
      if (err) return handleError(err)
      knex.migrate.latest(config).then(() => {
        console.info('migrate complete.')
        knex.destroy()
      }).catch(handleError)
    })
  })
  angel.on('db rollback', function () {
    initConnection(function (err, knex) {
      if (err) return handleError(err)
      knex.migrate.rollback(config).then(() => {
        console.info('undo complete.')
        knex.destroy()
      }).catch(handleError)
    })
  })
  angel.on('db version', function () {
    initConnection(function (err, knex) {
      if (err) return handleError(err)
      knex.migrate.currentVersion(config).then((version) => {
        console.info(version)
        knex.destroy()
      }).catch(handleError)
    })
  })
  angel.on('db create', function (angel, next) {
    loadConfig(function () {
      angel.sh([
        "sudo su -c 'createdb --owner=" + config.user + ' ' + config.dbname + "' postgres",
      ].join(' && '), function (err) {
        if (err) return handleError(err)
        console.info('created database', config.dbname)
        next && next()
      })
    })
  })
  angel.on('db drop', function (angel, next) {
    loadConfig(function () {
      angel.sh([
        "sudo su -c 'dropdb " + config.dbname + "' postgres",
      ].join(' && '), function (err) {
        if (err) return handleError(err)
        console.info('dropped database', config.dbname)
        next && next()
      })
    })
  })
  angel.on('db rebuild', function () {
    angel.do('db drop', function (err) {
      if (err) return handleError(err)
      angel.do('db create', function (err) {
        if (err) return handleError(err)
        angel.do('db migrate')
      })
    })
  })
}
