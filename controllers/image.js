const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: 'dde007178c284b6c8f6780b5d11e456c'
});

const handleApiCall = (req, res) => {
	app.models
		.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)      //wouldn't work with this.state.imageUrl (idk why)
		.then(data => {
			res.json(data);
		})
		.catch(err => res.status(400).json('unable to work with API'))
}

const handleImage = (req, res, db) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then(entries => {
			res.status(200).json(entries[0]);
		})
		.catch(err => res.status(400).json('Could not get entries'))
}

module.exports = {
	handleImage: handleImage,
	handleApiCall: handleApiCall
}