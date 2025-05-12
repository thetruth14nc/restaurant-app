//Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    renderReservations();
    renderContactMessages();
});
// === Fetch and render reservations ===
function renderReservations() {
    fetch("/reservations.json")
        .then(res => res.json())
        .then(reservations => {
            const tableBody = document.querySelector("#reservation-table tbody");
            tableBody.innerHTML = "";
            reservations.forEach((r, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${r.name}</td>
                    <td>${r.email}</td>
                    <td>${r.date}</td>
                    <td>${r.time}</td>
                    <td>${r.guests}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteReservation(${index})">Delete</button></td>
                 `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error("Error loading reservation", err));
}

// === Fetch and render contact messages
function renderContactMessages() {
    fetch("/contacts.json")
        .then(res => res.json())
        .then(contactMessages => {
            const container = document.getElementById("contact-messages");
            container.innerHTML = "";
            contactMessages.forEach((msg, index) => {
                const card = document.createElement("div");
                card.className = "card mb-3";
                card.innerHTML = `
                    <div class="card-body">
                        <h6 class="card-title mb-1">${msg.name}</h6>
                        <h6 class="card-subtitle mb-2 text-muted">${msg.email}</h6>
                        <p class="card-text">${msg.message}</p>
                        <button class="btn btn-sm btn-danger mt-2" onclick="deleteContactMessages(${index})">
                            Delete
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => console.error("Error loading contact messages:", err));
}

// === Delete reservations by index
window.deleteReservation = function (index) {
    if (confirm("Are you sure you want to delete this reservation?")) {
        fetch(`/delete-reservation/${index}`, { method: "DELETE" })
            .then(res => res.json())
            .then(() => renderReservations())
            .catch(err => console.error("Failed to delete reservation.", err));
    }
};

// ==== Delete contact message by index
window.deleteContactMessages = function (index) {
    if (confirm("Are you sure you want to delete this message?")) {
        fetch(`/delete-contact/${index}`, { method: "DELETE" })
            .then(res => res.json())
            .then(() => renderContactMessages())
            .catch(err => console.error("Failed to delete message:", err));
    }
};