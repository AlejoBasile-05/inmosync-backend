/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Made the column `number` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "number" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_number_key" ON "Client"("number");
