var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var path = require('path')
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

var create = function (req, res) {
    // console.log(req);
    // console.log(req.sessions.Cookie);
    if (!req.user) {
        return res.status(403).json("User not connected");
    }
    req.body.fk_user_id = req.user.id;
    var File = tmS.getModel('File');

    fs.access([global.rootPath, "data", req.user.id, req.body.pathServer, req.body.name].createPath("/"), function(err) {

        //check if file exist
        if (!err) {
            req.body.msg = req.body.name + " already exists";
            return res.status(202).send(JSON.stringify(req.body));
        }

        //if file does not exist
        File.findOne({where : {name: req.body.name, pathServer: req.body.pathServer, fk_user_id: req.body.fk_user_id}})
        .then(function(fileAlreadyCreate) {
            if (fileAlreadyCreate != null) {
                fileAlreadyCreate.destroy()
                .then(function () {
                    File.create(req.body)
                    .then(function (fileCreate) {
                        fs.createWriteStream([global.rootPath, "data", req.user.id, fileCreate.pathServer, fileCreate.name].createPath("/"));
                        return res.status(200).send(JSON.stringify(fileCreate));
                    })
                    .catch(function(err) {
                        console.log(err)
                        return res.status(404).json(err);
                    });
                })
                .catch(function(err) {
                    console.log(err)
                    return res.status(404).send("[ERROR] : Can not delete " + fileAlreadyCreate.name + " in the historic")
                })
            }
            else {
                File.create(req.body).then(function (fileCreate) {
                    fs.createWriteStream([global.rootPath, "data", req.user.id, fileCreate.pathServer, fileCreate.name].createPath("/"));
                    return res.status(200).send(JSON.stringify(fileCreate));
                })
                .catch(function(err) {
                    console.log(err)
                    return res.status(404).json(err);
                });
            }
        })
        .catch(function(err) {
            console.log(err)
            return res.status(404).json(err);
        })
    })
}

var writebysequence = function(req, res) {
    if (!req.user) {
        return res.status(403).json("User not connected");
    }
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (id, file, filename) {
        var File = tmS.getModel('File');
        File.findById(id)
        .then(function(rep) {
            file.on('data', (chunk) => {
                console.log(`Received ${chunk.length} bytes of data.`);
                fs.appendFile([global.rootPath, "data", req.user.id, rep.pathServer, filename].createPath("/"), chunk);
            });

            file.on('end', function () {
                return res.status(200).send({id : id});
            });
        })
        .catch(function (err) {
            console.log(err)
            return res.status(404).send(err);
        })
    });
}

var transfertHistoricToUser = function(req, res) {
    if (!req.user) {
        return res.status(403).json("User not connected");
    }
    var File = tmS.getModel('File');
    File.findAll({where: {fk_user_id: req.user.id}})
    .then(function (files) {
        files = files;
        var promises = []
        for (var i = 0 ; i < files.length ; i++) {
            var promiseTmp = new Promise(function(resolve, reject) {
                var file = files[i];
                fs.access([global.rootPath, "data", req.user.id, req.body.pathServer, req.body.name].createPath("/"), function(err) {

                    // if file exist
                    if (!err) {
                        file.getActualSize(req.user.id)
                        .then(function(actualSize) {
                            file.dataValues.actualSize = actualSize;
                            resolve();
                        })
                        .catch(function (err) {
                            console.log(err)
                            reject();
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
            return res.status(404).send(files);
        })
    })
    .catch(function (err) {
        console.log(err)
        return res.status(404).send(err);
    })
}

var deleteFile = function (req, res) {
    if (!req.user) {
        return res.status(403).json("User not connected");
    }

    var path = [global.rootPath, "data", req.user.id, req.body.pathServer, req.body.name].createPath("/")
    fs.unlink(path, function(err) {
        if (err) {
            console.log(err)
            return res.status(404).send(err);
        }
        req.body.msg = req.body.name + " has been deleted";
        return res.status(200).send(JSON.stringify(req.body));
    })
}

var deleteHistoricFile = function (req, res) {
    if (!req.user) {
        return res.status(403).json("User not connected");
    }

    var File = tmS.getModel('File');
    File.findOne({where : {name: req.body.name, pathServer: req.body.pathServer, fk_user_id: req.user.id}})
    .then(function(file) {
        if (file != null)
            file.destroy().then(function (rep) {
                return res.status(200).send(JSON.stringify(file));
            })
        else
            return res.status(200).send(JSON.stringify(file));
    })
    .catch(function(err) {
        console.log(err)
        return res.status(404).send(JSON.stringify(err));
    })
}

var getImageReduce = function (req, res) {
    console.log([global.rootPath, "data", "2", req.params.name].join("/"))
    gm([global.rootPath, "data", "2", req.params.name].join("/"))
    .resize('200', '200')
    .stream(function (err, stdout, stderr) {
        if (err) {
            console.log(err)
            return res.status(404).send(err);
        }
        // var writeStream = fs.createWriteStream(global.rootPath + "/data/71.PNG");
        stdout.pipe(res);
        // return res.status(200).send();
        // stdout.pipe(res);
        // return res.status(200).send(res);
    });
}

module.exports = {
    '/': {
        post: {
            action: create,
            level: 'public'
        }
    },

    '/deleteFile': {
        post: {
            action: deleteFile,
            level: 'public'
        }
    },

    '/reduced/:name': {
        get: {
            action: getImageReduce,
            level: 'public'
        }
    },

    '/write': {
        post: {
            action: writebysequence,
            level: 'public'
        }
    },

    '/historic': {
        get: {
            action: transfertHistoricToUser,
            level: 'public'
        },

        post: {
            action: deleteHistoricFile,
            level: 'public'
        }
    }
}
