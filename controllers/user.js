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
      return next(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.status(200).json("connexion reussi");
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
