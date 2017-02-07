var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var fs = require('fs');
var path = require('path');
var walk    = require('walk');

var getContents = function (req, res) {
  var pathFiles = [global.rootPath, "data", req.user.id, req.body.path].createPath("/");

  fs.readdir(pathFiles, function(err, files) {
      if (err != null) {
        console.log(err);
        var error = JSON.stringify(err);
        return res.status(404).send("Can not get content on the server");
      }
      var filesArray = [];
      var folderArray = [];

      for (var i = 0 ; i < files.length ; i++) {
        var object = fs.lstatSync(pathFiles + "/" + files[i]);
        if (object.isFile()) {

          filesArray.push({
            name: files[i],
            size: object.size,
            path: req.body.path
          });
        }
        else {
          if (files[i] != ".diminutive") // don't send small picture hide in .diminutive
            folderArray.push(files[i]);
        }
      }
      var text = JSON.stringify({files : filesArray, folders: folderArray, path: req.body.path});
      return res.status(200).send(text);
  })
}

var getRepositoryTree = function(req, res) {
  var walker  = walk.walk([global.rootPath, "data", 2].createPath("/"), { followLinks: false });
  var files = []
  walker.on('directory', function(root, stat, next) {
      if (stat.name !== ".diminutive") {
        var path = root.replace([global.rootPath, "data", 2].createPath("/"), '')
        var filePath = path + '/' + stat.name
        files.push(filePath.slice(1));
      }
      next();
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    console.log("[ERROR] : getRepositoryTree : ");
    next();
  });

  walker.on('end', function() {
      res.status(200).send(JSON.stringify(files))
  });
}

module.exports = {
  '/contents': {
        post: {
            action: getContents,
            level: 'member'
        }
    },

  '/repositoryTree' : {
        get: {
          action: getRepositoryTree,
          level: 'public'
        }
    }
}
