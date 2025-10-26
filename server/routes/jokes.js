const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load jokes from JSON file
const jokesPath = path.join(__dirname, '../data/jokes.json');
let jokes = [];

try {
  const jokesData = fs.readFileSync(jokesPath, 'utf-8');
  jokes = JSON.parse(jokesData);
} catch (error) {
  console.error('Error loading jokes:', error.message);
}

/**
 * GET /api/jokes/random
 * Returns a random joke from the local collection
 */
router.get('/random', async (req, res) => {
  try {
    // If we have local jokes, use them
    if (jokes.length > 0) {
      const randomIndex = Math.floor(Math.random() * jokes.length);
      return res.json({
        success: true,
        source: 'local',
        data: jokes[randomIndex]
      });
    }

    // Fallback to external API if local jokes are empty
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode');
    
    if (!response.ok) {
      throw new Error('External API failed');
    }

    const data = await response.json();
    
    // Transform external API response to our format
    const jokeData = {
      type: data.type === 'single' ? 'single' : 'twopart',
      category: data.category || 'general'
    };

    if (data.type === 'single') {
      jokeData.joke = data.joke;
    } else {
      jokeData.setup = data.setup;
      jokeData.delivery = data.delivery;
    }

    return res.json({
      success: true,
      source: 'external',
      data: jokeData
    });

  } catch (error) {
    console.error('Error fetching joke:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to fetch joke. Please try again later.'
    });
  }
});

/**
 * GET /api/jokes/all
 * Returns all available jokes
 */
router.get('/all', (req, res) => {
  try {
    res.json({
      success: true,
      count: jokes.length,
      data: jokes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve jokes'
    });
  }
});

/**
 * POST /api/jokes/ai
 * Generate a joke using OpenAI (optional feature)
 */
router.post('/ai', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI joke generation is not configured'
      });
    }

    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a comedian. Generate a short, clean, and funny joke. Return only the joke text, nothing else.'
          },
          {
            role: 'user',
            content: 'Tell me a funny joke.'
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const joke = data.choices[0]?.message?.content?.trim();

    if (!joke) {
      throw new Error('No joke generated');
    }

    return res.json({
      success: true,
      source: 'ai',
      data: {
        type: 'single',
        joke: joke,
        category: 'ai-generated'
      }
    });

  } catch (error) {
    console.error('Error generating AI joke:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to generate AI joke'
    });
  }
});

module.exports = router;
