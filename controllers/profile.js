const handleProfileGet = (req, res, db) => {
	const { id } = req.params;
	db.select('*').from('users').where({id})
		.then(user => {
			if (user.length)
				res.status(200).json(user[0]);
			else
				throw new Error('Could not load user');
		})
		.catch(err => 
			res.status(404).json(err.message));
}

module.exports = {
	handleProfileGet: handleProfileGet
}