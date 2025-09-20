import express from "express";
import { PrismaClient } from "@prisma/client";
import { ensureAdmin } from "../middlewares/auth.ts";

const router = express.Router();
const prisma = new PrismaClient();

// Get all ambulances with their current locations
router.get("/ambulances", ensureAdmin, async (req, res) => {
  try {
    const ambulances = await prisma.ambulance.findMany({
      where: {
        currentLatitude: {
          not: null
        },
        currentLongitude: {
          not: null
        }
      },
      include: {
        assignments: {
          include: {
            driver: true
          }
        },
        bookings: {
          where: {
            status: "active"
          }
        }
      }
    });

    res.json(ambulances);
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    res.status(500).json({ error: "Failed to fetch ambulances" });
  }
});

// Update ambulance location
router.post("/ambulances/:id/location", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, speed, heading, accuracy } = req.body;

    const updatedAmbulance = await prisma.ambulance.update({
      where: { id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastLocationUpdate: new Date()
      }
    });

    // Also add to location history
    await prisma.ambulanceLocation.create({
      data: {
        ambulanceId: id,
        latitude,
        longitude,
        speed: speed || null,
        heading: heading || null,
        accuracy: accuracy || null
      }
    });

    res.json(updatedAmbulance);
  } catch (error) {
    console.error("Error updating ambulance location:", error);
    res.status(500).json({ error: "Failed to update ambulance location" });
  }
});

// Get ambulance location history
router.get("/ambulances/:id/location-history", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const locationHistory = await prisma.ambulanceLocation.findMany({
      where: { ambulanceId: id },
      orderBy: { timestamp: "desc" },
      take: parseInt(limit as string)
    });

    res.json(locationHistory);
  } catch (error) {
    console.error("Error fetching location history:", error);
    res.status(500).json({ error: "Failed to fetch location history" });
  }
});

// Get active rides
router.get("/active-rides", ensureAdmin, async (req, res) => {
  try {
    const activeRides = await prisma.booking.findMany({
      where: {
        status: "active",
        assignedAmbulanceId: {
          not: null
        }
      },
      include: {
        assignedAmbulance: true,
        assignedDriver: true
      }
    });

    res.json(activeRides);
  } catch (error) {
    console.error("Error fetching active rides:", error);
    res.status(500).json({ error: "Failed to fetch active rides" });
  }
});

// Get status overview
router.get("/status-overview", ensureAdmin, async (req, res) => {
  try {
    const totalAmbulances = await prisma.ambulance.count();
    const availableAmbulances = await prisma.ambulance.count({
      where: { status: "available" }
    });
    const onDutyAmbulances = await prisma.ambulance.count({
      where: { status: "on_duty" }
    });
    const activeRides = await prisma.booking.count({
      where: { status: "active" }
    });

    const utilizationRate = totalAmbulances > 0 ? (activeRides / totalAmbulances) * 100 : 0;

    res.json({
      totalAmbulances,
      availableAmbulances,
      onDutyAmbulances,
      activeRides,
      utilizationRate: Math.round(utilizationRate)
    });
  } catch (error) {
    console.error("Error fetching status overview:", error);
    res.status(500).json({ error: "Failed to fetch status overview" });
  }
});

export default router;