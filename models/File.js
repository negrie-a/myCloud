var Seq = require('sequelize');
var fs = require('fs');
var path = require('path');

module.exports = {

	model: {
    id: {
      type: Seq.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fk_user_id: {
      type: Seq.INTEGER
      //allowNull: false // A remettre et envoyé le fk_user_id par request depuis le client ( bis )
    },
    name: {
      type: Seq.STRING,
      allowNull: false
    },
    size: {
      type: Seq.INTEGER,
      allowNull: false
    },
    status: {
      type: Seq.STRING,
      allowNull: false
    },
    pathDevice: {
      type: Seq.STRING,
      allowNull: false
    },
    pathServer: {
      type: Seq.STRING,
      allowNull: false
    }
	},

  relations : {
		belongsTo : [
            {
                model: 'User',
                options: {
                    foreignKey: 'fk_user_id'
                }
            }
        ]
	},

	options : {
	   freezeTableName: true,
     instanceMethods: {
       getActualSize: function (userId) {
         var self = this;
         var promise = new Promise( function(resolve, reject) {
           var pathFiles = [global.rootPath, "data", userId, self.pathServer, self.name].createPath("/"); // si le fichier y est pas ne pas renvoyé une erreur mais un message
           fs.stat(pathFiles, function (err, stats) {
             if (err != null) {
               console.log(err);
               var error = JSON.stringify(err);
               reject(error);
             }
             resolve(stats.size);
           })
         });
         return promise;
       }
     }
   }
}
