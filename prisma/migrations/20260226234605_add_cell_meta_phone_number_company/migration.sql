/*
  Warnings:

  - You are about to drop the column `metaPhoneNumber` on the `Agent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[metaPhoneNumber]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Agent_metaPhoneNumber_key";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "metaPhoneNumber";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "metaPhoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_metaPhoneNumber_key" ON "Company"("metaPhoneNumber");
