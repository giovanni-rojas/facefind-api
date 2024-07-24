const returnClarifaiRequestOptions = (imageUrl) => {

	const PAT = '03c4f8ee2959479d872414840f56bb94';
	const USER_ID = 'dd7dgnk1wn7b';       
	const APP_ID = 'test-face-detectt';
	const IMAGE_URL = imageUrl;
  
	const raw = JSON.stringify({
	  "user_app_id": {
		  "user_id": USER_ID,
		  "app_id": APP_ID
	  },
	  "inputs": [
		  {
			  "data": {
				  "image": {
					  "url": IMAGE_URL
				  }
			  }
		  }
	  ]
	});
  
	const requestOptions = {
	  method: 'POST',
	  headers: {
		  'Accept': 'application/json',
		  'Authorization': 'Key ' + PAT
	  },
	  body: raw
	};
  
	return requestOptions;
  
}

const handleApiCall = (req, res, fetch) => {
	fetch("http://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(req.body.input))
    .then((response) => response.json())
    .then((data) => {
      res.json(data.outputs[0].data.regions);
    })
    .catch((err) => res.status(400).json("Unable To Work With API"))
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