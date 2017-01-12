var tmS = require('tiny-models-sequelize');
var passport = require('passport');

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

module.exports = {
  '/login': {
        post: {
            action: connection,
            level: 'public'
        }
    }
}
