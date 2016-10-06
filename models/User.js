var Seq = require('sequelize');

module.exports = {

	model: {
		email: {type : Seq.STRING},
		password: {type : Seq.STRING}
	},

	relations : {
		hasMany : [
						{
								model: 'File',
								options: {
										foreignKey: 'fk_user_id'
								}
						}
				]
	},

	options : {
	freezeTableName: true,
	instanceMethods: {
		validPassword : function(password) {
			return (this.password == password);
		}
	}
}
}
