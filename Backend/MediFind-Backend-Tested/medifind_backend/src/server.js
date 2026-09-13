const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config({ path: path.join(__dirname, "../.env") });

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const medicineSearchRoutes = require("./routes/medicineSearchRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/search", medicineSearchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reservations", reservationRoutes);
// Backward-compatible alias for clients using the original route prefix.
app.use("/reservations", reservationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "MediFind API is running" });
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };
