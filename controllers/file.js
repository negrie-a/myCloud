var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var fs = require('fs');

var create = function (req, res) {
  // console.log(req);
  // console.log(req.sessions.Cookie);
  if (!req.user) {
    return res.status(403).json("User not connected");
  }
  req.body.fk_user_id = req.user.id;
  var File = tmS.getModel('File');
  File.create(req.body).then(function (rep) {
      fs.createWriteStream("data/" + req.user.id + rep.pathServer + "/" + rep.name);

      var values = {
        "id" : rep.id.toString(),
        "pathClient" : rep.pathDevice,
        "name" : rep.name,
        "size" : rep.size,
        "status" : rep.status
      };

      var text = JSON.stringify(values);
      return res.status(200).send(text);
  })
  .catch(function(err) {
      console.log(err)
      return res.status(404).json(err);
  });
}

var writebysequence = function(req, res) {
  if (!req.user) {
    return res.status(403).json("User not connected");
  }
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (id, file, filename) {
      var File = tmS.getModel('File');
      File.findById(id)
      .then(function(rep) {
        file.on('data', (chunk) => {
          console.log(`Received ${chunk.length} bytes of data.`);
          fs.appendFile("data/" + req.user.id + rep.pathServer + "/" + filename, chunk);
        });

        file.on('end', function () {
            return res.status(200).send({id : id});
        });
      })
      .catch(function (err) {
          return res.status(404).send(err);
      })
    });
  }

module.exports = {
  '/create': {
        post: {
            action: create,
            level: 'public'
        }
    },

  '/write': {
        post: {
            action: writebysequence,
            level: 'public'
        }
  }
}
