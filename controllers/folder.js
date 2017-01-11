var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var path = require('path')
var fs = require('fs');

var create = function (req, res) {
    // console.log(req);
    // console.log(req.sessions.Cookie);
    if (!req.user) {
        return res.status(403).json("User is not connected");
    }

    fs.mkdir([global.rootPath, "data", req.user.id, req.body.pathServer, req.body.name].createPath("/"), function(err) {
        if (err) {
            console.log(err)
            return res.status(404).send("Can not create folder")
        }

        var value = {
            msg : req.body.name + "has been created"
        }
        return res.status(200).send(value)
    })
}

module.exports = {
    '/': {
        post: {
            action: create,
            level: 'public'
        }
    }
}
