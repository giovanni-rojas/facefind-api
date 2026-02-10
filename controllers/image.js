const returnClarifaiRequestOptions = (imageData) => {

	const PAT = process.env.REACT_APP_PAT;
	const USER_ID = process.env.REACT_APP_USERNAME;       
	const APP_ID = process.env.REACT_APP_APP_ID;
	
	const IMAGE_SRC = imageData.base64 ? { base64: imageData.base64 } : { url: imageData.url };
  
	const raw = JSON.stringify({
	  "user_app_id": {
		  "user_id": USER_ID,
		  "app_id": APP_ID
	  },
	  "inputs": [
		  {
			  "data": {
				  "image": IMAGE_SRC
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
	const MODEL_ID = process.env.MODEL_ID;
	const MODEL_VERSION_ID = process.env.MODEL_VERSION_ID;

	const { input, file } = req.body;
	const imageData = file 
		? { base64: file.split(',')[1]} 
		: { url: input };
	
	fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, returnClarifaiRequestOptions(imageData))
    .then((response) => response.json())
    .then((data) => {
		if (data.status && data.status.code !== 10000) {
			console.error('Clarifai API error:', JSON.stringify(data.status));
			return res.status(400).json({ 
			  error: 'Clarifai API error', 
			  details: data.status.description || data.status.details || 'Unknown error',
			  code: data.status.code
			});
		}
		const regions = data.outputs?.[0]?.data?.regions;
		res.json(Array.isArray(regions) ? regions : []);
    })
    .catch((err) => {
		console.error('Clarifai request failed: ', err);
		res.status(500).json({
			error: 'Unable to reach Clarifai API',
			details: err.message
		});
	})
}

module.exports = {
	handleApiCall
}