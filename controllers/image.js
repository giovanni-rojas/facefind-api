const returnClarifaiRequestOptions = (imageUrl) => {

	const PAT = '03c4f8ee2959479d872414840f56bb94';
	const USER_ID = 'dd7dgnk1wn7b';       
	const APP_ID = 'test-face-detect';
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

const handleApiCall = (req, res) => {
	fetch(`https://api.clarifai.com/v2/models/face-detection/outputs`, returnClarifaiRequestOptions(req.body.input))
    .then((response) => response.json())
    .then((data) => {
      res.json(data.outputs[0].data.regions);
    })
    .catch((err) => res.status(400).json("Unable To Work With API"))
}

module.exports = {
	handleApiCall
}