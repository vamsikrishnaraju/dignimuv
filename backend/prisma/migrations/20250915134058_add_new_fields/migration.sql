/*
  Warnings:

  - A unique constraint covering the columns `[vehicleNo]` on the table `Ambulance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[licenseNo]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aadharNo]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `equipmentDetails` to the `Ambulance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelName` to the `Ambulance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Ambulance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ambulance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aadharNo` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseNo` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Ambulance" ADD COLUMN     "equipmentDetails" TEXT NOT NULL,
ADD COLUMN     "modelName" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "aadharNo" TEXT NOT NULL,
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "licenseNo" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ambulance_vehicleNo_key" ON "public"."Ambulance"("vehicleNo");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "public"."Driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNo_key" ON "public"."Driver"("licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_aadharNo_key" ON "public"."Driver"("aadharNo");
