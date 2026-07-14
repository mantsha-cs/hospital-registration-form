 const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// ======================
// Middleware
// ======================
app.use(express.urlencoded({ extended: true }));
// Allows the HTML file to access styleapp.css and frontend app.js directly
app.use(express.static(__dirname));

// ======================
// MongoDB Connection
// ======================
async function connectDB() {
    try {
        await mongoose.connect(
            "mongodb://divyach2006_db_user:divyaji@ac-67wdlg6-shard-00-00.ack3vvl.mongodb.net:27017,ac-67wdlg6-shard-00-01.ack3vvl.mongodb.net:27017,ac-67wdlg6-shard-00-02.ack3vvl.mongodb.net:27017/hospitalDB?ssl=true&replicaSet=atlas-6ijk6j-shard-0&authSource=admin&appName=Cluster0"
        );
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.log("❌ Database Connection Error:", error.message);
    }
}
connectDB();

// ======================
// Patient Schema & Model
// ======================
const patientSchema = new mongoose.Schema({
    patientName: { type: String, required: true, trim: true },
    admissionDate: { type: String, required: true }, // Tip: change to Date type in production if sorting by date gets buggy
    illness: { type: String, required: true, trim: true }
});

const Patient = mongoose.model("Patient", patientSchema);

// ======================
// Routes
// ======================

// 1. Home Page (Registration Form)
app.get("/", (req, res) => {
    // Fixed: Pointing to 'index.html' instead of 'patient.index.html'
    res.sendFile(path.join(__dirname, "index.html"));
});

// 2. Register Patient Action
app.post("/register", async (req, res) => {
    try {
        const { patientName, admissionDate, illness } = req.body;

        if (!patientName || !admissionDate || !illness) {
            return res.status(400).send("<h2>All fields are required.</h2>");
        }

        const patient = new Patient({ patientName, admissionDate, illness });
        await patient.save();

        // Styled to match your beautiful UI theme
        res.send(`
            <html>
            <head>
                <title>Success | Patient Registry</title>
                <link rel="stylesheet" href="styleapp.css">
                <style>
                    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                    .success-card { text-align: center; }
                    .success-icon { font-size: 3rem; margin-bottom: 10px; }
                    .patient-details { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; border-left: 4px solid #10b981; }
                </style>
            </head>
            <body>
                <div class="container success-card">
                    <div class="success-icon">✅</div>
                    <h2>Patient Registered</h2>
                    <p class="subtitle">Record saved successfully into the database.</p>
                    
                    <div class="patient-details">
                        <p><strong>Name:</strong> ${patientName}</p>
                        <p><strong>Admission:</strong> ${admissionDate}</p>
                        <p><strong>Diagnosis:</strong> ${illness}</p>
                    </div>

                    <a href="/" class="register-btn" style="text-decoration: none; display: block;">Register Another Patient</a>
                    <div class="button-area"><a href="/patients" class="view-btn">View All Patients</a></div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("<h2>Error while saving patient.</h2>");
    }
});

// 3. View Patients List
app.get("/patients", async (req, res) => {
    try {
        const patients = await Patient.find().sort({ admissionDate: -1 });

        let output = `
            <html>
            <head>
                <title>Registered Patients</title>
                <link rel="stylesheet" href="styleapp.css">
                <style>
                    body { display: block; padding: 40px 20px; }
                    .records-container { max-width: 600px; margin: 0 auto; }
                    .patient-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
                    .patient-card h3 { color: #0f172a; margin-bottom: 10px; font-size: 1.1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px;}
                    .patient-card p { margin-bottom: 6px; font-size: 0.95rem; }
                    .back-link-wrapper { text-align: center; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="records-container">
                    <header>
                        <h1>📋 Registered Patients List</h1>
                        <p class="subtitle">Showing all patients sorted by newest admission</p>
                    </header>
        `;

        if (patients.length === 0) {
            output += `<div class="patient-card" style="text-align:center;"><p>No patients registered yet.</p></div>`;
        } else {
            patients.forEach((patient, index) => {
                output += `
                    <div class="patient-card">
                        <h3>Patient #${index + 1}</h3>
                        <p><strong>Name:</strong> ${patient.patientName}</p>
                        <p><strong>Date of Admission:</strong> ${patient.admissionDate}</p>
                        <p><strong>Diagnosis:</strong> ${patient.illness}</p>
                    </div>
                `;
            });
        }

        output += `
                    <div class="back-link-wrapper">
                        <a href="/" class="view-btn">⬅ Back to Registration Form</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        res.send(output);
    } catch (error) {
        console.error(error);
        res.status(500).send("<h2>Error fetching patients.</h2>");
    }
});

// ======================
// Server Start
// ======================
app.listen(PORT, () => {
    console.log(`🚀 Server Running at http://localhost:${PORT}`);
});