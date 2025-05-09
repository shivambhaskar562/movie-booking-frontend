


document.addEventListener('DOMContentLoaded', function () {
    // Check authentication status first
    checkAuthStatus();

    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '../../auth/login.html';
        return;
    }

    // Load bookings
    const userId = user?.data?.id;
    loadUserBookings(userId);
    console.log(userId)

    // Setup filter button
    document.getElementById('applyFilters').addEventListener('click', function () {
        loadUserBookings(user?.data?.id);
    });

    // Setup cancel booking modal
    const cancelModal = new bootstrap.Modal(document.getElementById('cancelBookingModal'));
    let currentBookingToCancel = null;

    // When cancel button is clicked in any booking card
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('cancel-booking-btn')) {
            const bookingId = e.target.getAttribute('data-booking-id');
            const bookingCard = e.target.closest('.booking-card');
            currentBookingToCancel = {
                id: bookingId,
                movie: bookingCard.querySelector('.movie-title').textContent,
                time: bookingCard.querySelector('.show-time').textContent
            };

            // Set modal content
            document.getElementById('modalBookingId').textContent = `MB-${bookingId.padStart(6, '0')}`;
            document.getElementById('modalBookingMovie').textContent = currentBookingToCancel.movie;
            document.getElementById('modalBookingTime').textContent = currentBookingToCancel.time;

            // Show modal
            cancelModal.show();
        }
    });

    // Confirm cancellation
    document.getElementById('confirmCancelBtn').addEventListener('click', async function () {
        if (!currentBookingToCancel) return;

        try {
            const response = await fetch(`${API_BASE_URL}/booking/${currentBookingToCancel.id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                showAlert('Booking cancelled successfully!', 'success');
                loadUserBookings(user.id);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel booking');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            showAlert(`Failed to cancel booking: ${error.message}`, 'danger');
        } finally {
            cancelModal.hide();
            currentBookingToCancel = null;
        }
    });
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

async function loadUserBookings(userId) {
    try {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        // Build query parameters
        let url = `${API_BASE_URL}/booking/user/${userId}`;
        const params = [];
        if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
        if (dateFilter !== 'all') params.push(`dateFilter=${dateFilter}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookingsContainer').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Failed to load bookings. Please try again later.</div>
            </div>
        `;
    }
}

function displayBookings(bookings) {
    const container = document.getElementById('bookingsContainer');

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">No bookings found matching your criteria.</div>
            </div>
        `;
        return;
    }


    container.innerHTML = bookings.map(booking => {
        const showTime = new Date(booking.show.showTime);
        const bookingTime = new Date(booking.bookingTime);
        const isUpcoming = new Date() < showTime;
        const statusClass = booking.bookingStatus === 'CONFIRMED' ? 'confirmed' :
            booking.bookingStatus === 'PENDING' ? 'pending' : 'cancelled';

        return `
            <div class="col-md-6">
                <div class="card booking-card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <img src="../assets/images/movie_banner.png" 
                                     alt="${booking.show.movie.title}" 
                                     class="img-fluid movie-poster w-100">
                            </div>
                            <div class="col-md-8">
                                <div class="d-flex justify-content-between align-items-start">
                                    <h5 class="card-title movie-title">${booking.show.movie.title}</h5>
                                    <span class="bad    ge ${statusClass} status-badge">${booking.bookingStatus}</span>
                                </div>
                                <p class="text-muted">${booking.show.theater.theaterName} • ${booking.show.theater.theaterLocation}</p>
                                
                                <div class="row mt-3">
                                    <div class="col-6">
                                        <p><strong>Show Time:</strong><br>
                                        <span class="show-time">${showTime.toLocaleString()}</span></p>
                                    </div>
                                    <div class="col-6">
                                        <p><strong>Booked On:</strong><br>
                                        ${bookingTime.toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div class=" d-flex align-items-baseline gap-2">
                                    <p><strong>Seats:</strong></p>
                                    <div class="d-flex flex-wrap">
                                        ${booking.seatNumbers.map(seat =>
            `<span class="badge bg-primary me-1 mb-1">${seat}</span>`
        ).join('')}
                                    </div>
                                </div>
                                
                                <div class="d-flex align-items-baseline gap-3">
                                <p><strong>Total Amount:</strong></p>
                                    <h5 class="mb-0">₹ ${booking.price.toFixed(2)}</h5>
                                    ${booking.bookingStatus !== 'CANCELLED' && isUpcoming ?
                `<button class="btn btn-sm btn-outline-danger cancel-booking-btn" 
                                                data-booking-id="${booking.id}">
                                            Cancel Booking
                                        </button>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('main .container');
    container.prepend(alertDiv);

    setTimeout(() => {
        alertDiv.classList.remove('show');
        alertDiv.classList.add('hide');
    }, 5000);
}