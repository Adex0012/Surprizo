const bookingsTable = document.querySelector('.dashboard tbody');

function renderBookings(bookings) {
    bookingsTable.innerHTML = '';
    bookings.forEach((booking, index) => {
        const row = document.createElement('tr');
        const receiptUrl = booking.receipt ? booking.receipt.path : (booking.files && booking.files.receipt) ? booking.files.receipt[0].path : '';
        row.innerHTML = `
            <td>${booking.type}</td>
            <td>${booking.data['celebrant-name']}</td>
            <td>${new Date(booking.data['surprise-date-time']).toLocaleString()}</td>
            <td><a href="${receiptUrl}" target="_blank">View Receipt</a></td>
            <td>${booking.status}</td>
            <td><button class="btn" data-index="${index}">Mark as Completed</button></td>
        `;
        bookingsTable.appendChild(row);
    });
}

async function fetchBookings() {
    const response = await fetch('/api/bookings');
    const bookings = await response.json();
    renderBookings(bookings);
}

bookingsTable.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn')) {
        const index = e.target.dataset.index;
        const response = await fetch(`/api/bookings/${index}/complete`, {
            method: 'POST'
        });
        const result = await response.json();
        if (result.success) {
            fetchBookings();
        } else {
            alert(result.message);
        }
    }
});

fetchBookings();
