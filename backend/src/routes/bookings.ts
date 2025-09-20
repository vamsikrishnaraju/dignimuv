// src/routes/bookings.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ensureAdmin } from "../middlewares/auth.ts";

const router = Router();
const prisma = new PrismaClient();

// Get all bookings
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        assignedAmbulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        },
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        events: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get single booking
router.get("/:id", ensureAdmin, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        assignedAmbulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        },
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        events: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// Create new booking (public endpoint for customers)
router.post("/", async (req, res) => {
  try {
    const { 
      patientName, 
      phone, 
      fromAddress, 
      fromLatitude, 
      fromLongitude,
      toAddress, 
      toLatitude, 
      toLongitude,
      fromDate,
      toDate,
      time,
      notes 
    } = req.body;
    
    // Check if phone is verified
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { phone }
    });
    
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({ error: "Phone number not verified" });
    }
    
    // Check if verification is still valid (24 hours)
    const isValid = (new Date().getTime() - otpRecord.updatedAt.getTime()) < 24 * 60 * 60 * 1000;
    
    if (!isValid) {
      return res.status(400).json({ error: "Phone verification expired. Please verify again." });
    }
    
    const booking = await prisma.booking.create({
      data: {
        patientName,
        phone,
        phoneVerified: true,
        fromAddress,
        fromLatitude,
        fromLongitude,
        toAddress,
        toLatitude,
        toLongitude,
        fromDate: new Date(fromDate),
        toDate: toDate ? new Date(toDate) : null,
        time,
        notes
      },
      include: {
        assignedAmbulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        },
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });
    
    // Create initial event
    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        type: "BookingCreated",
        payload: { 
          patientName,
          phone,
          fromAddress,
          toAddress,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Update booking (admin only)
router.patch("/:id", ensureAdmin, async (req, res) => {
  try {
    const { 
      patientName, 
      phone, 
      fromAddress, 
      fromLatitude, 
      fromLongitude, 
      toAddress, 
      toLatitude, 
      toLongitude, 
      fromDate, 
      toDate, 
      time,
      notes
    } = req.body;
    const { id } = req.params;
    
    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        patientName, 
        phone, 
        fromAddress, 
        fromLatitude, 
        fromLongitude, 
        toAddress, 
        toLatitude, 
        toLongitude, 
        fromDate: fromDate ? new Date(fromDate) : undefined, 
        toDate: toDate ? new Date(toDate) : undefined, 
        time,
        notes
      },
      include: {
        assignedAmbulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        },
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        events: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    // Create event for booking update
    await prisma.bookingEvent.create({
      data: {
        bookingId: id,
        type: "BookingUpdated",
        payload: { 
          updatedBy: req.admin?.email,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    res.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// Update booking status
router.patch("/:id/status", ensureAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        assignedAmbulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        },
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });
    
    // Create event for status change
    await prisma.bookingEvent.create({
      data: {
        bookingId: id,
        type: "StatusChanged",
        payload: { 
          newStatus: status,
          changedBy: req.admin?.email,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    res.json(booking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Assign ambulance and driver to booking
router.patch("/:id/assign", ensureAdmin, async (req, res) => {
  try {
    const { ambulanceId, driverId } = req.body;
    const { id } = req.params;
    
    // Check if ambulance is available
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId }
    });
    
    if (!ambulance || ambulance.status !== "available") {
      return res.status(400).json({ error: "Ambulance is not available" });
    }
    
    // Check if driver is available
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });
    
    if (!driver || driver.status !== "available") {
      return res.status(400).json({ error: "Driver is not available" });
    }
    
    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        assignedAmbulanceId: ambulanceId,
        assignedDriverId: driverId,
        status: "assigned"
      },
      include: {
        assignedAmbulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        },
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });
    
    // Create event for assignment
    await prisma.bookingEvent.create({
      data: {
        bookingId: id,
        type: "AmbulanceAssigned",
        payload: { 
          ambulanceId,
          driverId,
          ambulanceVehicleNo: ambulance.vehicleNo,
          driverName: driver.name,
          assignedBy: req.admin?.email,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    res.json(booking);
  } catch (error) {
    console.error("Error assigning ambulance:", error);
    res.status(500).json({ error: "Failed to assign ambulance" });
  }
});

// Delete booking
router.delete("/:id", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete related events
    await prisma.bookingEvent.deleteMany({
      where: { bookingId: id }
    });
    
    // Then delete the booking
    await prisma.booking.delete({
      where: { id }
    });
    
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// Get available ambulances for assignment
router.get("/available/ambulances", ensureAdmin, async (req, res) => {
  try {
    const ambulances = await prisma.ambulance.findMany({
      where: { status: "available" },
      select: {
        id: true,
        vehicleNo: true,
        modelName: true,
        type: true,
        status: true
      }
    });
    
    res.json(ambulances);
  } catch (error) {
    console.error("Error fetching available ambulances:", error);
    res.status(500).json({ error: "Failed to fetch available ambulances" });
  }
});

// Get available drivers for assignment
router.get("/available/drivers", ensureAdmin, async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: { status: "available" },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true
      }
    });
    
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ error: "Failed to fetch available drivers" });
  }
});

export default router;