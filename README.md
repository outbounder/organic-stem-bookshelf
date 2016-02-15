# organic-stem-bookshelf

Organic Stem stack upgrade providing server side storage via bookshelf / PostgreSQL

## install

```
$ cd my-project
$ npm install organic-stem-bookshelf
$ angel stack use server-bookshelf
$ angel stack configure
```

## usage

### prerequirements

* PostgreSQL server running
* `postgres` unix & db user

### command line notes

* `CELL_MODE` env variable is used to source `dna/{CELL_MODE}/server/database` info
  * defaults to `_development`

### [Bookshelf](http://bookshelfjs.org/)

#### create new model

```
$ angel bookshelf create myModel
... edit /server/migrations/nnn_create-myModel.js
... edit /server/models/myModel.js
$ angel db migrate
```

#### models usage notes

To be able to do the following within a nodejs process:

```
var Entity = require('./server/models/entity')
var record = new Entity()
record.save()
```

One should populate the singleton module variables:

* `require('./server/models').knex`
* `require('./server/models').bookshelf`
* `require('./server/models').Model`

Shortly:

```
require('./server/models').init(knexInstance)
```

___or___

Use provided organelle `./server/plasma/bookshelf` with dna:

```
{
  "models": "./server/models"
  "database": {
    "host": "{{{host}}}",
    "name": "{{{dbname}}}",
    "auth": {
      "user": "{{{username}}}",
      "pass": "{{{password}}}"
    }
  }
}
```

___or___

```
var loadDna = require('organic-dna-loader')
loadDna(function (err, dna) {
  var knexInstance = require('knex')(dna.server.database)
  require('./server/models').init(knexInstance)
})
```
