// Global variables
const API_BASE_URL = 'http://localhost:8080/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {

    // Check authentication status first
    checkAuthStatus();

    // Load booking page
    if (document.getElementById('showDetails')) {
        const urlParams = new URLSearchParams(window.location.search);
        const showId = urlParams.get('showId');
        if (showId) {
            loadShowDetails(showId);
            setupSeatSelection();
            setupBookingButton();
        }
    }
});


// Check authentication status and update UI
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authButtonsContainer = document.getElementById('authButtons');
    
    if (!user) {
        // User is not logged in - show login/register buttons
        authButtonsContainer.innerHTML = `
            <div class="d-flex">
                <a href="../auth/login.html" class="btn btn-outline-light me-2">Login</a>
                <a href="../auth/register.html" class="btn btn-primary">Register</a>
            </div>
        `;
    } else {
        // User is logged in - show user dropdown with logout option
        currentUser = user;
        authButtonsContainer.innerHTML = `
    <div class="dropdown" style="z-index: 1100;">
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


async function loadShowDetails(showId) {
    try {
        const response = await fetch(`${API_BASE_URL}/show`);
        const shows = await response.json();
        const show = shows.find(s => s.id == showId);

        if (show) {
            const showTime = new Date(show.showTime).toLocaleString();

            // Store show data for later use
            window.currentShow = show;

            // Update show details
            document.getElementById('showDetails').innerHTML = `
                <h4>${show.movie.title}</h4>
                <p class="text-muted">${show.theater.theaterName} • ${show.theater.theaterLocation}</p>
                <p><strong>Show Time:</strong> ${showTime}</p>
                <p><strong>Screen Type:</strong> ${show.theater.theaterScreenType}</p>
                <p><strong>Price per ticket:</strong> $${show.price}</p>
            `;

            // Update booking summary
            document.getElementById('bookingSummary').innerHTML = `
                <p><strong>Movie:</strong> ${show.movie.title}</p>
                <p><strong>Theater:</strong> ${show.theater.theaterName}</p>
                <p><strong>Show Time:</strong> ${showTime}</p>
                <hr>
                <p><strong>Seats:</strong> <span id="summarySeats">0</span></p>
                <p><strong>Total Price:</strong> $<span id="summaryPrice">0.00</span></p>
            `;

            // Generate theater layout
            generateTheaterLayout(show.theater.theaterCapacity);
        }
    } catch (error) {
        console.error('Error loading show details:', error);
        showAlert('Error loading show details. Please try again.', 'danger');
    }
}

function generateTheaterLayout(capacity) {
    const layoutContainer = document.getElementById('theaterLayout');
    layoutContainer.innerHTML = '';

    // Simple theater layout - 10 seats per row
    const rows = Math.ceil(capacity / 10);
    
    // Add screen representation
    layoutContainer.innerHTML = `
        <div class="row justify-content-center mb-4">
            <div class="col-md-8 text-center bg-dark text-white py-2 rounded">
                <strong>SCREEN</strong>
            </div>
        </div>
    `;

    for (let row = 1; row <= rows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row mb-2';
        rowDiv.innerHTML = `<div class="col-12"><strong>Row ${String.fromCharCode(64 + row)}</strong></div>`;

        const seatsDiv = document.createElement('div');
        seatsDiv.className = 'row seat-row';

        const seatsInRow = row === rows ? capacity % 10 || 10 : 10;
        
        for (let seat = 1; seat <= seatsInRow; seat++) {
            const seatNumber = `${String.fromCharCode(64 + row)}-${seat}`;
            seatsDiv.innerHTML += `
                <div class="col-1 mb-2">
                    <button class="btn btn-sm btn-outline-secondary seat-btn" 
                            data-seat="${seatNumber}" 
                            onclick="toggleSeatSelection('${seatNumber}')">
                        ${seat}
                    </button>
                </div>
            `;
        }

        rowDiv.appendChild(seatsDiv);
        layoutContainer.appendChild(rowDiv);
    }
}

function toggleSeatSelection(seatNumber) {
    const seatBtn = document.querySelector(`.seat-btn[data-seat="${seatNumber}"]`);
    seatBtn.classList.toggle('btn-outline-secondary');
    seatBtn.classList.toggle('btn-primary');

    updateSelectedSeats();
}

function updateSelectedSeats() {
    const selectedSeats = document.querySelectorAll('.seat-btn.btn-primary');
    const selectedSeatsList = document.getElementById('selectedSeatsList');
    const selectedSeatsCount = document.getElementById('selectedSeatsCount');
    const summarySeats = document.getElementById('summarySeats');
    const summaryPrice = document.getElementById('summaryPrice');

    selectedSeatsList.innerHTML = '';
    selectedSeatsCount.textContent = selectedSeats.length;
    summarySeats.textContent = selectedSeats.length;

    let seats = [];
    selectedSeats.forEach(seat => {
        seats.push(seat.getAttribute('data-seat'));
        selectedSeatsList.innerHTML += `<span class="badge bg-primary me-1 mb-1">${seat.getAttribute('data-seat')}</span>`;
    });

    // Calculate total price
    const pricePerSeat = parseFloat(document.querySelector('#showDetails p:last-child').textContent.replace('Price per ticket: $', ''));
    const totalPrice = (selectedSeats.length * pricePerSeat).toFixed(2);
    summaryPrice.textContent = totalPrice;
}

function setupSeatSelection() {
    // Already handled by the toggleSeatSelection function called from onclick
}

function setupBookingButton() {
    const confirmBtn = document.getElementById('confirmBooking');
    confirmBtn.addEventListener('click', async function () {
        const selectedSeats = document.querySelectorAll('.seat-btn.btn-primary');
        if (selectedSeats.length === 0) {
            showAlert('Please select at least one seat', 'warning');
            return;
        }

        // Get selected seat numbers
        const seatNumbers = Array.from(selectedSeats).map(seat => seat.getAttribute('data-seat'));
        
        // Get current user
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            showAlert('Please login to continue with booking', 'danger');
            window.location.href = '../auth/login.html';
            return;
        }

        // Show confirmation modal
        const bookingModal = new bootstrap.Modal(document.getElementById('confirmBookingModal'));
        bookingModal.show();

        // Update modal content
        const pricePerSeat = parseFloat(document.querySelector('#showDetails p:last-child').textContent.replace('Price per ticket: $', ''));
        const totalPrice = (selectedSeats.length * pricePerSeat).toFixed(2);
        
        document.getElementById('modalSeatCount').textContent = selectedSeats.length;
        document.getElementById('modalMovieTitle').textContent = window.currentShow.movie.title;
        document.getElementById('modalTotalPrice').textContent = totalPrice;

        // Setup modal confirm button
        document.getElementById('finalConfirmBtn').addEventListener('click', async function() {
            try {
                // Create booking DTO
                const bookingDTO = {
                    noOfSeats: selectedSeats.length,
                    seatNumbers: seatNumbers,
                    userId: user?.data?.id,
                    showId: window.currentShow.id
                };

                // Step 1: Create booking with PENDING status
                const createResponse = await fetch(`${API_BASE_URL}/booking`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(bookingDTO)
                });

                if (!createResponse.ok) {
                    const error = await createResponse.json();
                    throw new Error(error.message || 'Booking creation failed');
                }

                const booking = await createResponse.json();
                
                // Show payment/confirmation modal
                bookingModal.hide();
                const paymentModal = new bootstrap.Modal(document.getElementById('paymentConfirmationModal'));
                
                // Set booking ID for final confirmation
                document.getElementById('paymentConfirmBtn').dataset.bookingId = booking.id;
                paymentModal.show();
                
            } catch (error) {
                console.error('Booking error:', error);
                showAlert(`Booking failed: ${error.message}`, 'danger');
                bookingModal.hide();
            }
        });
    });
    
    // Setup payment confirmation button
    document.getElementById('paymentConfirmBtn').addEventListener('click', async function() {
        const bookingId = this.dataset.bookingId;
        const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentConfirmationModal'));
        
        try {
            // Step 2: Confirm the booking
            const confirmResponse = await fetch(`${API_BASE_URL}/booking/${bookingId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!confirmResponse.ok) {
                const error = await confirmResponse.json();
                throw new Error(error.message || 'Booking confirmation failed');
            }

            const confirmedBooking = await confirmResponse.json();
            
            // Store booking ID for confirmation page
            localStorage.setItem('lastBooking', JSON.stringify(confirmedBooking));
            
            // Redirect to confirmation page
            paymentModal.hide();
            window.location.href = '../bookings/confirmation.html';
            
        } catch (error) {
            console.error('Confirmation error:', error);
            showAlert(`Confirmation failed: ${error.message}`, 'danger');
            paymentModal.hide();
        }
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('main .container') || document.body;
    container.prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        alertDiv.classList.add('hide');
    }, 5000);
}