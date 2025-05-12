document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (!name || !email || !message) {
            showResponse("Please fill out all fields.", "danger");
            return;
        }

        const contactEntry = { name, email, message };

        // Send to server using fetch 
        fetch("/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactEntry),
        })
            .then(res => res.json())
            .then(data => {
                showResponse(data.message || "Message sent successfully!", "success");
                form.reset();
            })
            .catch(error => {
                console.error("Error submitting contact message:", error);
                showResponse("Something went wrong. Please try again", "danger");
            });
    });

    function showResponse(msg, type) {
        const responseEl = document.getElementById("contact-response");
        if (!responseEl) return;

        responseEl.textContent = msg;
        responseEl.className = `alert alert-${type} mt-3`;
        responseEl.classList.remove("d-none");

        // Optionally hide after 4 seconds (for success only)
        if (type === "success") {
            setTimeout(() => {
                responseEl.classList.add("d-none");
            }, 4000);
        }
    }
});

