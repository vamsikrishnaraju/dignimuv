// src/routes/assignments.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ensureAdmin } from "../middlewares/auth.ts";

const router = Router();
const prisma = new PrismaClient();

// Get assignments for a date range
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const { startDate, endDate, ambulanceId } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    if (ambulanceId) {
      where.ambulanceId = ambulanceId as string;
    }
    
    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true
          }
        },
        ambulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { shift: 'asc' }
      ]
    });
    
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// Get assignments for a specific date
router.get("/date/:date", ensureAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    
    const assignments = await prisma.assignment.findMany({
      where: {
        date: {
          gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
        }
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true
          }
        },
        ambulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        }
      },
      orderBy: { shift: 'asc' }
    });
    
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments for date:", error);
    res.status(500).json({ error: "Failed to fetch assignments for date" });
  }
});

// Create new assignment
router.post("/", ensureAdmin, async (req, res) => {
  try {
    const { date, shift, driverId, ambulanceId, notes } = req.body;
    
    // Check if assignment already exists for this date, shift, and ambulance
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        date: new Date(date),
        shift,
        ambulanceId
      }
    });
    
    if (existingAssignment) {
      return res.status(400).json({ error: "Assignment already exists for this date, shift, and ambulance" });
    }
    
    // Check if driver is available
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });
    
    if (!driver || driver.status !== "available") {
      return res.status(400).json({ error: "Driver is not available" });
    }
    
    // Check if ambulance is available
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId }
    });
    
    if (!ambulance || ambulance.status !== "available") {
      return res.status(400).json({ error: "Ambulance is not available" });
    }
    
    const assignment = await prisma.assignment.create({
      data: {
        date: new Date(date),
        shift,
        driverId,
        ambulanceId,
        notes
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true
          }
        },
        ambulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        }
      }
    });
    
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

// Update assignment
router.patch("/:id", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, status, notes } = req.body;
    
    const updateData: any = {};
    
    if (driverId) {
      // Check if new driver is available
      const driver = await prisma.driver.findUnique({
        where: { id: driverId }
      });
      
      if (!driver || driver.status !== "available") {
        return res.status(400).json({ error: "Driver is not available" });
      }
      
      updateData.driverId = driverId;
    }
    
    if (status) {
      updateData.status = status;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const assignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true
          }
        },
        ambulance: {
          select: {
            id: true,
            vehicleNo: true,
            modelName: true,
            type: true
          }
        }
      }
    });
    
    res.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ error: "Failed to update assignment" });
  }
});

// Delete assignment
router.delete("/:id", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.assignment.delete({
      where: { id }
    });
    
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

// Get available drivers for a specific date and shift
router.get("/available-drivers", ensureAdmin, async (req, res) => {
  try {
    const { date, shift } = req.query;
    
    if (!date || !shift) {
      return res.status(400).json({ error: "Date and shift are required" });
    }
    
    const targetDate = new Date(date as string);
    
    // Get drivers who are already assigned for this date and shift
    const assignedDriverIds = await prisma.assignment.findMany({
      where: {
        date: {
          gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
        },
        shift: shift as string
      },
      select: { driverId: true }
    });
    
    const assignedIds = assignedDriverIds.map(a => a.driverId);
    
    // Get available drivers (not assigned and status is available)
    const availableDrivers = await prisma.driver.findMany({
      where: {
        status: "available",
        id: {
          notIn: assignedIds
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true
      }
    });
    
    res.json(availableDrivers);
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ error: "Failed to fetch available drivers" });
  }
});

// Get available ambulances for a specific date and shift
router.get("/available-ambulances", ensureAdmin, async (req, res) => {
  try {
    const { date, shift } = req.query;
    
    if (!date || !shift) {
      return res.status(400).json({ error: "Date and shift are required" });
    }
    
    const targetDate = new Date(date as string);
    
    // Get ambulances that are already assigned for this date and shift
    const assignedAmbulanceIds = await prisma.assignment.findMany({
      where: {
        date: {
          gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
        },
        shift: shift as string
      },
      select: { ambulanceId: true }
    });
    
    const assignedIds = assignedAmbulanceIds.map(a => a.ambulanceId);
    
    // Get available ambulances (not assigned and status is available)
    const availableAmbulances = await prisma.ambulance.findMany({
      where: {
        status: "available",
        id: {
          notIn: assignedIds
        }
      },
      select: {
        id: true,
        vehicleNo: true,
        modelName: true,
        type: true,
        status: true
      }
    });
    
    res.json(availableAmbulances);
  } catch (error) {
    console.error("Error fetching available ambulances:", error);
    res.status(500).json({ error: "Failed to fetch available ambulances" });
  }
});

export default router;
