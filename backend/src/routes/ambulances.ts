// backend/src/routes/ambulances.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import { ensureAdmin } from "../middlewares/auth.ts";

const prisma = new PrismaClient();
const router = express.Router();

// Get all ambulances
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const ambulances = await prisma.ambulance.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(ambulances);
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    res.status(500).json({ error: "Failed to fetch ambulances" });
  }
});

// Get single ambulance
router.get("/:id", ensureAdmin, async (req, res) => {
  try {
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: req.params.id }
    });
    
    if (!ambulance) {
      return res.status(404).json({ error: "Ambulance not found" });
    }
    
    res.json(ambulance);
  } catch (error) {
    console.error("Error fetching ambulance:", error);
    res.status(500).json({ error: "Failed to fetch ambulance" });
  }
});

// Create new ambulance
router.post("/", ensureAdmin, async (req, res) => {
  try {
    const { modelName, type, vehicleNo, equipmentDetails, status = "available" } = req.body;
    
    const ambulance = await prisma.ambulance.create({
      data: { modelName, type, vehicleNo, equipmentDetails, status }
    });
    
    res.status(201).json(ambulance);
  } catch (error) {
    console.error("Error creating ambulance:", error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: "Vehicle number already exists" });
    } else {
      res.status(500).json({ error: "Failed to create ambulance" });
    }
  }
});

// Update ambulance
router.patch("/:id", ensureAdmin, async (req, res) => {
  try {
    const { modelName, type, vehicleNo, equipmentDetails, status } = req.body;
    const { id } = req.params;
    
    const ambulance = await prisma.ambulance.update({
      where: { id },
      data: { modelName, type, vehicleNo, equipmentDetails, status }
    });
    
    res.json(ambulance);
  } catch (error) {
    console.error("Error updating ambulance:", error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: "Vehicle number already exists" });
    } else {
      res.status(500).json({ error: "Failed to update ambulance" });
    }
  }
});

// Delete ambulance
router.delete("/:id", ensureAdmin, async (req, res) => {
  try {
    await prisma.ambulance.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: "Ambulance deleted successfully" });
  } catch (error) {
    console.error("Error deleting ambulance:", error);
    res.status(500).json({ error: "Failed to delete ambulance" });
  }
});

export default router;
