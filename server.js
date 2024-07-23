const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
//const saltRounds = 10;
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const PORT = process.env.PORT;

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
			name: 'Sally',
			email: 'sally@gmail.com',
			password: 'bananas',
			entries: 0,
			joined: new Date()
		}
	]
}

const db = knex(
	{
	  client: 'pg',
	  connection: 
		  {
			connectionString : 'process.env.DATABASE_URL',
			ssl: true
		  }
	}
);

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => { res.send("it's working!") })

app.post('/signin', (req, res) => { signin.handleSignin(db, bcrypt) });												//cleaner way of running this, but a bit confusing to grasp

// app.post('/signin', (req, res) => {
// 	if (req.body.email === database.users[0].email && 
// 		req.body.password === database.users[0].password) {
// 		res.json('success');
// 	}
// 	else {
// 		res.status(400).json('error logging in');
// 	}
// })

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });		//dependency injection important
// app.post('/register', (req, res) => {
// 	const { email, name, password } = req.body;
// 	database.users.push({
// 		id: '125',
// 		name: name,
// 		email: email,
// 		password: password,
// 		entries: 0,
// 		joined: new Date()
// 	})
// 	res.json(database.users[database.users.length - 1]);
// })

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) });
app.put('/image', (req, res) => { image.handleImage(req, res, db) });
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

app.listen(PORT || 3000, () => {
	console.log(`app is running on port ${PORT}`);
})