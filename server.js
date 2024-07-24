const express = require('express');
//const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// const db = knex({
// 	client: 'pg',
// 	connection: {
// 		host : '127.0.0.1',
// 		user : 'postgres',
// 		password : 'test73$7',
// 		database : 'postgres'
// 	}
// });

const db = knex({
	client: 'pg',
	connection: {
		connectionString : 'process.env.DATABASE_URL',
		ssl: true
	}
});


const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => { res.send('success') })
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) });												//cleaner way of running this, but a bit confusing to grasp
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });		//dependency injection important
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) });
app.put('/image', (req, res) => { image.handleImage(req, res, db) });
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

app.listen(PORT || 3000, () => {
	console.log(`app is running on port ${PORT}`);
})