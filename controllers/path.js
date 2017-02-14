var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var fs = require('fs');
var path = require('path');
var walk    = require('walk');
var diskspace = require('diskspace');
var exec = require('child_process').exec;

var getContents = function (req, res) {
  var pathFiles = [global.rootPath, "data", req.user.id, req.body.path].createPath("/");

  fs.readdir(pathFiles, function(err, files) {
      if (err != null) {
        console.log(err);
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
          if (files[i] != ".diminutive" && files[i] !== ".DS_Store") // don't send small picture hide in .diminutive
            folderArray.push(files[i]);
        }
      }
      return res.status(200).send({files : filesArray, folders: folderArray, path: req.body.path});
  })
}

var getTreeRepository = function(req, res) {
  var walker  = walk.walk([global.rootPath, "data", req.user.id].createPath("/"), { followLinks: false });
  var files = []
  walker.on('directory', function(root, stat, next) {
      if (stat.name !== ".diminutive" && stat.name !== ".DS_Store") {
        var path = root.replace([global.rootPath, "data", req.user.id].createPath("/"), '')
        var filePath = path + '/' + stat.name
        files.push(filePath.slice(1));
      }
      next();
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    console.log("[ERROR] : getRepositoryTree");
    next();
  });

  walker.on('end', function() {
      res.status(200).send(files)
  });
}

var getStatsRepository = function(req, res) {
    var path = [global.rootPath, "data", "2"].createPath("/");
    var walker  = walk.walk(path, { followLinks: false });
    const diskStats = {
      totalSizeUsed: 0,
      totalSizeServer: 0,
      totalSizeFree: 0,
      pourcentage: 0,
      totalFolders: 0,
      totalFiles: 0,
      totalPictures: 0,
      totalMovies: 0,
      sizeFolders: 0,
      sizePictures: 0,
      sizeMovies: 0,
    }

    const disk = exec('df -m | grep /dev/disk1', (err, stdout, stderr) => {
        if (err) {
          console.log(err)
        }''
        var arrayDiskStat = stdout.replace(/\s+/g,' ').split(' ');
        diskStats.totalSizeFree = Number(arrayDiskStat[3]) * 1000000;
        diskStats.totalSizeServer = Number(arrayDiskStat[1]);
        diskStats.pourcentage = Number(arrayDiskStat[4].replace('%', ''));
    })

    var files = fs.readdirSync(path)
    files.forEach(function(file) {
      if (file !== ".diminutive" && file !== ".DS_Store") {
        var stats = fs.lstatSync([path, file].createPath("/"))
        if (stats.isFile()) {
          if (file.isImage()) {
            diskStats.totalPictures += 1
            diskStats.sizePictures += stats.size
          }
          else if (file.isMovie()) {
            diskStats.totalMovies += 1
            diskStats.sizeMovies += stats.size
          }
          diskStats.totalSizeUsed += stats.size
          diskStats.totalFiles += 1
        }
        else if (stats.isDirectory()) {
          diskStats.totalFolders += 1
          diskStats.sizeFolders += stats.size
        }
      }
    })

    walker.on('directory', function(root, stats, next) {
          var pathFolder = [root, stats.name].createPath("/")
          if (stats.name !== ".diminutive" && stats.name !== ".DS_Store") {
            fs.readdir(pathFolder, function(err, files) {
                if (err) {
                  console.log(err)
                }
                files.forEach(function(file) {
                  var stats = fs.lstatSync([pathFolder, file].createPath("/"))
                  if (file !== ".diminutive" && file !== ".DS_Store") {
                    if (stats.isFile()) {
                      if (file.isImage()) {
                        diskStats.totalPictures += 1
                        diskStats.sizePictures += stats.size
                      }
                      else if (file.isMovie()) {
                        diskStats.totalMovies += 1
                        diskStats.sizeMovies += stats.size
                      }
                      diskStats.totalSizeUsed += stats.size
                      diskStats.totalFiles += 1
                    }
                    else if (stats.isDirectory()) {
                      diskStats.totalFolders += 1
                      diskStats.sizeFolders += stats.size
                    }
                  }
                })
                next();
            })
        }
        else {
          next();
        }
    });

    walker.on("errors", function (root, nodeStatsArray, next) {
      console.log("[ERROR] : getStatsTree");
      next();
    });

    walker.on('end', function() {
        res.status(200).send(diskStats)
    });
}

module.exports = {
  '/contents': {
        post: {
            action: getContents,
            level: 'member'
        }
    },

  '/treeRepository': {
        get: {
          action: getTreeRepository,
          level: 'public'
        }
    },

  '/statsRepository': {
    get: {
      action: getStatsRepository,
      level: 'public'
    }
  }
}
