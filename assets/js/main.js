// Global configuration
const API_BASE_URL = 'http://localhost:8080/api';
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Homepage specific functions
    if (document.getElementById('nowShowingMovies')) {
        fetchNowShowingMovies();
    }
    
    if (document.getElementById('nearbyTheaters')) {
        fetchNearbyTheaters();
    }
});

// Check authentication status and update UI
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginRegisterContainer = document.querySelector(".loginRegister");
    
    if (!user) {
        // User is not logged in - show login/register buttons
        loginRegisterContainer.innerHTML = `
            <div class="d-flex">
                <a href="./auth/login.html" class="btn btn-outline-light me-2">Login</a>
                <a href="./auth/register.html" class="btn btn-primary">Register</a>
            </div>
        `;
    } else {
        // User is logged in - show user dropdown with logout option
        currentUser = user;
        loginRegisterContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                    ${user?.data?.username}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="./bookings/history.html">My Bookings</a></li>
                    ${user?.data?.roles && user?.data?.roles.includes('ADMIN') ? 
                      '<li><a class="dropdown-item" href="./admin/movies/manage.html">Admin Panel</a></li>' : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
                </ul>
            </div>
        `;
        
        // Add logout event listener
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Fetch movies for homepage
async function fetchNowShowingMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movie/all`);
        const movies = await response.json();
        
        const container = document.getElementById('nowShowingMovies');
        container.innerHTML = '';
        
        movies.slice(0, 4).forEach(movie => {
            container.innerHTML += createMovieCard(movie);
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Fetch theaters for homepage
async function fetchNearbyTheaters() {
    try {
        const response = await fetch(`${API_BASE_URL}/theater`);
        const theaters = await response.json();
        
        const container = document.getElementById('nearbyTheaters');
        container.innerHTML = '';
        
        theaters.slice(0, 4).forEach(theater => {
            container.innerHTML += createTheaterCard(theater);
        });
    } catch (error) {
        console.error('Error fetching theaters:', error);
    }
}

// Helper function to create movie card HTML
function createMovieCard(movie) {
    return `
        <div class="col-md-3 mb-4">
            <div class="card h-100">
                <img src="../assets/images/movie_banner.png"
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <p class="card-text text-muted">${movie.genre} • ${movie.language}</p>
                    <a href="./movies/details.html?id=${movie.id}" class="btn btn-primary">View Details</a>
                </div>
            </div>
        </div>
    `;
}

// Helper function to create theater card HTML
function createTheaterCard(theater) {
    return `
        <div class="col-md-3 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${theater.theaterName}</h5>
                    <p class="card-text text-muted">${theater.theaterLocation}</p>
                    <p class="card-text">Capacity: ${theater.theaterCapacity}</p>
                    <a href="./theaters/details.html?id=${theater.id}" class="btn btn-primary">View Shows</a>
                </div>
            </div>
        </div>
    `;
}