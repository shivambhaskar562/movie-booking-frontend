// Global variables
const API_BASE_URL = 'http://localhost:8080/api';
let currentUser = null;



document.addEventListener('DOMContentLoaded', function () {

    // Check authentication status first
    checkAuthStatus();

    // Load all movies on movies/all.html
    if (document.getElementById('moviesList')) {
        fetchAllMovies();
    }

    // Load movie details on movies/details.html
    if (document.getElementById('movieDetails')) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        if (movieId) {
            fetchMovieDetails(movieId);
            fetchShowsForMovie(movieId);
        }
    }

    // Setup filter dropdown
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterDropdown) {
        setupFilterDropdown();
    }
});

function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginRegisterContainer = document.querySelector(".loginRegister");
    
    if (!user) {
        // User is not logged in - show login/register buttons
        loginRegisterContainer.innerHTML = `
            <div class="d-flex">
                <a href="../auth/login.html" class="btn btn-outline-light me-2">Login</a>
                <a href="../auth/register.html" class="btn btn-primary">Register</a>
            </div>
        `;
    } else {
        // User is logged in - show user dropdown with logout option
        currentUser = user;
        loginRegisterContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                    ${user.username || user.data?.username}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="../bookings/history.html">My Bookings</a></li>
                    ${(user.roles || user.data?.roles)?.includes('ADMIN') ? 
                      '<li><a class="dropdown-item" href="../admin/movies/manage.html">Admin Panel</a></li>' : ''}
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

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

async function fetchAllMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movie/all`);
        const movies = await response.json();

        const moviesContainer = document.getElementById('moviesList');
        moviesContainer.innerHTML = '';

        movies.forEach(movie => {
            moviesContainer.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="https://plus.unsplash.com/premium_photo-1681422570054-9ae5b8b03e46?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dW5zcGxhc2glMjBhcHB8ZW58MHx8MHx8fDA%3D" class="card-img-top w-100" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text text-muted">${movie.genre} • ${movie.language}</p>
                            <p class="card-text">${movie.description.substring(0, 100)}...</p>
                            <a href="../movies/details.html?id=${movie.id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching all movies:', error);
    }
}

async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${API_BASE_URL}/movie/all`);
        const movies = await response.json();
        const movie = movies.find(m => m.id == movieId);

        if (movie) {
            const movieContainer = document.getElementById('movieDetails');
            movieContainer.innerHTML = `
                <div class="col-md-4">
                    <img src="https://plus.unsplash.com/premium_photo-1681422570054-9ae5b8b03e46?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dW5zcGxhc2glMjBhcHB8ZW58MHx8MHx8fDA%3D" class="card-img-top w-100 py-3" alt="${movie.title}">
                </div>
                <div class="col-md-8">
                    <h2>${movie.title}</h2>
                    <p class="text-muted">${movie.genre} • ${movie.language} • ${movie.duration}</p>
                    <p><strong>Release Date:</strong> ${movie.releaseDate}</p>
                    <h4 class="mt-4">Overview</h4>
                    <p>${movie.description}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

async function fetchShowsForMovie(movieId) {
    try {
        console.log(movieId)
        const response = await fetch(`${API_BASE_URL}/show/movie/${movieId}`);
        const shows = await response.json();
        console.log(response)

        const showsContainer = document.getElementById('movieShows');
        showsContainer.innerHTML = '';

        if (shows.length === 0) {
            showsContainer.innerHTML = '<div class="col-12"><p>No shows available for this movie.</p></div>';
            return;
        }

        shows.forEach(show => {
            const showTime = new Date(show.showTime).toLocaleString();
            showsContainer.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${show?.theater.theaterName}</h5>
                            <p class="card-text text-muted">${show?.theater.theaterLocation}</p>
                            <p class="card-text"><strong>Show Time:</strong> ${showTime}</p>
                            <p class="card-text"><strong>Price:</strong> $${show?.price}</p>
                            <a href="../bookings/new.html?showId=${show?.id}" class="btn btn-primary">Book Now</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching shows for movie:', error);
    }
}

function setupFilterDropdown() {
    const dropdownItems = document.querySelectorAll('[data-filter]');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const filterType = this.getAttribute('data-filter');
            applyFilter(filterType);
        });
    });
}

async function applyFilter(filterType) {
    try {
        let url = `${API_BASE_URL}/movie/all`;
        if (filterType === 'genre') {
            // In a real app, you would fetch available genres from the API
            const genre = prompt('Enter genre to filter by:');
            if (genre) {
                url = `${API_BASE_URL}/movie/genre/${genre}`;
            }
        } else if (filterType === 'language') {
            const language = prompt('Enter language to filter by:');
            if (language) {
                url = `${API_BASE_URL}/movie/language/${language}`;
            }
        }

        const response = await fetch(url);
        const movies = await response.json();

        const moviesContainer = document.getElementById('moviesList');
        moviesContainer.innerHTML = '';

        movies.forEach(movie => {
            moviesContainer.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                                                        <img src="../assets/images/movie_banner.png"
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text text-muted">${movie.genre} • ${movie.language}</p>
                            <p class="card-text">${movie.description.substring(0, 100)}...</p>
                            <a href="../movies/details.html?id=${movie.id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error applying filter:', error);
    }
}