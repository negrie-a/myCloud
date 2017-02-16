var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var fs = require('fs');
var exec = require('child_process').exec;

var connection = function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      console.log(err)
      return next(err);
    }
    if (!user) {
      console.log(info);
      return res.status(401).send(info.message);
    }
    req.logIn(user, function(err) {
      if (err) {
        console.log(err);
        return next(err);
      }

      const disk = exec('df -m | grep /dev/disk1', (err, stdout, stderr) => {
        if (err) {
          console.log(err)
        }
        var arrayDiskStat = stdout.replace(/\s+/g,' ').split(' ');
        var totalSizeFree = Number(arrayDiskStat[3]) * 1000000;
        console.log(totalSizeFree)
        if (user.pathProfilPicture !== null) {
          var pathProfilPicture = [global.rootPath, "profil_picture", user.pathProfilPicture].createPath("/")
          var stat = fs.statSync(pathProfilPicture)

          var options = {
            headers: {
              'x-timestamp': Date.now(),
              'x-sent': true,
              'firstName': user.firstName,
              'lastName': user.lastName,
              'totalSizeFree': totalSizeFree
            }
          };
          return res.status(200).sendFile(pathProfilPicture, options);
        }
        else {
          res.header({
            'firstName': user.firstName,
            'lastName': user.lastName,
            'totalSizeFree' : totalSizeFree
          });
          return res.status(200).end();
        }
      })
    });
  })(req, res, next);
}

module.exports = {
  '/login': {
    post: {
      action: connection,
      level: 'public'
    }
  }
}
