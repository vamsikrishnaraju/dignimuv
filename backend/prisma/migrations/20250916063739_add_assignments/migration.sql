-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "shift" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "ambulanceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_date_idx" ON "public"."Assignment"("date");

-- CreateIndex
CREATE INDEX "Assignment_driverId_idx" ON "public"."Assignment"("driverId");

-- CreateIndex
CREATE INDEX "Assignment_ambulanceId_idx" ON "public"."Assignment"("ambulanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_date_shift_ambulanceId_key" ON "public"."Assignment"("date", "shift", "ambulanceId");

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "public"."Ambulance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
