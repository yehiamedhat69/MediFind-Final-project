const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

const helmet = require("helmet"); 
const cors = require("cors");     
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");

const authenticateToken = require("./middleware/authMiddleware");
const inventoryRoutes = require("./routes/inventoryRoutes"); 
const medicineSearchRoutes = require("./routes/medicineSearchRoutes");
dotenv.config({ path: path.join(__dirname, "../.env") });
const adminRoutes = require("./routes/adminRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const reservationRoutes = require("./routes/reservationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


app.use(helmet()); 
app.use(cors());   

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/search", medicineSearchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
connectDB();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "MediFind API is running" });
});

// Protected route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});
app.use("/api/reservations", reservationRoutes);

// Error handling (must stay last, after every route above)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});