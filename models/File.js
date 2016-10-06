var Seq = require('sequelize');

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
}
}
