const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./backend/routes/auth');
const progressRoutes = require('./backend/routes/progress');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Image search API proxy endpoint
app.get('/api/images/search', async (req, res) => {
  try {
    const query = req.query.query || 'nature';
    const perPage = req.query.per_page || 12;
    
    console.log('Searching for:', query); // Debug log
    
    // Use Unsplash API (free tier: 50 requests/hour)
    const UNSPLASH_ACCESS_KEY = 'XHnV6m2C2w3z-0y1bQ8eVJ4Qn1YZvN5BIAVJkPx8Tmc'; // Demo key
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&client_id=${UNSPLASH_ACCESS_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsplash API error:', response.status, errorText);
      throw new Error(`Image API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Unsplash response:', data.total, 'images found'); // Debug log
    
    // Check if images exist
    if (!data.results || data.results.length === 0) {
      return res.json({ success: true, images: [] });
    }
    
    // Transform Unsplash response to our format
    const images = data.results.map(photo => ({
      id: photo.id,
      thumb: photo.urls.small,
      full: photo.urls.full,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      alt: photo.alt_description || photo.description || query
    }));
    
    res.json({ success: true, images });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch images',
      error: error.message 
    });
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
  });
}

// Export for Vercel serverless
module.exports = app;
