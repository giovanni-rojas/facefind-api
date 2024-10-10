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
	const { input, file } = req.body;
	const imageData = file 
		? { base64: file.split(',')[1]} 
		: { url: input };
	
	fetch(`https://api.clarifai.com/v2/models/face-detection/outputs`, returnClarifaiRequestOptions(imageData))
    .then((response) => response.json())
    .then((data) => {
      res.json(data.outputs[0].data.regions);
    })
    .catch((err) => res.status(400).json("Unable To Work With API"))
}

module.exports = {
	handleApiCall
}