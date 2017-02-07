var tmS = require('tiny-models-sequelize');
var passport = require('passport');
var path = require('path')
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

var initializeForUpload = function (req, res) {
    req.body.fk_user_id = req.user.id
    var File = tmS.getModel('File');

    fs.access([global.rootPath, "data", req.user.id, req.body.pathServer, req.body.name].createPath("/"), function(err) {

        //check if file exist
        if (!err) {
            req.body.msg = req.body.name + " already exists";
            return res.status(202).send(JSON.stringify(req.body));
        }
        //if file does not exist
        fileCreateHistoric(req.body, req.user.id)
        .then(function (fileCreate) {
            fs.createWriteStream([global.rootPath, "data", req.user.id, fileCreate.pathServer, fileCreate.name].createPath("/"));
            return res.status(200).send(JSON.stringify(fileCreate));
        })
        .catch(function (err) {
            return res.status(404).json(err);
        })
    })
}

var initializeForDownload = function(req, res) {
    req.query.size = Number(req.query.size)

    fileCreateHistoric(req.query, req.user.id)
    .then(function (fileCreate) {
        return res.status(200).send(JSON.stringify(fileCreate));
    })
    .catch(function (err) {
        return res.status(404).json(err);
    })
}

var upload = function(req, res) {
    var pathServer = req.headers['path-server'];
    var totalSize = req.headers['total-size'];

    req.pipe(req.busboy);
    req.busboy.on('file', function (id, file, filename) {
        var File = tmS.getModel('File');
        var bufferList = []
        var bufferListSize = 0
        var pathFile = [global.rootPath, "data", req.user.id, pathServer, filename].createPath("/");

        file.on('data', (chunk) => {
            bufferList.push(chunk)
            bufferListSize += chunk.length
        });

        file.on('close', function () {
            console.log("CLOSE")
        });

        file.on('end', function () {
            const data = Buffer.concat(bufferList, bufferListSize)
            fs.appendFile(pathFile, data, function (err) {
                if (err) {
                    console.log(err)
                    return res.status(404).send("Can not append data in file ");
                }
                if (filename.isImage()) {
                    fs.stat(pathFile, function (err, stats) {
                        if (err) {
                            console.log(err)
                            return res.status(404).send("Can not get stat of file " + filename);
                        }
                        if (stats.size === totalSize) {
                            createMiniaturePicture([global.rootPath, "data", req.user.id, pathServer].createPath("/"), filename)
                            .then(function () {
                                return res.status(200).send({id : id});
                            })
                            .catch(function (err) {
                                console.log(err);
                                return res.status(404).send("Can not create miniature picture of " + filename);
                            });
                        }
                        else {
                            return res.status(200).send({id : id});
                        }
                    });
                }
                else {
                    return res.status(200).send({id : id});
                }
            });
        })
    });
}

var download = function(req, res) {
    var pathFile = req.query.pathFile
    var bufferSize = Number(req.query.bufferSize)
    var position = Number(req.query.position)

    var File = tmS.getModel('File');

    var pathFile = [global.rootPath, "data", 2, pathFile].createPath("/");
    fs.open(pathFile, 'r', (err, fd) => {
        if (err) {
            if (err.code === "ENOENT") {
                console.error('myfile does not exist');
                return;
            } else {
                throw err;
            }
        } else {
            var buffer = new Buffer(bufferSize)
            fs.read(fd, buffer, 0, bufferSize, position, function (err, bytesRead, buffer) {
                if (err) {
                    fs.close(fd)
                    console.log(err)
                    return res.status(404).json("Cannot read file - " + pathFile)
                }
                fs.close(fd)
                res.status(200).end(buffer);
            })
        }
    });
}

var createMiniaturePicture = function (pathFile, filename) {
    var promiseTmp = new Promise(function(resolve, reject) {
        var miniaturePath = [pathFile, ".diminutive"].createPath("/");
        fs.mkdir([pathFile, ".diminutive"].createPath("/"), function (err) {
            if (err && err.code !== "EEXIST") {
                console.log(err)
                reject(err)
            }
            else {
                gm([pathFile, filename].createPath("/"))
                .resize('200', '200')
                .write([miniaturePath, filename].createPath("/"), function (err) {
                    if (err) {
                        console.log(err);
                        reject(err)
                    }
                    else {
                        resolve();
                    }
                })
            }
        })
    })
    return promiseTmp;
}

