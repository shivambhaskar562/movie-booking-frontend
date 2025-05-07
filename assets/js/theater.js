// Global variables
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function() {
    // Load all theaters on theaters/all.html
    if (document.getElementById('theatersList')) {
        fetchAllTheaters();
        fetchLocationsForFilter();
    }
    
    // Load theater details on theaters/details.html
    if (document.getElementById('theaterDetails')) {
        const urlParams = new URLSearchParams(window.location.search);
        const theaterId = urlParams.get('id');
        if (theaterId) {
            fetchTheaterDetails(theaterId);
            fetchShowsForTheater(theaterId);
        }
    }
    
    // Setup location filter
    const locationItems = document.querySelectorAll('[data-location]');
    locationItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const location = this.getAttribute('data-location');
            filterTheatersByLocation(location);
        });
    });
});

async function fetchAllTheaters() {
    try {
        const response = await fetch(`${API_BASE_URL}/theater`);
        const theaters = await response.json();
        
        const theatersContainer = document.getElementById('theatersList');
        theatersContainer.innerHTML = '';
        
        theaters.forEach(theater => {
            theatersContainer.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${theater.theaterName}</h5>
                            <p class="card-text text-muted">${theater.theaterLocation}</p>
                            <p class="card-text"><strong>Screen Type:</strong> ${theater.theaterScreenType}</p>
                            <p class="card-text"><strong>Capacity:</strong> ${theater.theaterCapacity}</p>
                            <a href="../theaters/details.html?id=${theater.id}" class="btn btn-primary">View Shows</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching all theaters:', error);
    }
}

async function fetchTheaterDetails(theaterId) {
    try {
        const response = await fetch(`${API_BASE_URL}/theater`);
        const theaters = await response.json();
        const theater = theaters.find(t => t.id == theaterId);
        
        if (theater) {
            const theaterContainer = document.getElementById('theaterDetails');
            theaterContainer.innerHTML = `
                <div class="col-md-12">
                    <h2>${theater.theaterName}</h2>
                    <p class="text-muted"><i class="bi bi-geo-alt"></i> ${theater.theaterLocation}</p>
                    <p><strong>Screen Type:</strong> ${theater.theaterScreenType}</p>
                    <p><strong>Capacity:</strong> ${theater.theaterCapacity}</p>
                    <hr>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching theater details:', error);
    }
}

async function fetchShowsForTheater(theaterId) {
    try {
        const response = await fetch(`${API_BASE_URL}/show/theater/${theaterId}`);
     
        const shows = await response.json();
      
        const showsContainer = document.getElementById('theaterShows');
        showsContainer.innerHTML = '';
        
        if (shows.length === 0) {
            showsContainer.innerHTML = '<div class="col-12"><p>No shows available at this theater.</p></div>';
            return;
        }
        
        shows.forEach(show => {
            const showTime = new Date(show.showTime).toLocaleString();
            showsContainer.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="https://plus.unsplash.com/premium_photo-1681422570054-9ae5b8b03e46?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dW5zcGxhc2glMjBhcHB8ZW58MHx8MHx8fDA%3D" class="card-img-top w-100" alt="Movie Poster">
                        <div class="card-body">
                            <h5 class="card-title">${show.movie.title}</h5>
                            <p class="card-text text-muted">${show.movie.genre} • ${show.movie.language}</p>
                            <p class="card-text"><strong>Show Time:</strong> ${showTime}</p>
                            <p class="card-text"><strong>Price:</strong> $${show.price}</p>
                            <a href="../../bookings/new.html?showId=${show.id}" class="btn btn-primary">Book Now</a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching shows for theater:', error);
    }
}

async function fetchLocationsForFilter() {
    try {
        const response = await fetch(`${API_BASE_URL}/theater`);
        const theaters = await response.json();
        
        // Get unique locations
        const locations = [...new Set(theaters.map(t => t.theaterLocation))];
        
        const locationDropdown = document.getElementById('locationDropdown');
        locations.forEach(location => {
            const item = document.createElement('li');
            item.innerHTML = `<a class="dropdown-item" href="#" data-location="${location}">${location}</a>`;
            locationDropdown.appendChild(item);
            
            // Add event listener to the new item
            item.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                filterTheatersByLocation(location);
            });
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
    }
}

async function filterTheatersByLocation(location) {
    try {
        let url = `${API_BASE_URL}/theater`;
        if (location !== 'all') {
            url = `${API_BASE_URL}/theater/${location}`;
        }
        
        const response = await fetch(url);
        const theaters = await response.json();
        
        const theatersContainer = document.getElementById('theatersList');
        theatersContainer.innerHTML = '';
        
        theaters.forEach(theater => {
            theatersContainer.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${theater.theaterName}</h5>
                            <p class="card-text text-muted">${theater.theaterLocation}</p>
                            <p class="card-text"><strong>Screen Type:</strong> ${theater.theaterScreenType}</p>
                            <p class="card-text"><strong>Capacity:</strong> ${theater.theaterCapacity}</p>
                            <a href="../theaters/details.html?id=${theater.id}" class="btn btn-primary">View Shows</a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Update filter button text
        document.getElementById('locationFilter').textContent = 
            location === 'all' ? 'Filter By Location' : `Location: ${location}`;
    } catch (error) {
        console.error('Error filtering theaters by location:', error);
    }
}