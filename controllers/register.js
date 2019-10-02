const handleRegister = (req, res, db, bcrypt, saltRounds) => {
	const { email, name, password } = req.body;
	
	//check for empty forms
	if(!email || !name || !password) {
		return res.status(400).json('incorrect for sumbitted');
	}

	//hash passwords
	const salt = bcrypt.genSaltSync(saltRounds);
	const hash = bcrypt.hashSync(password, salt);
	
	db.transaction(trx => {		//used when modifying multiple tables. If modifying one fails, they all fail
		trx.insert({			//insert user's login info to 'login' table
			email: email,
			hash: hash
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			.returning('*')		//returns all columns
			.insert({			//inserts into db, only columns we need
			email: loginEmail[0],
			name: name,
			joined: new Date()
			})
			.then(user => {
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})	

	 	//this would return actual user info. Not good!
		.catch(err => res.status(400).json('unable to return user'));
}

module.exports = {
	handleRegister: handleRegister
}