var deleteFile = function (req, res) {
    var path = [global.rootPath, "data", req.user.id, req.query.pathServer, req.query.name].createPath("/")
    fs.unlink(path, function(err) {
        if (err) {
            console.log(err)
            return res.status(404).send("Can not delete file");
        }
        fs.unlink([global.rootPath, "data", req.user.id, req.query.pathServer, req.query.name, ".diminutive"].createPath("/"), function(err) {
            if (err) {
                console.log(err)
                return res.status(404).send("Can not delete file");
            }
            return res.status(200).send(JSON.stringify({
                pathServer: req.query.pathServer,
                name: req.query.name,
                msg: req.query.name + " has been deleted"
            }));
        })
    })
}

var getImageReduce = function (req, res) {
    if (!req.params.name.isImage())
    return res.status(200).send("");

    var pathFile = [global.rootPath, "data", req.user.id, req.query.pathServer, ".diminutive", req.params.name].createPath("/");
    fs.access(pathFile, function (err) {
        if (err) {
            createMiniaturePicture([global.rootPath, "data", req.user.id, req.query.pathServer].createPath("/"), req.params.name)
            .then(function () {
                return res.status(200).sendFile(pathFile);
            })
            .catch(function (err) {
                return res.status(404).send("Can not create miniature picture of " + req.params.name);
            });
            return ;
        }
        res.status(200).sendFile(pathFile)
    })
}

var fileCreateHistoric = function(file, userId) {
    file.fk_user_id = userId;
    var File = tmS.getModel('File');

    return new Promise(function(resolve, reject) {
        File.findOne({where : {name: file.name, pathServer: file.pathServer, fk_user_id: file.fk_user_id, type: file.type}})
        .then(function(fileAlreadyCreate) {
            if (fileAlreadyCreate != null) {
                var idDeleted = fileAlreadyCreate.id;
                fileAlreadyCreate.destroy()
                .then(function () {
                    File.create(file)
                    .then(function (fileCreate) {
                        fileCreate["idDeleted"] = idDeleted
                        resolve({
                            idDeleted: idDeleted,
                            id: fileCreate.id,
                            size: fileCreate.size,
                            name: fileCreate.name,
                            status: fileCreate.status,
                            pathServer: fileCreate.pathServer,
                            pathDevice: fileCreate.pathDevice,
                            type: fileCreate.type,
                            fk_user_id: fileCreate.fk_user_id,
                            updatedAt: fileCreate.updatedAt,
                            createdAt: fileCreate.createdAt
                        })
                    })
                    .catch(function(err) {
                        console.log(err)
                        reject("Can not create file in historic");
                    });
                })
                .catch(function(err) {
                    console.log(err)
                    reject("Can not delete " + fileAlreadyCreate.name + " in the historic")
                })
            }
            else {
                File.create(file).then(function (fileCreate) {
                    resolve(fileCreate);
                })
                .catch(function(err) {
                    console.log(err)
                    reject("Can not create file in historic");
                });
            }
        })
        .catch(function(err) {
            console.log(err)
            reject("Can not find file in MYSQL historic on server");
        })
    })
}

var rename = function(req, res) {
    fs.access([global.rootPath, "data", req.user.id, req.body.newPath].createPath("/"), function(err) {

        //check if file exist
        if (!err) {
            req.body.msg = req.body.oldPath + " already exists";
            return res.status(202).send(JSON.stringify(req.body));
        }

        fs.rename([global.rootPath, "data", req.user.id, req.body.oldPath].createPath("/"), [global.rootPath, "data", req.user.id, req.body.newPath].createPath("/"), (err) => {
            if (err) {
                console.log(err)
                return res.status(404).send("Can not rename the file " + req.body.oldPath)
            }

            var oldFileInfo = path.parse(req.body.oldPath)
            var newFileInfo = path.parse(req.body.newPath)
            fs.rename([global.rootPath, "data", req.user.id, oldFileInfo.dir, ".diminutive", oldFileInfo.base].createPath("/"), [global.rootPath, "data", req.user.id, newFileInfo.dir, ".diminutive", newFileInfo.base].createPath("/"), (err) => {
                if (err) {
                    console.log(err)
                    return res.status(404).send("Can not rename miniature of file " + req.body.oldPath)
                }

                res.status(200).send(JSON.stringify({
                    oldPath: req.body.oldPath,
                    newPath: req.body.newPath
                }))
            })
        });
    })
}

module.exports = {
    '/': {
        post: {
            action: initializeForUpload,
            level: 'member'
        },
        get: {
            action: initializeForDownload,
            level: 'member'
        },
        delete: {
            action: deleteFile,
            level: 'member'
        }
    },
    '/reduce/:name': {
        get: {
            action: getImageReduce,
            level: 'member'
        }
    },

    '/upload': {
        post: {
            action: upload,
            level: 'member'
        }
    },

    '/download': {
        get: {
            action: download,
            level: 'member'
        }
    },

    '/rename': {
        put: {
            action: rename,
            level: 'member'
        }
    }
}
