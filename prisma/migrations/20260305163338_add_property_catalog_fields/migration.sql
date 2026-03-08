/*
  Warnings:

  - Added the required column `baths` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beds` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainImageUrl` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sqft` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('BUSY', 'FREE');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "baths" INTEGER NOT NULL,
ADD COLUMN     "beds" INTEGER NOT NULL,
ADD COLUMN     "mainImageUrl" TEXT NOT NULL,
ADD COLUMN     "sqft" INTEGER NOT NULL,
ADD COLUMN     "status" "PropertyStatus" NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
