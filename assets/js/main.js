// Global variables
const API_BASE_URL = 'http://localhost:8080/api';

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', function() {
    // Load now showing movies on homepage
    if (document.getElementById('nowShowingMovies')) {
        fetchNowShowingMovies();
    }
    
    // Load nearby theaters on homepage
    if (document.getElementById('nearbyTheaters')) {
        fetchNearbyTheaters();
    }
});

// Fetch now showing movies
async function fetchNowShowingMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movie/all`);
        const movies = await response.json();
        
        const moviesContainer = document.getElementById('nowShowingMovies');
        moviesContainer.innerHTML = '';
        
        // Display first 4 movies
        movies.slice(0, 4).forEach(movie => {
            moviesContainer.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img src="https://plus.unsplash.com/premium_photo-1681422570054-9ae5b8b03e46?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dW5zcGxhc2glMjBhcHB8ZW58MHx8MHx8fDA%3D" class="card-img-top w-100" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text text-muted">${movie.genre} • ${movie.language}</p>
                            <a href="../movies/details.html?id=${movie.id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Fetch nearby theaters
async function fetchNearbyTheaters() {
    try {
        const response = await fetch(`${API_BASE_URL}/theater`);
        const theaters = await response.json();
        
        const theatersContainer = document.getElementById('nearbyTheaters');
        theatersContainer.innerHTML = '';
        
        // Display first 4 theaters
        theaters.slice(0, 4).forEach(theater => {
            theatersContainer.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${theater.theaterName}</h5>
                            <p class="card-text text-muted">${theater.theaterLocation}</p>
                            <p class="card-text">Capacity: ${theater.theaterCapacity}</p>
                            <a href="../theaters/details.html?id=${theater.id}" class="btn btn-primary">View Shows</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching theaters:', error);
    }
}