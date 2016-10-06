var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var tmS = require('tiny-models-sequelize');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    var User = tmS.getModel('User');
    User.findOne({where : { email: username }})
      .then(function (user) {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
    .catch(function (err) {
      return done("An internal error occured" + err);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var User = tmS.getModel('User');

  User.findById(id).then(function (user) {
      if (user)
        return done(null, user);
      return done(null, null);
  })
  .catch(function(err) {
      return done("An internal error occured");
  })
});
