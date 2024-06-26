// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Logging HTTP requests in development mode

// Handle undefined routes
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message,
  });
});

// No need to include email and password
// I have ignored code part for sending emails to recipients because chimoney does that automatically
// Chimoney Sends emails to recipients


// POST endpoint to handle payout requests
app.post('/payout', async (req, res, next) => {
  try {
    const { email, valueInUSD, currency } = req.body;

    // Validate request parameters
    if (!email || !valueInUSD || !currency) {
      const error = new Error('Missing required parameters');
      error.status = 400;
      throw error;
    }

    // Make payout request using Axios
    const response = await axios.post(`${process.env.API_BASE_URL}/v2/payouts`, {
      email,
      valueInUSD,
      currency,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      },
    });

    // Handle Chimoney API response
    if (response.status === 200) {
      res.status(200).json({
        status: 'success',
        message: 'Payout successfully processed',
        data: response.data,
      });
    } else {
      const error = new Error('Failed to process payout');
      error.status = response.status;
      throw error;
    }
  } catch (error) {
    next(error); // Pass error to the error handler middleware
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




