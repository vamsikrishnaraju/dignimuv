// src/routes/otp.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Generate and send OTP
router.post("/send", async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Delete existing OTP for this phone
    await prisma.otpVerification.deleteMany({
      where: { phone }
    });
    
    // Create new OTP record
    const otpRecord = await prisma.otpVerification.create({
      data: {
        phone,
        otp,
        expiresAt
      }
    });
    
    // In a real application, you would send SMS here
    // For development, we'll just return the OTP
    console.log(`OTP for ${phone}: ${otp}`);
    
    res.json({ 
      message: "OTP sent successfully",
      // Remove this in production
      otp: otp 
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP are required" });
    }
    
    // Find OTP record
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { phone }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ error: "OTP not found. Please request a new OTP." });
    }
    
    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpVerification.delete({
        where: { phone }
      });
      return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
    }
    
    // Check if OTP is correct
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    // Mark as verified
    await prisma.otpVerification.update({
      where: { phone },
      data: { verified: true }
    });
    
    res.json({ 
      message: "Phone number verified successfully",
      verified: true 
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Check if phone is verified
router.get("/status/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { phone }
    });
    
    if (!otpRecord) {
      return res.json({ verified: false });
    }
    
    // Check if verification is still valid (24 hours)
    const isValid = otpRecord.verified && 
                   (new Date().getTime() - otpRecord.updatedAt.getTime()) < 24 * 60 * 60 * 1000;
    
    res.json({ 
      verified: isValid,
      expiresAt: otpRecord.expiresAt 
    });
  } catch (error) {
    console.error("Error checking OTP status:", error);
    res.status(500).json({ error: "Failed to check OTP status" });
  }
});

export default router;
