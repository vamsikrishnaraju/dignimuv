// backend/src/routes/drivers.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import { ensureAdmin } from "../middlewares/auth.ts";

const prisma = new PrismaClient();
const router = express.Router();

// Get all drivers
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// Get single driver
router.get("/:id", ensureAdmin, async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id }
    });
    
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    
    res.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ error: "Failed to fetch driver" });
  }
});

// Get single driver by phone number
router.get("/phone/:phonenumber", ensureAdmin, async (req, res) => {
  try {
    console.log(req.params.phonenumber);
    const driver = await prisma.driver.findUnique({
      where: { phone: req.params.phonenumber }
    });
    console.log(driver);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    
    res.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ error: "Failed to fetch driver" });
  }
});

// Create new driver
router.post("/", ensureAdmin, async (req, res) => {
  try {
    const { name, phone, email, licenseNo, address, aadharNo, status = "available" } = req.body;
    
    const driver = await prisma.driver.create({
      data: { name, phone, email, licenseNo, address, aadharNo, status }
    });
    
    res.status(201).json(driver);
  } catch (error) {
    console.error("Error creating driver:", error);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      res.status(400).json({ error: `${field} already exists` });
    } else {
      res.status(500).json({ error: "Failed to create driver" });
    }
  }
});

// Update driver
router.patch("/:id", ensureAdmin, async (req, res) => {
  try {
    const { name, phone, email, licenseNo, address, aadharNo, status } = req.body;
    const { id } = req.params;
    
    const driver = await prisma.driver.update({
      where: { id },
      data: { name, phone, email, licenseNo, address, aadharNo, status }
    });
    
    res.json(driver);
  } catch (error) {
    console.error("Error updating driver:", error);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      res.status(400).json({ error: `${field} already exists` });
    } else {
      res.status(500).json({ error: "Failed to update driver" });
    }
  }
});

// Delete driver
router.delete("/:id", ensureAdmin, async (req, res) => {
  try {
    await prisma.driver.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({ error: "Failed to delete driver" });
  }
});

export default router;
