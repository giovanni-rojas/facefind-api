const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const knex = require('knex');

const db = knex(
	{
	  client: 'pg',
	  connection: 
		  {
		    host : '127.0.0.1',
		    user : 'postgres',
		    password : 'lolpwnt',
		    database : 'facefind'
		  }
	}
);

// db.select('*').from('users').then(data => {
// 	console.log(data);
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'john@gmail.com',
			password: 'cookies',
			entries: 0,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Billy',
			email: 'billy@gmail.com',
			password: 'apple',
			entries: 0,
			joined: new Date()
		}
	],
	login: [
		{
			id: '987',
			hash: '',
			email: 'john@gmail.com'
		}
	]
}

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	const { email, password } = req.body;
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
			else
				res.status(400).json('wrong credentials')
		})
		.catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	
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
})

app.get('/profile/:id', (req, res) => {
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
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then(entries => {
			res.status(200).json(entries[0]);
		})
		.catch(err => res.status(400).json('Could not get entries'))
})

// // Load hash from your password DB.
// bcrypt.compare(myPlaintextPassword, hash).then(function(res) {
//     // res == true
// });

// bcrypt.compare(someOtherPlaintextPassword, hash).then(function(res) {
//     // res == false
// });

app.listen(3001, () => {
	console.log('app is running on port 3001');
})

/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user (object)
/profile/:userID --> GET = user (object)
/image --> PUT --> user

*/