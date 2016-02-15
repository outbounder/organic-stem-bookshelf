var fs = require('fs')
var path = require('path')
var format = require('string-template')
var plural = require('plural')

module.exports = function (angel) {
  angel.on('bookshelf create :name', function (angel) {
    var migrationName = 'create-' + angel.cmdData.name
    angel.do('db migration ' + migrationName, function (err, migrationFilePath) {
      if (err) throw err
      var createModelTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'create-model.js.template'))
      createModelTemplate = format(createModelTemplate.toString(), {
        tableName: plural(angel.cmdData.name)
      })
      fs.writeFileSync(migrationFilePath, createModelTemplate)

      var modelFilePath = path.join(process.cwd(), 'server', 'models', angel.cmdData.name + '.js')
      var modelTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'model.js.template'))
      modelTemplate = format(modelTemplate.toString(), {
        tableName: plural(angel.cmdData.name),
        modelName: angel.cmdData.name
      })
      fs.writeFileSync(modelFilePath, modelTemplate)
    })
  })
}
