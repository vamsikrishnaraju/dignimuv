// backend/src/routes/admin.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import { ensureAdmin } from "../middlewares/auth.ts";

const prisma = new PrismaClient();
const router = express.Router();

// Get current admin info
router.get("/me", ensureAdmin, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.sub },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin info:", error);
    res.status(500).json({ error: "Failed to fetch admin info" });
  }
});

// Get dashboard stats
router.get("/stats", ensureAdmin, async (req, res) => {
  try {
    const [
      totalBookings,
      activeBookings,
      totalDrivers,
      availableDrivers,
      totalAmbulances,
      availableAmbulances
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ["created", "assigned", "in_progress"] } } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { status: "available" } }),
      prisma.ambulance.count(),
      prisma.ambulance.count({ where: { status: "available" } })
    ]);
    
    res.json({
      bookings: {
        total: totalBookings,
        active: activeBookings
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers
      },
      ambulances: {
        total: totalAmbulances,
        available: availableAmbulances
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
