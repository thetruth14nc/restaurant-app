// Wait for the DOM to fully load 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reservation");

    if (!form) return;

    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        dateInput.min = formattedDate;
    }

    const timeInput = document.getElementById("time");
    if (timeInput) {
        timeInput.min = "12:00";
        timeInput.max = "22:00";
    }

    // Attach submit event listener to the form
    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent default page reload

        // === Step 1: Collect and sanitize input values ===
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        const guests = document.getElementById("guests").value;

        if (!name || !email || !date || !time || !guests) {
            showReservationResponse("Please fill out all fields.", "danger");
            return;
        }

        const reservationData = { name, email, date, time, guests };

        // Send to server using fetch 
        fetch("/reserve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reservationData),
        })
            .then(res => res.json())
            .then(data => {
                showReservationResponse(data.message || "Reservation saved!", "success");
                form.reset();
            })
            .catch(error => {
                console.error("Error submitting reservation:", error);
                showReservationResponse("Something went wrong. Please try again.", "danger");
            });
    });

    function showReservationResponse(msg, type) {
        const responseEl = document.getElementById("reservation-response");

        if (!responseEl) return;

        responseEl.textContent = msg;
        responseEl.className = `alert alert-${type} mt-3`;
        responseEl.classList.remove("d-none");

        if (type === "success") {
            setTimeout(() => {
                responseEl.classList.add("d-none");
            }, 4000);
        }
    }
});