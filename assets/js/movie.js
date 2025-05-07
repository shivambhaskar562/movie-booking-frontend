// Global variables
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function () {
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
                        <img src="../../assets/images/movies/${movie.id}.jpg" class="card-img-top" alt="${movie.title}">
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