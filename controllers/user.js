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

            const disk = exec('df -h -m / | grep /', (err, stdout, stderr) => {
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

var logout = function(req, res) {
    req.logout();
    return res.status(200).end();
}

var subscribe = function(req, res) {
    var User = tmS.getModel('User');
    User.findOne({where: {"email": req.body.email}})
    .then(function(user) {
        if (user !== null) {
            return res.status(404).send("Email already used");
        }
        User.create(req.body)
        .then(function(user) {
            fs.mkdir([global.rootPath, "data", user.id].createPath("/"), function(err) {
                if (err) {
                    console.log(err)
                    return res.status(404).send("Can not create folder")
                }
                return res.status(200).send("Account created");
            })
        })
        .catch(function(err) {
            console.log(err)
            return res.status(404).send("Invalid information");
        })
    })
}

var uploadProfilPicture = function(req, res) {
    req.pipe(req.busboy);
    req.busboy.on('file', function (name, file, filename) {
        var bufferList = []
        var bufferListSize = 0
        var pathFile = [global.rootPath, "profil_picture", filename].createPath("/");

        file.on('data', (chunk) => {
            bufferList.push(chunk)
            bufferListSize += chunk.length
        });

        file.on('close', function () {
            console.log("CLOSE")
        });

        file.on('end', function () {
            const data = Buffer.concat(bufferList, bufferListSize)
            fs.writeFile(pathFile, data, function (err) {
                if (err) {
                    console.log(err)
                    return res.status(404).send("Can not append data in file ");
                }
                return res.status(200).send("Success upload")
            })
        })
    })
}

module.exports = {
    '/login': {
        post: {
            action: connection,
            level: 'public'
        }
    },

    '/logout': {
        get: {
            action: logout,
            level: 'member'
        }
    },

    '/subscribe': {
        post: {
            action: subscribe,
            level: 'public'
        }
    },

    "/uploadProfilPicture": {
        post: {
            action: uploadProfilPicture,
            level: 'public'
        }
    }
}
