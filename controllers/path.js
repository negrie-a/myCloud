var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var fs = require('fs');
var path = require('path');

var getContents = function (req, res) {
  if (!req.user) {
    return res.status(403).json("User is not connected");
  }
  var pathFiles = [global.rootPath, "data", req.user.id, req.body.path].createPath("/");

  req.session.actualPath = req.body.path;
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

module.exports = {
  '/contents': {
        post: {
            action: getContents,
            level: 'public'
        }
    }
}
