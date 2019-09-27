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
	bcrypt.compare("dope", '$2b$10$E7OLTpP.O2CalrU/6Jym3eFuOppgJBEocsFkBzYriXzMc60Nx4icW')
		.then(function(res) {
			console.log('first guess: ', res)
		});

	bcrypt.compare("veggies", '$2b$10$E7OLTpP.O2CalrU/6Jym3eFuOppgJBEocsFkBzYriXzMc60Nx4icW')
		.then(function(res) {
			console.log('second guess: ', res)
		});
	if (req.body.email === database.users[0].email &&
		req.body.password === database.users[0].password) 
		res.json(database.users[0]);
	else
		res.status(400).json('error logging in');
})

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	db('users')
		.returning('*')		//returns all columns
		.insert({			//inserts into db, only columns we need
		email: email,
		name: name,
		joined: new Date()
		})
		.then(user => {
			res.json(user[0]);
		})
		//.catch(err => res.status(400).json(err)); 	//this would return actual user info. Not good!
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