function permissions(level) {
    return function (req, res, next) {
	if (level == 'public') return next();

	if (level == 'member') {
	    if (req.user) return next();
	    return res.status(403).json("User is not connected");
	}
    }
}

module.exports = permissions;
