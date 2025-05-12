// === Dependencies ===
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// === Ensure Data Directory and Files Exist ===
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const reservationsFilePath = path.join(__dirname, "data", "reservations.json");
if (!fs.existsSync(reservationsFilePath)) fs.writeFileSync(reservationsFilePath, "[]")

const contactFilePath = path.join(__dirname, "data", "contact.json");
if (!fs.existsSync(contactFilePath)) fs.writeFileSync(contactFilePath, "[]");

// === Middleware ===
app.use(express.static("public")); // Server static files from /public
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// === Route: Home page ===
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Route: Admin page ===
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// === Route: Get all reservations data as JSON ===
app.get("/reservations.json", (req, res) => {
    res.sendFile(reservationsFilePath);
});

// == Route: Handle new reservation submission ===
app.post("/reserve", (req, res) => {
    const reservation = req.body;

    fs.readFile(reservationsFilePath, "utf8", (err, data) => {
        let reservations = [];
        if (!err && data) {
            try {
                reservations = JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing reservations", parseError);
                return res.status(500).json({ message: "Invalid reservation data." });
            }
        }

        reservations.push(reservation);

        fs.writeFile(reservationsFilePath, JSON.stringify(reservations, null, 2), (err) => {
            if (err) {
                console.error("Error saving reservation:", err);
                return res.status(500).json({ message: "Failed to save reservation." });
            }

            res.status(200).json({ message: "Reservation saved successfully!" });
        });
    });
});

// === Handle contact form submission ===
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const contactEntry = { name, email, message };

    fs.readFile(contactFilePath, "utf8", (err, data) => {
        let contacts = [];
        if (!err && data) {
            try {
                contacts = JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing contact messages", parseError);
            }
        }

        contacts.push(contactEntry);

        fs.writeFile(contactFilePath, JSON.stringify(contacts, null, 2), (err) => {
            if (err) {
                console.error("Error saving contact message", err);
                return res.status(500).json({ message: "Failed to save message." });
            }

            res.status(200).json({ message: "Message received successfully!" });
        });
    });
});

// === View contact messages in browser ===
app.get("/contacts", (req, res) => {
    const filePath = path.join(__dirname, "data", "contact.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading contacts:", err);
            return res.status(500).send("Unable to read contact messages.");
        }

        const contacts = JSON.parse(data || "[]");
        const contactList = contacts.map(C => `
            <li><strong>${C.name}</strong> (${C.email}): ${C.message}</li>
        `).join("")

        res.send(`
            <html>
                <head><title>Contact Submissions</title></head>
                <body>
                    <h1>Submitted Contact Messages</h1>
                    <ul>${contactList}</ul>
                </body>
            </html>
        `);
    });
});

// === Serve contacts.json ===
app.get("/contacts.json", (req, res) => {
    fs.readFile(contactFilePath, "utf-8", (err, data) => {
        if (err) return res.status(500).json([]);
        res.json(JSON.parse(data || "[]"));
    });
});

// === Delete reservation by index ===
app.delete("/delete-reservation/:index", (req, res) => {
    const index = parseInt(req.params.index);
    fs.readFile(reservationsFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read reservations." });
        const reservations = JSON.parse(data || "[]");
        reservations.splice(index, 1);
        fs.writeFile(reservationsFilePath, JSON.stringify(reservations, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write reservations." });
            res.json({ message: "Deleted" });
        });
    });
});

// === Delete contact message index ===
app.delete("/delete-contact/:index", (req, res) => {
    const index = parseInt(req.params.index);
    fs.readFile(contactFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read contacts." });
        const contacts = JSON.parse(data || "[]");
        contacts.splice(index, 1);
        fs.writeFile(contactFilePath, JSON.stringify(contacts, null, 2), err => {
            if (err) return res.status(500).json({ error: "Failed to write contacts." });
            res.json({ message: "Deleted" });
        });
    });
});

//=== Start the server ===
app.listen(PORT, () => {
    console.log(`Unified server running at http://localhost:${PORT}`)
});
