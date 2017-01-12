var tmS = require('tiny-models-sequelize');
var fs = require('fs');

var transfertHistoricToUser = function(req, res) {
    if (!req.user) {
        return res.status(403).json("User is not connected");
    }

    var File = tmS.getModel('File');
    File.findAll({where: {fk_user_id: req.user.id}})
    .then(function (files) {
        files = files;
        var promises = []
        for (var i = 0 ; i < files.length ; i++) {
            var promiseTmp = new Promise(function(resolve, reject) {
                var file = files[i];
                console.log(file)
                fs.access([global.rootPath, "data", req.user.id, file.pathServer, file.name].createPath("/"), function(err) {

                    // if file exist
                    if (!err) {
                        file.getActualSize(req.user.id)
                        .then(function(actualSize) {
                            file.dataValues.actualSize = actualSize;
                            resolve();
                        })
                        .catch(function (err) {
                            console.log(err)
                            reject(err);
                        })
                    }

                    // if file doesn't exist
                    else {
                        file.update({status : "Delete"})
                        .then(function (rep) {
                            file.status = "Delete"
                            resolve();
                        })
                        .catch(function (err) {
                            console.log(err)
                            return res.status(404).send("[ERROR] : Update file" + file.name);
                        })
                    }
                })
            })
            promises.push(promiseTmp);
        }
        Promise.all(promises).then(function() {
            return res.status(200).send(files);
        })
        .catch(function(err) {
            console.log(err)
            return res.status(404).send("Can not send historic to user");
        })
    })
    .catch(function (err) {
        console.log(err)
        return res.status(404).send("Can not find file in historic");
    })
}

var updateHistoricById = function (req, res) {
    if (!req.user) {
        return res.status(403).json("User is not connected");
    }

    var File = tmS.getModel('File');
    File.update(req.body, {where : {id: req.params.id}})
    .then(function(file) {
        console.log(file)
        return res.status(200).send(JSON.stringify(file));
    })
    .catch(function(err) {
        console.log(err)
        return res.status(404).send(JSON.stringify(err));
    })
}

var deleteHistoricFile = function (req, res) {
    if (!req.user) {
        return res.status(403).json("User is not connected");
    }

    var File = tmS.getModel('File');
    File.findOne({where : {id: req.params.id, fk_user_id: req.user.id}})
    .then(function(file) {
        if (file != null)
            file.destroy().then(function (rep) {
                return res.status(200).send(JSON.stringify(file));
            })
        else
            return res.status(400).send("This file does not exist in the historic");
    })
    .catch(function(err) {
        console.log(err)
        return res.status(404).send("Can not delete historic file");
    })
}

module.exports = {
    '/': {
        get: {
            action: transfertHistoricToUser,
            level: 'public'
        }
    },

    '/:id': {
        put: {
            action: updateHistoricById,
            level: 'public'
        },
        delete: {
            action: deleteHistoricFile,
            level: 'public'
        }
    }
}
