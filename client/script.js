// ============================
// DOM Elements
// ============================
const jokeText = document.getElementById('joke-text');
const spinner = document.getElementById('spinner');
const newJokeBtn = document.getElementById('new-joke-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const aiJokeBtn = document.getElementById('ai-joke-btn');
const toggleFavoritesBtn = document.getElementById('toggle-favorites-btn');
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');
const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
const favoritesCount = document.getElementById('favorites-count');

// ============================
// State Management
// ============================
let currentJoke = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let isLoading = false;

// ============================
// Initialization
// ============================
document.addEventListener('DOMContentLoaded', () => {
  updateFavoritesCount();
  renderFavorites();
  fetchJoke(); // Load initial joke
});

// ============================
// Event Listeners
// ============================
newJokeBtn.addEventListener('click', fetchJoke);
favoriteBtn.addEventListener('click', addToFavorites);
aiJokeBtn.addEventListener('click', fetchAIJoke);
toggleFavoritesBtn.addEventListener('click', toggleFavorites);
clearFavoritesBtn.addEventListener('click', clearAllFavorites);

// ============================
// Fetch Random Joke
// ============================
async function fetchJoke() {
  if (isLoading) return;
  
  setLoadingState(true);
  hideJoke();

  try {
    const response = await fetch('/api/jokes/random');
    
    if (!response.ok) {
      throw new Error('Failed to fetch joke');
    }

    const data = await response.json();
    
    if (data.success) {
      currentJoke = data.data;
      displayJoke(currentJoke);
      favoriteBtn.disabled = false;
    } else {
      throw new Error(data.error || 'Failed to fetch joke');
    }
  } catch (error) {
    console.error('Error fetching joke:', error);
    displayError('Oops! Unable to fetch a joke. Please try again.');
    favoriteBtn.disabled = true;
  } finally {
    setLoadingState(false);
  }
}

// ============================
// Fetch AI-Generated Joke
// ============================
async function fetchAIJoke() {
  if (isLoading) return;
  
  setLoadingState(true);
  hideJoke();
  aiJokeBtn.disabled = true;

  try {
    const response = await fetch('/api/jokes/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      currentJoke = data.data;
      displayJoke(currentJoke);
      favoriteBtn.disabled = false;
    } else {
      if (response.status === 503) {
        displayError('🤖 AI joke generation is not configured. Add your OpenAI API key to .env file.');
      } else {
        throw new Error(data.error || 'Failed to generate AI joke');
      }
      favoriteBtn.disabled = true;
    }
  } catch (error) {
    console.error('Error generating AI joke:', error);
    displayError('Unable to generate AI joke. Please try again.');
    favoriteBtn.disabled = true;
  } finally {
    setLoadingState(false);
    aiJokeBtn.disabled = false;
  }
}

// ============================
// Display Functions
// ============================
function displayJoke(joke) {
  let jokeContent = '';
  
  if (joke.type === 'twopart') {
    jokeContent = `${joke.setup} <br><br> <strong>${joke.delivery}</strong>`;
  } else {
    jokeContent = joke.joke;
  }
  
  jokeText.innerHTML = jokeContent;
  
  // Fade in effect
  setTimeout(() => {
    jokeText.classList.add('visible');
  }, 100);
}

function displayError(message) {
  jokeText.textContent = message;
  jokeText.classList.add('visible');
  currentJoke = null;
}

function hideJoke() {
  jokeText.classList.remove('visible');
}

// ============================
// Loading State
// ============================
function setLoadingState(loading) {
  isLoading = loading;
  
  if (loading) {
    spinner.classList.remove('hidden');
    newJokeBtn.disabled = true;
    aiJokeBtn.disabled = true;
  } else {
    spinner.classList.add('hidden');
    newJokeBtn.disabled = false;
    aiJokeBtn.disabled = false;
  }
}

// ============================
// Favorites Management
// ============================
function addToFavorites() {
  if (!currentJoke) return;
  
  // Create a unique identifier for the joke
  const jokeId = currentJoke.joke || `${currentJoke.setup}-${currentJoke.delivery}`;
  
  // Check if already in favorites
  const alreadyExists = favorites.some(fav => {
    const favId = fav.joke || `${fav.setup}-${fav.delivery}`;
    return favId === jokeId;
  });
  
  if (alreadyExists) {
    showToast('⭐ Already in favorites!');
    return;
  }
  
  // Add to favorites
  favorites.unshift(currentJoke);
  saveFavorites();
  updateFavoritesCount();
  renderFavorites();
  showToast('⭐ Added to favorites!');
}

function removeFromFavorites(index) {
  favorites.splice(index, 1);
  saveFavorites();
  updateFavoritesCount();
  renderFavorites();
  showToast('🗑️ Removed from favorites');
}

function clearAllFavorites() {
  if (favorites.length === 0) return;
  
  if (confirm('Are you sure you want to clear all favorites?')) {
    favorites = [];
    saveFavorites();
    updateFavoritesCount();
    renderFavorites();
    showToast('🗑️ All favorites cleared');
  }
}

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateFavoritesCount() {
  favoritesCount.textContent = favorites.length;
}

// ============================
// Render Favorites
// ============================
function renderFavorites() {
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p class="empty-message">No favorites yet! Start adding jokes you love.</p>';
    return;
  }
  
  favoritesList.innerHTML = favorites.map((joke, index) => {
    let jokeContent = '';
    
    if (joke.type === 'twopart') {
      jokeContent = `${joke.setup} — ${joke.delivery}`;
    } else {
      jokeContent = joke.joke;
    }
    
    return `
      <div class="favorite-item">
        <div class="favorite-text">${jokeContent}</div>
        <button class="remove-btn" onclick="removeFromFavorites(${index})">Remove</button>
      </div>
    `;
  }).join('');
}

// ============================
// Toggle Favorites Section
// ============================
function toggleFavorites() {
  const isHidden = favoritesSection.classList.contains('hidden');
  
  if (isHidden) {
    favoritesSection.classList.remove('hidden');
    toggleFavoritesBtn.textContent = `Hide Favorites (${favorites.length})`;
  } else {
    favoritesSection.classList.add('hidden');
    toggleFavoritesBtn.innerHTML = `View Favorites (<span id="favorites-count">${favorites.length}</span>)`;
  }
}

// ============================
// Toast Notification
// ============================
function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #15161a;
    color: #fab22e;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideUp 0.3s ease;
    font-weight: 600;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => {
      document.body.removeChild(toast);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
}

// ============================
// Make function globally accessible
// ============================
window.removeFromFavorites = removeFromFavorites;
