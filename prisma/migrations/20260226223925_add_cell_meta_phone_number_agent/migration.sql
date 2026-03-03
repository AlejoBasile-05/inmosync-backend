/*
  Warnings:

  - A unique constraint covering the columns `[metaPhoneNumber]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "metaPhoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Agent_metaPhoneNumber_key" ON "Agent"("metaPhoneNumber");
