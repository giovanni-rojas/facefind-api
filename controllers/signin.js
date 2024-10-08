const handleSignin = (req, res, db, bcrypt) => {
	const { email, password } = req.body;

	//check for empty forms
	if(!email || !password) {
		return res.status(400).json('incorrect form sumbitted');
	}

	db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			const isValid = bcrypt.compareSync(password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', email)
					.then(user => {
						res.json(user[0]);
					})
					.catch(err => res.status(400).json('unable to get user'))
			}
			else {
				res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials fr'))
}

module.exports = {
	handleSignin
}