var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var fs = require('fs');
var path = require('path');

var getContents = function (req, res) {
  if (!req.user) {
    return res.status(403).json("User not connected");
  }
  var pathFiles = path.resolve(__dirname) + "/../data/" + req.user.id + req.body.path;
  fs.readdir(pathFiles, function(err, files) {
      if (err != null) {
        console.log(err);
        var error = JSON.stringify(err);
        return res.status(404).send(error);
      }
      var filesArray = [];
      var folderArray = [];

      for (var i = 0 ; i < files.length ; i++) {
        if (fs.lstatSync(pathFiles + "/" + files[i]).isFile()) {
          filesArray.push(files[i]);
        }
        else {
          folderArray.push(files[i]);
        }
      }
      var text = JSON.stringify({files : filesArray, folders: folderArray});
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
