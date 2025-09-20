// src/seeds/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create Admin User
  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: "admin@medadmin.com" },
    update: {},
    create: {
      email: "admin@medadmin.com",
      password: hashedPassword,
      role: "super_admin"
    }
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create Sample Drivers
  console.log("🚗 Creating sample drivers...");
  const drivers = [
    {
      name: "Rajesh Kumar",
      phone: "+91-9876543210",
      email: "rajesh.kumar@email.com",
      licenseNo: "DL-01-1234567890",
      address: "123 MG Road, Bangalore, Karnataka 560001",
      aadharNo: "1234-5678-9012",
      status: "available"
    },
    {
      name: "Suresh Patel",
      phone: "+91-9876543211",
      email: "suresh.patel@email.com",
      licenseNo: "DL-01-1234567891",
      address: "456 Brigade Road, Bangalore, Karnataka 560025",
      aadharNo: "1234-5678-9013",
      status: "available"
    },
    {
      name: "Amit Singh",
      phone: "+91-9876543212",
      email: "amit.singh@email.com",
      licenseNo: "DL-01-1234567892",
      address: "789 Koramangala, Bangalore, Karnataka 560034",
      aadharNo: "1234-5678-9014",
      status: "busy"
    },
    {
      name: "Vikram Reddy",
      phone: "+91-9876543213",
      email: "vikram.reddy@email.com",
      licenseNo: "DL-01-1234567893",
      address: "321 Indiranagar, Bangalore, Karnataka 560038",
      aadharNo: "1234-5678-9015",
      status: "available"
    },
    {
      name: "Kumar Swamy",
      phone: "+91-9876543214",
      email: "kumar.swamy@email.com",
      licenseNo: "DL-01-1234567894",
      address: "654 Whitefield, Bangalore, Karnataka 560066",
      aadharNo: "1234-5678-9016",
      status: "offline"
    }
  ];

  for (const driverData of drivers) {
    const driver = await prisma.driver.upsert({
      where: { phone: driverData.phone },
      update: {},
      create: driverData
    });
    console.log(`✅ Driver created: ${driver.name}`);
  }

  // Create Sample Ambulances
  console.log("🚑 Creating sample ambulances...");
  const ambulances = [
    {
      modelName: "Tata Winger",
      type: "Basic Life Support",
      vehicleNo: "KA-01-AB-1234",
      equipmentDetails: "Oxygen cylinder, First aid kit, Stretcher, Basic monitoring equipment, Defibrillator",
      status: "available"
    },
    {
      modelName: "Mahindra Bolero",
      type: "Advanced Life Support",
      vehicleNo: "KA-01-AB-1235",
      equipmentDetails: "Advanced cardiac monitoring, Ventilator, IV pumps, Emergency medications, Advanced airway management",
      status: "available"
    },
    {
      modelName: "Force Traveller",
      type: "Critical Care",
      vehicleNo: "KA-01-AB-1236",
      equipmentDetails: "ICU-grade monitoring, ECMO capability, Advanced life support, Specialized medical equipment",
      status: "in_use"
    },
    {
      modelName: "Toyota Innova",
      type: "Neonatal",
      vehicleNo: "KA-01-AB-1237",
      equipmentDetails: "Neonatal incubator, Pediatric monitoring, Specialized neonatal equipment, Temperature control",
      status: "available"
    },
    {
      modelName: "Maruti Eeco",
      type: "Basic Life Support",
      vehicleNo: "KA-01-AB-1238",
      equipmentDetails: "Basic first aid, Oxygen supply, Stretcher, Emergency medications",
      status: "maintenance"
    }
  ];

  for (const ambulanceData of ambulances) {
    const ambulance = await prisma.ambulance.upsert({
      where: { vehicleNo: ambulanceData.vehicleNo },
      update: {},
      create: ambulanceData
    });
    console.log(`✅ Ambulance created: ${ambulance.vehicleNo}`);
  }

  // Create Sample Bookings
  console.log("📋 Creating sample bookings...");
  const bookings = [
    {
      patientName: "Priya Sharma",
      phone: "+91-9876543201",
      phoneVerified: true,
      fromAddress: "123 MG Road, Bangalore, Karnataka 560001",
      fromLatitude: 12.9716,
      fromLongitude: 77.5946,
      toAddress: "Apollo Hospital, Bannerghatta Road, Bangalore",
      toLatitude: 12.8446,
      toLongitude: 77.6602,
      fromDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: "09:00",
      status: "pending",
      notes: "Patient has diabetes, needs regular monitoring"
    },
    {
      patientName: "Ravi Kumar",
      phone: "+91-9876543202",
      phoneVerified: true,
      fromAddress: "456 Brigade Road, Bangalore, Karnataka 560025",
      fromLatitude: 12.9716,
      fromLongitude: 77.5946,
      toAddress: "Fortis Hospital, Cunningham Road, Bangalore",
      toLatitude: 12.9716,
      toLongitude: 77.5946,
      fromDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      time: "14:30",
      status: "confirmed",
      notes: "Emergency case, high priority"
    },
    {
      patientName: "Sunita Devi",
      phone: "+91-9876543203",
      phoneVerified: true,
      fromAddress: "789 Koramangala, Bangalore, Karnataka 560034",
      fromLatitude: 12.9352,
      fromLongitude: 77.6245,
      toAddress: "Manipal Hospital, HAL Airport Road, Bangalore",
      toLatitude: 12.9716,
      toLongitude: 77.5946,
      fromDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: "11:00",
      status: "assigned",
      notes: "Regular checkup appointment"
    }
  ];

  for (const bookingData of bookings) {
    const booking = await prisma.booking.create({
      data: bookingData
    });
    console.log(`✅ Booking created: ${booking.patientName}`);
  }

  // Create Sample Assignments
  console.log("📅 Creating sample assignments...");
  const availableDrivers = await prisma.driver.findMany({
    where: { status: "available" },
    take: 3
  });
  
  const availableAmbulances = await prisma.ambulance.findMany({
    where: { status: "available" },
    take: 3
  });

  const shifts = ["morning", "afternoon", "night"];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    for (let j = 0; j < shifts.length && j < availableDrivers.length && j < availableAmbulances.length; j++) {
      const assignment = await prisma.assignment.create({
        data: {
          date: date,
          shift: shifts[j],
          driverId: availableDrivers[j].id,
          ambulanceId: availableAmbulances[j].id,
          status: "scheduled",
          notes: `Assignment for ${shifts[j]} shift`
        }
      });
      console.log(`✅ Assignment created: ${shifts[j]} shift for ${date.toDateString()}`);
    }
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- 1 Admin user created`);
  console.log(`- ${drivers.length} Drivers created`);
  console.log(`- ${ambulances.length} Ambulances created`);
  console.log(`- ${bookings.length} Bookings created`);
  console.log(`- 15 Assignments created`);
  console.log("\n🔑 Admin Login Credentials:");
  console.log("Email: admin@medadmin.com");
  console.log("Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });