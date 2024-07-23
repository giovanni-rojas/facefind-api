const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: 'ef9369da179846819e35a10febe67441'
});

const handleApiCall = (req, res) => {
	app.models.predict('face-detection', req.body.input)      //wouldn't work with this.state.imageUrl (idk why)
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
			res.json(entries[0].entries);
		})
		.catch(err => res.status(400).json('Could not get entries'))
}

module.exports = {
	handleImage,
	handleApiCall
}