// Global variables
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function () {
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

async function loadShowDetails(showId) {
    try {
        const response = await fetch(`${API_BASE_URL}/show`);
        const shows = await response.json();
        const show = shows.find(s => s.id == showId);

        if (show) {
            const showTime = new Date(show.showTime).toLocaleString();

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
    }
}

function generateTheaterLayout(capacity) {
    const layoutContainer = document.getElementById('theaterLayout');
    layoutContainer.innerHTML = '';

    // Simple theater layout - 10 seats per row
    const rows = Math.ceil(capacity / 10);

    for (let row = 1; row <= rows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row mb-2';
        rowDiv.innerHTML = `<div class="col-12"><strong>Row ${row}</strong></div>`;

        const seatsDiv = document.createElement('div');
        seatsDiv.className = 'row seat-row';

        const seatsInRow = row === rows ? capacity % 10 || 10 : 10;

        for (let seat = 1; seat <= seatsInRow; seat++) {
            const seatNumber = `${row}-${seat}`;
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
        selectedSeatsList.innerHTML += `<span class="badge bg-primary me-1">${seat.getAttribute('data-seat')}</span>`;
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
    confirmBtn.addEventListener('click', function () {
        const selectedSeats = document.querySelectorAll('.seat-btn.btn-primary');
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        // In a real app, you would proceed with the booking process
        alert('Booking functionality will be implemented here');
        // window.location.href = '../bookings/confirmation.html';

        // We have to send these data to the backend
        //  int noOfSeats;
        //  List<String> seatNumbers;
        //  long userId;
        //  long showId;
    });
}