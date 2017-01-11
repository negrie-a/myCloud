var tmS = require('tiny-models-sequelize');
var passport = require('passport');

var test = function(req, res) {
  console.log(req.rawHeaders)
//  console.log(req.user);
  if (req.session.test == "lol") {
    console.log("CA PASSE")
  }
  req.session.test = "lol"
  var User = tmS.getModel('User');
  User.findAll()
    .then(function (data) {
        res.send(data);
        console.log("user find");
    })
    .catch(function (err) {
      res.send(err);
        console.log(err);
    })
}

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
      return res.status(200).send("Connexion success");
    });
  })(req, res, next);
}

// var create = function (req, res) {
// create le folder de user avec users/ID_nameUser
//}

module.exports = {
  '/': {
        get: {
            action: test,
            level: 'public'
        }
    },

  '/login': {
        post: {
            action: connection,
            level: 'public'
        }
    }
}
