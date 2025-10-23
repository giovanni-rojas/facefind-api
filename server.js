const express = require('express');
//const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const image = require('./controllers/image');

const PORT = process.env.PORT

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => { res.send('success') })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

app.listen(PORT || 3000, () => {
	console.log(`app is running on port ${PORT}`);
})