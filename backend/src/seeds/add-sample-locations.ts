import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addSampleLocations() {
  try {
    console.log("Adding sample ambulance locations...");

    // Get all ambulances
    const ambulances = await prisma.ambulance.findMany();
    
    if (ambulances.length === 0) {
      console.log("No ambulances found. Please create ambulances first.");
      return;
    }

    // Add current location data to ambulances
    for (let i = 0; i < ambulances.length; i++) {
      const ambulance = ambulances[i];
      
      // Generate random coordinates around Bangalore
      const baseLat = 12.9716;
      const baseLng = 77.5946;
      const latOffset = (Math.random() - 0.5) * 0.1; // ±0.05 degrees
      const lngOffset = (Math.random() - 0.5) * 0.1; // ±0.05 degrees
      
      const latitude = baseLat + latOffset;
      const longitude = baseLng + lngOffset;
      
      // Update ambulance with current location
      await prisma.ambulance.update({
        where: { id: ambulance.id },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          lastLocationUpdate: new Date()
        }
      });

      // Add some location history
      for (let j = 0; j < 10; j++) {
        const historyLat = latitude + (Math.random() - 0.5) * 0.01;
        const historyLng = longitude + (Math.random() - 0.5) * 0.01;
        
        await prisma.ambulanceLocation.create({
          data: {
            ambulanceId: ambulance.id,
            latitude: historyLat,
            longitude: historyLng,
            speed: Math.random() * 60, // 0-60 km/h
            heading: Math.random() * 360, // 0-360 degrees
            accuracy: Math.random() * 10 + 5, // 5-15 meters
            timestamp: new Date(Date.now() - j * 60000) // Last 10 minutes
          }
        });
      }
    }

    // Create some sample active bookings for testing
    const sampleBookings = [
      {
        patientName: "John Doe",
        phone: "9876543210",
        fromAddress: "MG Road, Bangalore",
        toAddress: "Kempegowda International Airport",
        fromLatitude: 12.9716,
        fromLongitude: 77.5946,
        toLatitude: 13.1986,
        toLongitude: 77.7063,
        fromDate: new Date(),
        time: "10:30",
        status: "active"
      },
      {
        patientName: "Jane Smith",
        phone: "9876543211",
        fromAddress: "Whitefield, Bangalore",
        toAddress: "Manipal Hospital",
        fromLatitude: 12.9698,
        fromLongitude: 77.7500,
        toLatitude: 12.9141,
        toLongitude: 77.6419,
        fromDate: new Date(),
        time: "14:00",
        status: "active"
      }
    ];

    for (const booking of sampleBookings) {
      // Find an available ambulance
      const availableAmbulance = await prisma.ambulance.findFirst({
        where: { status: "available" }
      });

      if (availableAmbulance) {
        await prisma.booking.create({
          data: {
            ...booking,
            assignedAmbulanceId: availableAmbulance.id,
            assignedDriverId: null // Will be assigned later
          }
        });

        // Update ambulance status
        await prisma.ambulance.update({
          where: { id: availableAmbulance.id },
          data: { status: "on_duty" }
        });
      }
    }

    console.log("✅ Sample locations and active bookings added successfully!");
  } catch (error) {
    console.error("❌ Error adding sample locations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleLocations();