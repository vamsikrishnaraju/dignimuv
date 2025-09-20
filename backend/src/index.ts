import express from "express";
import authRoutes from "./routes/auth.ts";
import adminRoutes from "./routes/admin.ts";
import bookingRoutes from "./routes/bookings.ts";
import driverRoutes from "./routes/drivers.ts";
import ambulanceRoutes from "./routes/ambulances.ts";
import assignmentRoutes from "./routes/assignments.ts";
import expenseRoutes from "./routes/expenses.ts";
import monitoringRoutes from "./routes/monitoring.ts";
import otpRoutes from "./routes/otp.ts";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/admin", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/bookings", bookingRoutes);
app.use("/admin/drivers", driverRoutes);
app.use("/admin/ambulances", ambulanceRoutes);
app.use("/admin/assignments", assignmentRoutes);
app.use("/admin/expenses", expenseRoutes);
app.use("/admin/monitoring", monitoringRoutes);
app.use("/otp", otpRoutes);
app.use("/bookings", bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
