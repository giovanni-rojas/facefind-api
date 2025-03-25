const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const image = require('./controllers/image');
const helmet = require('helmet');

// Create express app
const app = express();

// Calculate reasonable limits
const MAX_PAYLOAD_SIZE = '15mb';

// Rate limiting configuration
const limiter = rateLimit({
	windowMs: 30 * 60 * 1000,
	max: 25,
	message: {
		error: `Too many requests. Please try again later.`
	}
});

// CORS configuration
const corsOptions = {
	origin: [
		'http://localhost:3000',
		'https://face-find-d1246eeab4c8.herokuapp.com',
		'https://facefind-p69lcra66-gios-projects-f2f8301a.vercel.app'
	],
	methods: ['POST', 'GET', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Accept', 'Access-Control-Allow-Origin'],
	maxAge: 86400,
	credentials: true,
	optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: MAX_PAYLOAD_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_PAYLOAD_SIZE }));

// Basic health check
app.get('/', (req, res) => { 
	res.status(200).json({ status: 'success' }); 
});

// Image processing endpoint with validation
app.post('/imageurl', limiter, async (req, res) => {
	try {
		// Basic request validation
		if (!req.body || (!req.body.input && !req.body.file)) {
			return res.status(400).json({ 
				error: 'Please provide either an image URL or file' 
			});
		}

		const { input, file } = req.body;

		// URL validation
		if (input && !isValidImageUrl(input)) {
			return res.status(400).json({ 
				error: 'Please enter a valid image URL' 
			});
		}

		// Base64 validation
		if (file && !isValidBase64Image(file)) {
			return res.status(400).json({ 
				error: 'Please upload a valid image file' 
			});
		}

		// Size validation
		const contentLength = parseInt(req.headers['content-length'] || 0);
		if (contentLength > 15 * 1024 * 1024) {
			return res.status(413).json({ 
				error: 'Image too large. Please submit images 15MB or smaller.' 
			});
		}

		await image.handleApiCall(req, res);
	} catch (error) {
		console.error('Error processing image:', error);
		res.status(500).json({ 
			error: 'Internal server error', 
			message: error.message 
		});
	}
});

// Validation helper functions
const isValidImageUrl = (url) => {
	try {
		const parsedUrl = new URL(url);
		const validExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|tiff)(\?.*)?$/i;
		return validExtensions.test(parsedUrl.pathname);
	} catch {
		return false;
	}
};

const isValidBase64Image = (base64String) => {
	const base64Regex = /^data:image\/(jpeg|jpg|png|gif|bmp|webp|tiff);base64,/i;
	if (!base64Regex.test(base64String)) {
		return false;
	}
	try {
		const content = base64String.split(',')[1];
		return Buffer.from(content, 'base64').length > 0;
	} catch {
		return false;
	}
};

// For local development
if (process.env.NODE_ENV !== 'production') {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`app is running on port ${PORT}`);
	});
}

// Export for Vercel
module.exports = app;

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			// Only trust content from our own website
			defaultSrc: ["'self'"],
			
			// Allow images from:
			imgSrc: [
				"'self'",      // - our website
				"data:",       // - base64 encoded images
				"https:",      // - any HTTPS URL
				"blob:"        // - processed images in memory
			],
			
			// Allow API calls to:
			connectSrc: [
				"'self'",                      // - our website
				"https://api.clarifai.com"     // - Clarifai API
			],
			
			// Only allow our own scripts
			scriptSrc: ["'self'"],
			
			// Allow our CSS and inline styles
			styleSrc: ["'self'", "'unsafe-inline'"]
		},
	})
);