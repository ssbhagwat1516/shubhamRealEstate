const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const admin = require("firebase-admin");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// 🔐 Initialize Firebase
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

// 🌐 Create Express App
const app = express();
const PORT = process.env.PORT || 5000;

// 🛡 Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// 🧱 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);

// ✅ Test Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running ✅",
    time: new Date().toISOString(),
  });
});

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ▶️ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
