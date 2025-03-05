const dotenv = require('dotenv');
const path = require('path');

// Load the `.env` file from the correct location
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Adjust this path as needed
